[OPEN] Debug Session: live-site-outage

## Summary
- Symptom: deployed site at `https://qubiorchesto.unitdtechnologies.com/` is not working.
- Goal: identify whether the failure is caused by deployment asset loading, runtime API failures, router/base path issues, or browser-side exceptions.

## Initial Hypotheses
1. The deployed HTML references JS/CSS assets incorrectly, so the app shell loads but runtime bundles fail to initialize.
2. The live build is calling the wrong Strapi/API origin in production, causing homepage data requests to fail and leaving the page visually broken.
3. A production-only runtime exception occurs during hydration/render, preventing the app from mounting after the initial shell.
4. Deferred/lazy-loaded chunks are not being served correctly from the host, causing route or section rendering failures on the live site.
5. The hosting environment is missing SPA/static hosting rules or response headers, causing chunk fetches or route resolution to fail.

## Evidence Log
- `GET https://qubiorchesto.unitdtechnologies.com/` returned `200` and valid asset references, so the deployed HTML shell is healthy.
- Core JS assets on the live site returned `200 application/javascript`, so the outage is not caused by missing bundle files.
- `GET https://qubiadmin.unitdtechnologies.com/api/sections?...` returned data, but the response did not expose a usable browser-safe CORS policy for the live app origin.
- `GET https://qubiorchesto.unitdtechnologies.com/api/sections?...` returned `200` with the live origin in CORS headers, proving the live domain already has a working same-origin API proxy.
- The deployed production bundle contained hardcoded runtime calls to `https://qubiadmin.unitdtechnologies.com`, confirming the app was bypassing the working same-origin `/api` proxy.
- The rebuilt local production bundle now uses same-origin `/api/...` and `/uploads/...` paths instead of `https://qubiadmin.unitdtechnologies.com`.
- User reported runtime error: `Uncaught ReferenceError: can't access lexical declaration '$' before initialization` from `index.esm.js:441`.
- Built-chunk inspection showed `SEOHead`, `useSEO`, and `NotFound` chunks importing back into the main entry chunk, creating a bad initialization cycle.
- The cycle was consistent with the `react-helmet-async` crash site because Helmet-related chunks were initialized through that shared entry path.
- After isolating shared app runtime modules into a dedicated `app-runtime` chunk, rebuilt output shows `SEOHead` importing `app-runtime` instead of the main entry chunk.
- Post-fix chunk graph check shows only the route chunk importing the entry chunk; the problematic helper/runtime chunks no longer do.
- A later runtime report still pointed to `index.esm.js:441`, which maps to `react-helmet-async` reading `React.version`.
- The final fix removes `react-helmet-async` from the runtime path entirely and replaces it with a native document-head updater.
- Post-fix bundle inspection shows no references to `react-helmet-async`, `HelmetProvider`, `HelmetData`, or `index.esm.js` in the built JS output.
- Lighthouse run on `http://localhost:8081/` is hitting the Vite dev server, not the optimized production bundle.
- Evidence: the HTML includes `@react-refresh`, `/@vite/client`, and `/src/main.tsx`, which confirms dev-mode delivery.
- Therefore `Minify JavaScript`, `Reduce unused JavaScript`, and the `3.6 MB` payload from that localhost report are not valid indicators of production bundle health.

## Next Step
- Redeploy the new build and verify the live site renders without the lexical initialization error, then run Lighthouse against `preview` or the deployed site instead of the dev server.
