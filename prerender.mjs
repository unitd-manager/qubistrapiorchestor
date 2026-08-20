import puppeteer from "puppeteer";
import { createServer } from "http";
import handler from "serve-handler";
import fs from "fs/promises";
import path from "path";

const DIST_DIR = path.resolve("dist");
const PORT = 4173;

// List every route you want pre-rendered.
// Static routes go here directly. Dynamic ones (blog posts, etc.)
// get fetched from Strapi below and appended automatically.
const STATIC_ROUTES = ["/", "/demo", "/pricing", "/customers", "/resources", "/resources/blog", "/resources/newsroom"];

async function getDynamicRoutes() {
  // Pull blog documentIds from Strapi so each post gets its own prerendered
  // page too. Path must match the actual route: /resources/blog/:documentId
  try {
    const res = await fetch("http://127.0.0.1:1339/api/blogs?fields[0]=documentId&pagination[pageSize]=200");
    const json = await res.json();
    return (json.data ?? []).map((b) => `/resources/blog/${b.documentId ?? b.id}`);
  } catch {
    console.warn("Could not fetch dynamic blog routes, skipping.");
    return [];
  }
}

async function startStaticServer() {
  const server = createServer((req, res) => handler(req, res, { public: DIST_DIR }));
  await new Promise((resolve) => server.listen(PORT, resolve));
  return server;
}

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  const url = `http://localhost:${PORT}${route}`;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

  // If your components show a loading spinner while React Query fetches,
  // wait for a selector that only appears once real content is in.
  await page.waitForSelector("main", { timeout: 15000 }).catch(() => {});

  // Dump whatever React Query has cached client-side after fetches resolved,
  // so it can be replayed into the cache on hydration instead of refetched
  // and discarded. Requires window.__QUERY_CLIENT__ to be set (App.tsx,
  // only in "prerender" mode).
  const queryData = await page.evaluate(() => {
    const client = window.__QUERY_CLIENT__;
    if (!client) return null;
    const dump = {};
    for (const query of client.getQueryCache().getAll()) {
      if (query.state.data !== undefined) {
        dump[JSON.stringify(query.queryKey)] = query.state.data;
      }
    }
    return dump;
  });

  let html = await page.content(); // full rendered HTML including head tags from react-helmet-async

  if (queryData && Object.keys(queryData).length > 0) {
    const script = `<script>window.__REACT_QUERY_DATA__ = ${JSON.stringify(queryData)};</script>`;
    html = html.replace("</head>", `${script}</head>`);
  }

  await page.close();

  const outPath =
    route === "/"
      ? path.join(DIST_DIR, "index.html")
      : path.join(DIST_DIR, route, "index.html");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, html);
  console.log(`✓ Prerendered ${route} -> ${outPath}`);
}

async function main() {
  const server = await startStaticServer();
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const dynamicRoutes = await getDynamicRoutes();
  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];

  for (const route of allRoutes) {
    try {
      await prerenderRoute(browser, route);
    } catch (err) {
      console.error(`✗ Failed to prerender ${route}:`, err.message);
    }
  }

  await browser.close();
  server.close();
}

main();