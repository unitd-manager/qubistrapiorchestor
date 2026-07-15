import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "node:fs/promises";
import { componentTagger } from "lovable-tagger";
import { injectBootstrapIntoHtml, loadBootstrapData } from "./vite.bootstrap";

type HtmlSeoData = {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLD?: Record<string, unknown> | null;
};

type SitemapEntry = {
  loc: string;
  lastmod?: string;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickList = (body: unknown): unknown[] => {
  if (!isObject(body)) return [];
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.results)) return body.results;

  if (isObject(body.data)) {
    if (Array.isArray(body.data.data)) return body.data.data;
    if (Array.isArray(body.data.results)) return body.data.results;
  }

  return [];
};

const getSeoObject = (value: unknown): Record<string, unknown> | null => {
  if (!isObject(value)) return null;
  if ("attributes" in value && isObject((value as { attributes?: unknown }).attributes)) {
    return (value as { attributes: Record<string, unknown> }).attributes;
  }
  if (
    "data" in value &&
    isObject((value as { data?: unknown }).data) &&
    "attributes" in (value as { data: Record<string, unknown> }).data &&
    isObject(((value as { data: Record<string, unknown> }).data as { attributes?: unknown }).attributes)
  ) {
    return ((value as { data: Record<string, unknown> }).data as { attributes: Record<string, unknown> }).attributes;
  }
  return value;
};

const pickString = (obj: Record<string, unknown> | null, keys: string[]): string | undefined => {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
};

const sanitizeTextValue = (value?: string): string | undefined => {
  if (!value) return undefined;
  const cleaned = value.trim().replace(/`/g, "").trim();
  return cleaned || undefined;
};

const sanitizeUrlValue = (value?: string): string | undefined => {
  const cleaned = sanitizeTextValue(value);
  if (!cleaned) return undefined;
  return cleaned.replace(/^["']+/, "").replace(/["']+$/, "").trim() || undefined;
};

const getMediaUrlValue = (strapiBase: string, value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") {
    const cleaned = sanitizeUrlValue(value);
    if (!cleaned) return undefined;
    return cleaned.startsWith("http") ? cleaned : `${strapiBase}${cleaned}`;
  }
  if (isObject(value) && typeof value.url === "string") {
    const cleaned = sanitizeUrlValue(value.url);
    if (!cleaned) return undefined;
    return cleaned.startsWith("http") ? cleaned : `${strapiBase}${cleaned}`;
  }
  if (
    isObject(value) &&
    "attributes" in value &&
    isObject((value as { attributes?: unknown }).attributes) &&
    typeof (value as { attributes: Record<string, unknown> }).attributes.url === "string"
  ) {
    const cleaned = sanitizeUrlValue((value as { attributes: Record<string, unknown> }).attributes.url as string);
    if (!cleaned) return undefined;
    return cleaned.startsWith("http") ? cleaned : `${strapiBase}${cleaned}`;
  }
  return undefined;
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildAbsoluteUrl = (siteUrl: string, route: string): string => {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");
  const normalizedRoute = route === "/" ? "/" : `/${route.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  return normalizedRoute === "/" ? `${normalizedSiteUrl}/` : `${normalizedSiteUrl}${normalizedRoute}`;
};

const buildSitemapXml = (entries: SitemapEntry[]): string => {
  const lines = entries.map((entry) => {
    const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
    if (entry.lastmod) {
      parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }
    return ["  <url>", ...parts, "  </url>"].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...lines,
    "</urlset>",
    "",
  ].join("\n");
};

const extractPageSeo = (item: unknown, strapiBase: string): HtmlSeoData | null => {
  if (!isObject(item)) return null;

  const attrs =
    "attributes" in item && isObject((item as { attributes?: unknown }).attributes)
      ? (item as { attributes: Record<string, unknown> }).attributes
      : item;
  const seo = getSeoObject((attrs as { seo?: unknown }).seo);

  if (!seo) return null;

  const title = sanitizeTextValue(pickString(seo, ["metaTitle", "meta_title", "title", "metaTitleText"]));
  const description = sanitizeTextValue(pickString(seo, ["metaDescription", "meta_description", "description"]));
  const canonical = sanitizeUrlValue(pickString(seo, ["canonicalURL", "canonical_url", "canonical", "canonicalUrl"]));
  const ogTitle = sanitizeTextValue(pickString(seo, ["ogTitle", "og_title"])) || title;
  const ogDescription = sanitizeTextValue(pickString(seo, ["ogDescription", "og_description"])) || description;
  const ogImageRaw = seo?.ogImage ?? seo?.og_image ?? seo?.metaImage ?? seo?.meta_image;
  const ogImage = getMediaUrlValue(strapiBase, ogImageRaw);
  const twitterCard = sanitizeTextValue(pickString(seo, ["twitterCard", "twitter_card"])) || "summary_large_image";
  const twitterTitle = sanitizeTextValue(pickString(seo, ["twitterTitle", "twitter_title"])) || ogTitle || title;
  const twitterDescription =
    sanitizeTextValue(pickString(seo, ["twitterDescription", "twitter_description"])) || ogDescription || description;
  const twitterImage = getMediaUrlValue(strapiBase, seo?.twitterImage ?? seo?.twitter_image ?? ogImageRaw) || ogImage;
  const rawSchema = seo.schema;
  let jsonLD: Record<string, unknown> | null = null;
  if (isObject(rawSchema)) {
    jsonLD = rawSchema;
  } else if (typeof rawSchema === "string") {
    try {
      const parsed = JSON.parse(rawSchema);
      jsonLD = isObject(parsed) ? parsed : null;
    } catch {
      jsonLD = null;
    }
  }

  return {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    jsonLD,
  };
};

const upsertMetaTagByName = (html: string, name: string, content: string) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<meta\\s+name=["']${escapedName}["'][^>]*>`, "i");
  if (re.test(html)) {
    return html.replace(re, `<meta name="${name}" content="${content}">`);
  }
  return html.replace("</head>", `  <meta name="${name}" content="${content}">\n</head>`);
};

const upsertMetaTagByProperty = (html: string, property: string, content: string) => {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<meta\\s+property=["']${escapedProperty}["'][^>]*>`, "i");
  if (re.test(html)) {
    return html.replace(re, `<meta property="${property}" content="${content}">`);
  }
  return html.replace("</head>", `  <meta property="${property}" content="${content}">\n</head>`);
};

const upsertCanonical = (html: string, href: string) => {
  const re = /<link\s+rel=["']canonical["'][^>]*>/i;
  if (re.test(html)) {
    return html.replace(re, `<link rel="canonical" href="${href}">`);
  }
  return html.replace("</head>", `  <link rel="canonical" href="${href}">\n</head>`);
};

const upsertJsonLd = (html: string, schema: Record<string, unknown>) => {
  const json = JSON.stringify(schema).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const script = `  <script type="application/ld+json" data-static-seo-schema="true">${json}</script>\n`;
  const re = /\s*<script\s+type=["']application\/ld\+json["'][^>]*data-static-seo-schema=["']true["'][^>]*>[\s\S]*?<\/script>/i;
  if (re.test(html)) {
    return html.replace(re, `\n${script}`);
  }
  return html.replace("</head>", `${script}</head>`);
};

const applySeoToHtml = (html: string, seo: HtmlSeoData) => {
  let out = html;
  out = out.replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*data-static-seo-schema=["']true["'][^>]*>[\s\S]*?<\/script>/i, "");
  if (seo.title) {
    if (/<title>.*<\/title>/i.test(out)) out = out.replace(/<title>.*<\/title>/i, `<title>${seo.title}</title>`);
    else out = out.replace("</head>", `  <title>${seo.title}</title>\n</head>`);
  }
  if (seo.description) out = upsertMetaTagByName(out, "description", seo.description);
  if (seo.canonical) {
    out = upsertCanonical(out, seo.canonical);
    out = upsertMetaTagByProperty(out, "og:url", seo.canonical);
  }
  if (seo.ogTitle) out = upsertMetaTagByProperty(out, "og:title", seo.ogTitle);
  if (seo.ogDescription) out = upsertMetaTagByProperty(out, "og:description", seo.ogDescription);
  if (seo.ogImage) out = upsertMetaTagByProperty(out, "og:image", seo.ogImage);
  if (seo.twitterCard) out = upsertMetaTagByName(out, "twitter:card", seo.twitterCard);
  if (seo.twitterTitle) out = upsertMetaTagByName(out, "twitter:title", seo.twitterTitle);
  if (seo.twitterDescription) out = upsertMetaTagByName(out, "twitter:description", seo.twitterDescription);
  if (seo.twitterImage) out = upsertMetaTagByName(out, "twitter:image", seo.twitterImage);
  if (seo.jsonLD) out = upsertJsonLd(out, seo.jsonLD);
  return out;
};

function dynamicSeoHtmlPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "");
  const strapiBase = (env.VITE_STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");
  const siteUrl = sanitizeUrlValue(env.VITE_APP_URL) || "http://localhost:8080";

  const cache = new Map<string, HtmlSeoData>();
  let bootstrapPromise: Promise<Awaited<ReturnType<typeof loadBootstrapData>>> | null = null;

  const fetchBootstrap = () => {
    if (!bootstrapPromise) {
      bootstrapPromise = loadBootstrapData({ siteUrl, strapiBase }).catch(() => ({}));
    }
    return bootstrapPromise;
  };

  const fetchSeo = async (slug: string) => {
    if (cache.has(slug)) return cache.get(slug)!;

    const slugsToTry = slug === "/" ? ["/", "/home", "home"] : slug === "/home" ? ["/home", "/", "home"] : [slug];
    const urls = slugsToTry.flatMap((entry) => [
      `${strapiBase}/api/pages?filters[slug][$eq]=${encodeURIComponent(entry)}`,
      `${strapiBase}/api/pages?filters[slug][$eq]=${encodeURIComponent(entry)}&populate[seo]=*`,
      `${strapiBase}/api/pages?filters[slug][$eq]=${encodeURIComponent(entry)}&populate=seo`,
    ]);

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) continue;
        const body = (await res.json()) as unknown;
        const items = pickList(body);

        const item = items[0] ?? null;
        const result = extractPageSeo(item, strapiBase) ?? {};

        cache.set(slug, result);
        return result;
      } catch {
        continue;
      }
    }

    const empty = {};
    cache.set(slug, empty);
    return empty;
  };

  return {
    name: "dynamic-seo-html",
    apply: "serve",
    transformIndexHtml: {
      order: "pre",
      async handler(html, ctx) {
        const url = ctx?.originalUrl || "/";
        const pathname = new URL(url, "http://local").pathname;
        const slug = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
        const seo = await fetchSeo(slug);
        const bootstrap = await fetchBootstrap();
        return injectBootstrapIntoHtml(applySeoToHtml(html, seo), bootstrap, { preloadHero: slug === "/", routePath: slug });
      },
    },
  };
}

function prerenderSeoHtmlPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "");
  const strapiBase = (env.VITE_STRAPI_URL || "http://localhost:1338").replace(/\/$/, "");
  const siteUrl = sanitizeUrlValue(env.VITE_APP_URL) || "http://localhost:8080";

  const fallbackRoutes = [
    "/solutions/use-cases",
    "/solutions/industries",
    "/customers",
    "/pricing",
    "/resources/blog",
    "/resources/demo",
    "/resources/newsroom",
    "/resources/faqs",
  ];

  const fetchSeo = async (slug: string) => {
    const slugsToTry = slug === "/" ? ["/", "/home", "home"] : slug === "/home" ? ["/home", "/", "home"] : [slug];
    const urls = slugsToTry.flatMap((entry) => [
      `${strapiBase}/api/pages?filters[slug][$eq]=${encodeURIComponent(entry)}`,
      `${strapiBase}/api/pages?filters[slug][$eq]=${encodeURIComponent(entry)}&populate[seo]=*`,
      `${strapiBase}/api/pages?filters[slug][$eq]=${encodeURIComponent(entry)}&populate=seo`,
    ]);

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) continue;
        const body = (await res.json()) as unknown;
        const items = pickList(body);

        const item = items[0] ?? null;
        return extractPageSeo(item, strapiBase) ?? {};
      } catch {
        continue;
      }
    }
    return {};
  };

  const fetchAllPageSlugs = async (): Promise<string[]> => {
    const slugs: string[] = [];
    const seen = new Set<string>();

    const pickPagination = (body: unknown): { page: number; pageSize: number; pageCount: number; total: number } | null => {
      if (typeof body !== "object" || body === null) return null;
      const anyBody = body as any;
      const pag = anyBody?.meta?.pagination ?? anyBody?.pagination;
      if (!pag || typeof pag !== "object") return null;
      const page = Number(pag.page ?? 1) || 1;
      const pageSize = Number(pag.pageSize ?? 100) || 100;
      const pageCount = Number(pag.pageCount ?? 1) || 1;
      const total = Number(pag.total ?? 0) || 0;
      return { page, pageSize, pageCount, total };
    };

    const pageSize = 100;
    let page = 1;
    let pageCount = 1;

    while (page <= pageCount) {
      const url = `${strapiBase}/api/pages?pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) break;
      const body = (await res.json()) as unknown;

      const items = pickList(body);
      for (const item of items) {
        if (!isObject(item)) continue;
        const rawSlug = item.slug ?? (isObject(item.attributes) ? item.attributes.slug : undefined);
        if (typeof rawSlug !== "string" || !rawSlug.trim()) continue;
        const normalized = rawSlug.startsWith("/") ? rawSlug : `/${rawSlug}`;
        if (!seen.has(normalized)) {
          seen.add(normalized);
          slugs.push(normalized);
        }
      }

      const pagination = pickPagination(body);
      pageCount = pagination?.pageCount ?? pageCount;
      page += 1;
    }

    return slugs;
  };

  const fetchRedirects = async (): Promise<Array<{ from: string; to: string; type?: string; isActive?: boolean }>> => {
    const urls = [
      `${strapiBase}/api/redirects?filters[isActive][$eq]=true&pagination[limit]=1000`,
      `${strapiBase}/api/redirects?pagination[limit]=1000`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) continue;
        const body = (await res.json()) as unknown;

        const items =
          (typeof body === "object" && body !== null && Array.isArray((body as any).data) && (body as any).data) ||
          (typeof body === "object" && body !== null && Array.isArray((body as any).results) && (body as any).results) ||
          [];

        const rules: Array<{ from: string; to: string; type?: string; isActive?: boolean }> = [];
        for (const item of items) {
          if (typeof item !== "object" || item === null) continue;
          const anyItem = item as any;
          const attrs = (anyItem.attributes && typeof anyItem.attributes === "object" && anyItem.attributes) || anyItem;
          const from = attrs.from;
          const to = attrs.to;
          if (typeof from !== "string" || typeof to !== "string") continue;
          rules.push({ from, to, type: attrs.type, isActive: attrs.isActive });
        }

        return rules;
      } catch {
        continue;
      }
    }

    return [];
  };

  const normalizePathname = (value: string): string | null => {
    const raw = sanitizeUrlValue(value);
    if (!raw) return null;
    let pathname = raw;
    if (/^https?:\/\//i.test(raw)) {
      try {
        pathname = new URL(raw).pathname;
      } catch {
        return null;
      }
    }
    if (!pathname.startsWith("/")) pathname = `/${pathname}`;
    pathname = pathname.replace(/\/+$/, "");
    return pathname || "/";
  };

  return {
    name: "prerender-seo-html",
    apply: "build",
    async closeBundle() {
      const distDir = path.resolve(process.cwd(), "dist");
      const baseIndexPath = path.join(distDir, "index.html");
      const baseHtml = await fs.readFile(baseIndexPath, "utf8");
      const buildDate = new Date().toISOString();
      const bootstrap = await loadBootstrapData({ siteUrl, strapiBase }).catch(() => ({}));

      const slugsFromStrapi = await fetchAllPageSlugs().catch(() => []);
      const routesToGenerate = Array.from(new Set(["/", ...fallbackRoutes, ...slugsFromStrapi]));

      const homeSeo = await fetchSeo("/");
      const homeHtml = injectBootstrapIntoHtml(applySeoToHtml(baseHtml, homeSeo), bootstrap, {
        preloadHero: true,
        routePath: "/",
      });
      await fs.writeFile(baseIndexPath, homeHtml, "utf8");

      for (const route of routesToGenerate) {
        if (route === "/") continue;
        const seo = await fetchSeo(route);
        const html = injectBootstrapIntoHtml(applySeoToHtml(baseHtml, seo), bootstrap, { routePath: route });
        const outDir = path.join(distDir, route.replace(/^\//, ""));
        await fs.mkdir(outDir, { recursive: true });
        await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
      }

      const sitemapXml = buildSitemapXml(
        routesToGenerate.map((route) => ({
          loc: buildAbsoluteUrl(siteUrl, route),
          lastmod: buildDate,
        })),
      );
      await fs.writeFile(path.join(distDir, "sitemap.xml"), sitemapXml, "utf8");

      const redirects = await fetchRedirects().catch(() => []);
      for (const rule of redirects) {
        const fromPath = normalizePathname(rule.from);
        if (!fromPath || fromPath === "/") continue;
        const toUrl = sanitizeUrlValue(rule.to);
        if (!toUrl) continue;

        const redirectHtml = baseHtml.replace(
          "</head>",
          `  <meta http-equiv="refresh" content="0; url=${toUrl}">\n  <link rel="canonical" href="${toUrl}">\n  <script>window.location.replace(${JSON.stringify(toUrl)});</script>\n</head>`,
        );

        const outDir = path.join(distDir, fromPath.replace(/^\//, ""));
        await fs.mkdir(outDir, { recursive: true });
        await fs.writeFile(path.join(outDir, "index.html"), redirectHtml, "utf8");
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const strapiProxyTarget = (env.VITE_STRAPI_URL || "https://qubiadmin.unitdtechnologies.com").replace(/\/$/, "");

  return {
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: strapiProxyTarget,
        changeOrigin: true,
      },
      "/uploads": {
        target: strapiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    dynamicSeoHtmlPlugin(mode),
    prerenderSeoHtmlPlugin(mode),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (
            normalizedId.includes("/src/lib/strapi-api.ts") ||
            normalizedId.includes("/src/lib/urls.ts") ||
            normalizedId.includes("/src/hooks/useSEO.ts") ||
            normalizedId.includes("/src/hooks/use404Tracking.ts") ||
            normalizedId.includes("/src/hooks/useRedirects.ts")
          ) {
            return "app-runtime";
          }

          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) {
            return "react-core";
          }

          if (id.includes("@tanstack/react-query") || id.includes("axios")) {
            return "data";
          }

          if (id.includes("@radix-ui") || id.includes("sonner") || id.includes("vaul") || id.includes("cmdk")) {
            return "ui";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          return "vendor";
        },
      },
    },
  },
  };
});
