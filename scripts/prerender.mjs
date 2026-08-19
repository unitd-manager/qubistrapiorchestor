import puppeteer from "puppeteer";
import { createServer } from "http";
import handler from "serve-handler";
import fs from "fs/promises";
import path from "path";

const DIST_DIR = path.resolve("dist");
const PORT = 4173;

// List every route you want pre-rendered.
// Static routes go here directly. Dynamic ones (blog slugs, etc.)
// get fetched from Strapi below and appended automatically.
const STATIC_ROUTES = ["/", "/demo", "/pricing", "/customers", "/resources"];

async function getDynamicRoutes() {
  // Example: pull blog slugs from Strapi so each post gets its own
  // prerendered page too. Adjust the endpoint/shape to match your API.
  try {
    const res = await fetch("http://127.0.0.1:1339/api/blogs?fields[0]=slug&pagination[pageSize]=200");
    const json = await res.json();
    return (json.data ?? []).map((b) => `/blog/${b.slug}`);
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
  // wait for a selector that only appears once real content is in —
  // adjust this selector to something reliably present on every page,
  // e.g. your <main> content wrapper or a specific heading.
  await page.waitForSelector("main", { timeout: 15000 }).catch(() => {});

  const html = await page.content(); // full rendered HTML including head tags from react-helmet-async

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
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
  ],
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