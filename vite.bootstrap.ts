import { buildHomeSeoContentMarkup, sanitizeSeoContentHtml } from "./src/lib/seo-content";

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type NavbarLink = {
  label: string;
  href: string;
};

type NavbarSection = {
  title: string;
  items: NavbarLink[];
  href?: string;
};

type SeoMetadata = {
  id: string;
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
};

type HeroImageSource = {
  src: string;
  width: number;
};

type HeroImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  sources: HeroImageSource[];
};

type BootstrapData = {
  navbar?: NavbarSection[];
  routes?: Record<
    string,
    {
      seo?: {
        metadata: SeoMetadata;
        jsonLD?: JsonObject | null;
      };
      home?: {
        hero?: {
          badge: string;
          heading: string;
          subheading: string;
          ctaLabel: string;
          ctaUrl: string;
          image?: HeroImage;
        };
        demo?: {
          videoTitle: string;
          videoDuration: string;
        };
        seoContentHtml?: string;
      };
    }
  >;
};

type LoadBootstrapOptions = {
  siteUrl: string;
  strapiBase: string;
};

const HERO_IMAGE_SIZES = "(min-width: 1024px) 50vw, (min-width: 640px) 90vw, 100vw";
const DEFAULT_HERO_ALT =
  "qubi platform orchestration diagram showing AI agents, workflows, integrations, and analytics";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickList = (body: unknown): Record<string, unknown>[] => {
  if (!isObject(body)) return [];
  if (Array.isArray(body.data)) return body.data.filter(isObject);
  if (Array.isArray(body.results)) return body.results.filter(isObject);

  if (isObject(body.data)) {
    if (Array.isArray(body.data.data)) return body.data.data.filter(isObject);
    if (Array.isArray(body.data.results)) return body.data.results.filter(isObject);
  }

  return [];
};

const sanitizeTextValue = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const cleaned = value.trim().replace(/`/g, "").trim();
  return cleaned || undefined;
};

const sanitizeUrlValue = (value?: string | null): string | undefined => {
  const cleaned = sanitizeTextValue(value);
  if (!cleaned) return undefined;
  return cleaned.replace(/^["']+/, "").replace(/["']+$/, "").trim() || undefined;
};

const toAbsoluteUrl = (siteUrl: string, value?: string | null) => {
  const cleaned = sanitizeUrlValue(value);
  if (!cleaned) return undefined;

  try {
    return new URL(cleaned).toString();
  } catch {
    return new URL(cleaned.startsWith("/") ? cleaned : `/${cleaned}`, `${siteUrl.replace(/\/$/, "")}/`).toString();
  }
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

const getMediaUrl = (strapiBase: string, media: unknown): string | undefined => {
  const assetBase = strapiBase.replace(/\/$/, "");
  if (!media) return undefined;
  if (typeof media === "string") {
    const cleaned = sanitizeUrlValue(media);
    if (!cleaned) return undefined;
    return cleaned.startsWith("http") ? cleaned : `${assetBase}${cleaned}`;
  }
  if (isObject(media) && typeof media.url === "string") {
    const cleaned = sanitizeUrlValue(media.url);
    if (!cleaned) return undefined;
    return cleaned.startsWith("http") ? cleaned : `${assetBase}${cleaned}`;
  }
  if (
    isObject(media) &&
    "attributes" in media &&
    isObject((media as { attributes?: unknown }).attributes) &&
    typeof (media as { attributes: Record<string, unknown> }).attributes.url === "string"
  ) {
    const url = sanitizeUrlValue((media as { attributes: Record<string, unknown> }).attributes.url as string);
    if (!url) return undefined;
    return url.startsWith("http") ? url : `${assetBase}${url}`;
  }
  return undefined;
};

const sanitizeJsonValue = (value: JsonValue): JsonValue => {
  if (typeof value === "string") {
    return sanitizeTextValue(value) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeJsonValue(entry));
  }
  if (isObject(value)) {
    const out: JsonObject = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = sanitizeJsonValue(entry as JsonValue);
    }
    return out;
  }
  return value;
};

const getSeoSchema = (item: Record<string, unknown>): JsonObject | null => {
  const attrs = isObject(item.attributes) ? item.attributes : item;
  const seo = getSeoObject((attrs as { seo?: unknown }).seo);
  if (!seo) return null;

  const rawSchema = seo.schema;
  if (isObject(rawSchema)) return sanitizeJsonValue(rawSchema as JsonValue) as JsonObject;
  if (typeof rawSchema === "string") {
    try {
      const parsed = JSON.parse(rawSchema);
      return isObject(parsed) ? (sanitizeJsonValue(parsed as JsonValue) as JsonObject) : null;
    } catch {
      return null;
    }
  }

  return null;
};

const buildSeoMetadata = (item: Record<string, unknown> | null, path: string, siteUrl: string, strapiBase: string): SeoMetadata => {
  const attrs = item && isObject(item.attributes) ? item.attributes : item ?? {};
  const seo = getSeoObject((attrs as { seo?: unknown }).seo);

  const title =
    sanitizeTextValue(pickString(seo, ["metaTitle", "meta_title", "title", "metaTitleText"])) ||
    sanitizeTextValue((attrs as { title?: string }).title) ||
    "Qubi Flow Orchestrator";
  const description =
    sanitizeTextValue(pickString(seo, ["metaDescription", "meta_description", "description"])) ||
    "Enterprise workflow orchestration platform";
  const keywords = sanitizeTextValue(pickString(seo, ["keywords", "metaKeywords", "meta_keywords", "meta_keyword"]));
  const canonical = toAbsoluteUrl(siteUrl, pickString(seo, ["canonicalURL", "canonical_url", "canonical", "canonicalUrl"]));
  const ogTitle = sanitizeTextValue(pickString(seo, ["ogTitle", "og_title"])) || title;
  const ogDescription = sanitizeTextValue(pickString(seo, ["ogDescription", "og_description"])) || description;
  const ogImageRaw = seo?.ogImage ?? seo?.og_image ?? seo?.metaImage ?? seo?.meta_image;
  const ogImage = getMediaUrl(strapiBase, ogImageRaw);
  const twitterCard = sanitizeTextValue(pickString(seo, ["twitterCard", "twitter_card"])) || "summary_large_image";
  const twitterTitle = sanitizeTextValue(pickString(seo, ["twitterTitle", "twitter_title"])) || ogTitle;
  const twitterDescription =
    sanitizeTextValue(pickString(seo, ["twitterDescription", "twitter_description"])) || ogDescription;
  const twitterImage = getMediaUrl(strapiBase, seo?.twitterImage ?? seo?.twitter_image ?? ogImageRaw) || ogImage;

  return {
    id: path,
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogType: "website",
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    canonical,
    robots: "index, follow",
  };
};

const stripHtml = (value?: string | null) =>
  value
    ? value
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .trim()
    : "";

const buildHeroImage = (strapiBase: string, image: unknown): HeroImage | undefined => {
  if (!isObject(image) || typeof image.url !== "string") {
    return undefined;
  }

  const formats = isObject(image.formats) ? image.formats : {};
  const variants = Object.values(formats)
    .filter((format): format is Record<string, unknown> => isObject(format) && typeof format.url === "string")
    .map((format) => ({
      src: getMediaUrl(strapiBase, format.url) ?? "",
      width: typeof format.width === "number" ? format.width : 0,
    }))
    .filter((format) => format.src && format.width > 0)
    .sort((a, b) => a.width - b.width);

  const baseWidth = typeof image.width === "number" ? image.width : variants[variants.length - 1]?.width ?? 1024;
  const baseSource = {
    src: getMediaUrl(strapiBase, image.url) ?? "",
    width: baseWidth,
  };
  const sources = [...variants, baseSource].filter(
    (source, index, allSources) => source.src && allSources.findIndex((candidate) => candidate.width === source.width) === index,
  );
  const preferredSource =
    sources.find((source) => source.width >= 1000) ??
    sources.find((source) => source.width >= 750) ??
    sources[sources.length - 1];

  if (!preferredSource?.src) {
    return undefined;
  }

  return {
    src: preferredSource.src,
    alt: (typeof image.alternativeText === "string" && image.alternativeText) || DEFAULT_HERO_ALT,
    width: typeof image.width === "number" ? image.width : 1024,
    height: typeof image.height === "number" ? image.height : 576,
    sizes: HERO_IMAGE_SIZES,
    sources,
  };
};

const fetchJson = async (url: string) => {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return (await response.json()) as unknown;
};

const fetchFirstItem = async (url: string) => {
  const body = await fetchJson(url);
  return pickList(body)[0] ?? null;
};

const fetchFirstMatchingPage = async (strapiBase: string, slugs: string[]) => {
  for (const slug of slugs) {
    try {
      const item = await fetchFirstItem(
        `${strapiBase}/api/pages?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}`
      );
      if (item) return item;
    } catch {
      continue;
    }
  }

  return null;
};

const loadNavbarData = async (strapiBase: string): Promise<NavbarSection[]> => {
  const [sectionsBody, categoriesBody] = await Promise.all([
    fetchJson(
      `${strapiBase}/api/sections?filters[published][$eq]=true&filters[show_in_nav][$eq]=true&sort[0]=sort_order:asc&pagination[pageSize]=100`
    ),
    fetchJson(
      `${strapiBase}/api/categories?filters[published][$eq]=true&filters[show_in_nav][$eq]=true&sort[0]=sort_order:asc&pagination[pageSize]=100`
    ),
  ]);

  const sections = pickList(sectionsBody);
  const categories = pickList(categoriesBody);
  const itemsBySection = new Map<number, NavbarLink[]>();

  for (const category of categories) {
    const sectionId = typeof category.section_id === "number" ? category.section_id : null;
    const label = typeof category.category_title === "string" ? category.category_title : "";
    const href =
      sanitizeUrlValue(
        (typeof category.internal_link === "string" && category.internal_link) ||
          (typeof category.external_link === "string" && category.external_link) ||
          ""
      ) ||
      "";

    if (!sectionId || !label || !href) continue;

    const items = itemsBySection.get(sectionId) ?? [];
    items.push({ label, href });
    itemsBySection.set(sectionId, items);
  }

  return sections.reduce<NavbarSection[]>((acc, section) => {
    if (typeof section.id !== "number" || typeof section.section_title !== "string") {
      return acc;
    }

    const items = itemsBySection.get(section.id) ?? [];
    if (items.length > 0) {
      acc.push({
        title: section.section_title,
        items,
      });
      return acc;
    }

    const href =
      sanitizeUrlValue(
        (typeof section.internal_link === "string" && section.internal_link) ||
          (typeof section.external_link === "string" && section.external_link) ||
          ""
      ) ||
      "";
    if (href) {
      acc.push({
        title: section.section_title,
        items: [],
        href,
      });
    }

    return acc;
  }, []);
};

export const loadBootstrapData = async ({ siteUrl, strapiBase }: LoadBootstrapOptions): Promise<BootstrapData> => {
  const [navbar, heroSection, demoSection, homePage] = await Promise.all([
    loadNavbarData(strapiBase).catch(() => []),
    fetchFirstItem(
      `${strapiBase}/api/sections?populate=images&filters[published][$eq]=true&filters[section_type][$eq]=hero&sort[0]=sort_order:asc&pagination[pageSize]=1`
    ).catch(() => null),
    fetchFirstItem(
      `${strapiBase}/api/sections?filters[published][$eq]=true&filters[section_type][$eq]=demo_video_section&sort[0]=sort_order:asc&pagination[pageSize]=1`
    ).catch(() => null),
    fetchFirstMatchingPage(strapiBase, ["/", "/home", "home"]).catch(() => null),
  ]);

  const heroImage = buildHeroImage(
    strapiBase,
    isObject(heroSection) && Array.isArray(heroSection.images) ? heroSection.images[0] : undefined,
  );
  const hero =
    heroSection && isObject(heroSection)
      ? {
          badge: (typeof heroSection.template === "string" && heroSection.template) || "Agentic Automation Platform",
          heading:
            (typeof heroSection.section_title === "string" && heroSection.section_title) ||
            "Design and orchestrate enterprise workflows with qubi",
          subheading:
            stripHtml(typeof heroSection.description === "string" ? heroSection.description : undefined) ||
            "Connect AI agents, business systems, and human approvals in one enterprise orchestration layer.",
          ctaLabel: (typeof heroSection.display_type === "string" && heroSection.display_type) || "Book a Demo",
          ctaUrl:
            sanitizeUrlValue(typeof heroSection.external_link === "string" ? heroSection.external_link : undefined) ||
            "https://meetings.hubspot.com/maheshv",
          image: heroImage,
        }
      : undefined;

  const demo =
    demoSection && isObject(demoSection)
      ? {
          videoTitle:
            (typeof demoSection.section_title === "string" && demoSection.section_title) || "qubi Platform Full Demo",
          videoDuration:
            (typeof demoSection.description === "string" && demoSection.description) ||
            "12 minutes End-to-end execution walkthrough",
        }
      : undefined;
  const seoContentHtml =
    homePage && isObject(homePage) && typeof homePage.content === "string"
      ? sanitizeSeoContentHtml(homePage.content)
      : "";

  const homeRouteData = {
    seo: {
      metadata: buildSeoMetadata(homePage, "/", siteUrl, strapiBase),
      jsonLD: homePage && isObject(homePage) ? getSeoSchema(homePage) : null,
    },
    home: {
      hero,
      demo,
      seoContentHtml,
    },
  };

  return {
    navbar,
    routes: {
      "/": homeRouteData,
      "/home": homeRouteData,
    },
  };
};

const escapeHtmlAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeHtmlText = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isPathActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

const renderChevronDownIcon = () =>
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>';

const renderMenuIcon = () =>
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>';

const renderArrowRightIcon = () =>
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';

const renderPlayIcon = () =>
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play text-primary ml-1"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';

const buildHeroHeadingMarkup = (heading: string) => {
  const splitIndex = heading.indexOf("qubi");
  if (splitIndex === -1) return escapeHtmlText(heading);

  const before = escapeHtmlText(heading.slice(0, splitIndex));
  const after = escapeHtmlText(heading.slice(splitIndex + 4));
  return `${before}<span class="text-gradient">qubi</span>${after}`;
};

const buildNavbarMarkup = (navbar: NavbarSection[] | undefined, routePath: string) => {
  const navSections = navbar ?? [];
  const desktopItems = navSections
    .map((section) => {
      if (section.href) {
        const className = isPathActive(routePath, section.href)
          ? "text-sm font-medium transition-colors text-primary"
          : "text-sm font-medium transition-colors text-muted-foreground hover:text-primary";
        return `<a href="${escapeHtmlAttribute(section.href)}" class="${className}">${escapeHtmlText(section.title)}</a>`;
      }

      const isActive = section.items.some((item) => isPathActive(routePath, item.href));
      const className = isActive
        ? "flex items-center gap-1 text-sm font-medium transition-colors text-primary"
        : "flex items-center gap-1 text-sm font-medium transition-colors text-muted-foreground hover:text-primary";
      return `<div class="relative"><button class="${className}" aria-expanded="false" aria-haspopup="menu" aria-label="${escapeHtmlAttribute(`${section.title} menu`)}" type="button">${escapeHtmlText(section.title)}${renderChevronDownIcon()}</button></div>`;
    })
    .join("");

  return `<nav class="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div class="container mx-auto flex items-center justify-between h-[76px] px-4 lg:px-8">
        <a href="/" class="flex items-center gap-2" aria-label="Qubi Flow Orchestrator home">
          <img src="/src/assets/qubi-logo.png" alt="Qubi Flow Orchestrator" width="120" height="100" class="h-14 lg:h-16 w-auto">
        </a>
        <div class="hidden md:flex items-center gap-8">${desktopItems}</div>
        <div class="hidden md:block">
          <a href="https://meetings.hubspot.com/maheshv" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold text-base h-11 rounded-md px-8">Book a Demo</a>
        </div>
        <button class="md:hidden p-2 text-foreground" aria-expanded="false" aria-controls="mobile-navigation" aria-label="Open navigation menu" type="button">${renderMenuIcon()}</button>
      </div>
    </nav>`;
};

const buildHeroMarkup = (hero: BootstrapData["routes"] extends Record<string, infer Route> ? Route extends { home?: infer Home } ? Home extends { hero?: infer Hero } ? Hero : never : never : never) => {
  if (!hero) return "";

  const srcSet = hero.image?.sources.map((source) => `${source.src} ${source.width}w`).join(", ");
  const heroImageMarkup = hero.image?.src
    ? `<div class="animate-fade-up-delay-2 relative">
            <div class="relative rounded-2xl overflow-hidden shadow-card-hover">
              <img src="${escapeHtmlAttribute(hero.image.src)}"${srcSet ? ` srcset="${escapeHtmlAttribute(srcSet)}"` : ""}${
                hero.image.sizes ? ` sizes="${escapeHtmlAttribute(hero.image.sizes)}"` : ""
              } alt="${escapeHtmlAttribute(hero.image.alt)}" width="${hero.image.width}" height="${hero.image.height}" class="w-full h-auto rounded-2xl" fetchpriority="high" loading="eager" decoding="async">
              <div class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/20"></div>
            </div>
          </div>`
    : '<div class="animate-fade-up-delay-2 relative"></div>';

  return `<section class="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      <div class="absolute inset-0 bg-gradient-glow pointer-events-none"></div>
      <div class="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div class="max-w-2xl">
            <div class="animate-fade-up">
              <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                ${escapeHtmlText(hero.badge)}
              </span>
            </div>
            <h1 class="animate-fade-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">${buildHeroHeadingMarkup(hero.heading)}</h1>
            <p class="animate-fade-up-delay-2 mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">${escapeHtmlText(hero.subheading)}</p>
            <div class="animate-fade-up-delay-3 flex flex-wrap gap-4 mt-10">
              <a href="${escapeHtmlAttribute(hero.ctaUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold text-base h-11 rounded-md px-8 gap-2 px-8 h-12">${escapeHtmlText(hero.ctaLabel)} ${renderArrowRightIcon()}</a>
            </div>
          </div>
          ${heroImageMarkup}
        </div>
      </div>
    </section>`;
};

const buildDemoMarkup = (demo: BootstrapData["routes"] extends Record<string, infer Route> ? Route extends { home?: infer Home } ? Home extends { demo?: infer Demo } ? Demo : never : never : never) => {
  const videoTitle = demo?.videoTitle ?? "qubi Platform Full Demo";
  const videoDuration = demo?.videoDuration ?? "12 minutes End-to-end execution walkthrough";

  return `<section class="py-12 bg-surface-elevated border-y border-border">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <div class="relative rounded-2xl bg-background border border-border shadow-card-hover overflow-hidden aspect-video flex items-center justify-center group cursor-pointer hover:border-primary/30 transition-all duration-300">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div class="relative text-center">
              <div class="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-all duration-300">
                ${renderPlayIcon()}
              </div>
              <p class="text-foreground font-semibold">${escapeHtmlText(videoTitle)}</p>
              <p class="text-muted-foreground text-sm mt-1">${escapeHtmlText(videoDuration)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>`;
};

const buildDeferredPlaceholder = (minHeight: string) => `<div style="min-height:${escapeHtmlAttribute(minHeight)}"></div>`;

const buildFooterMarkup = () => {
  const currentYear = new Date().getFullYear();
  return `<footer class="py-10 bg-background border-t border-border">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <p class="text-sm text-muted-foreground">&copy; ${currentYear} qubi by Qbotica. All rights reserved.</p>
          <div class="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" class="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" class="hover:text-primary transition-colors">Contact Qubi</a>
          </div>
        </div>
      </div>
    </footer>`;
};

const buildHomePrerenderShell = (data: BootstrapData, routePath: string) => {
  const homeData = data.routes?.[routePath]?.home ?? data.routes?.["/"]?.home;
  const heroMarkup = buildHeroMarkup(homeData?.hero);
  const demoMarkup = buildDemoMarkup(homeData?.demo);
  const seoMarkup = homeData?.seoContentHtml ? buildHomeSeoContentMarkup(homeData.seoContentHtml) : "";

  return `<div class="min-h-screen">
      ${buildNavbarMarkup(data.navbar, routePath)}
      <main id="main-content">
        ${heroMarkup}
        ${demoMarkup}
        ${buildDeferredPlaceholder("26rem")}
        ${buildDeferredPlaceholder("30rem")}
        ${buildDeferredPlaceholder("26rem")}
        ${buildDeferredPlaceholder("28rem")}
        ${buildDeferredPlaceholder("28rem")}
        ${buildDeferredPlaceholder("26rem")}
        ${buildDeferredPlaceholder("30rem")}
        ${buildDeferredPlaceholder("26rem")}
        ${seoMarkup}
        ${buildDeferredPlaceholder("22rem")}
      </main>
      ${buildFooterMarkup()}
    </div>`;
};

const serializeBootstrap = (data: BootstrapData) =>
  JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

export const injectBootstrapIntoHtml = (
  html: string,
  data: BootstrapData,
  options: { preloadHero?: boolean; routePath?: string } = {},
) => {
  let out = html
    .replace(/\s*<script id="qubi-bootstrap-data">[\s\S]*?<\/script>/i, "")
    .replace(/\s*<link rel="preload" as="image"[^>]*data-qubi-hero-preload="true"[^>]*>/i, "")
    .replace(/\s*<section[^>]*data-static-home-seo-content="true"[\s\S]*?<\/section>/i, "");

  const heroImage = data.routes?.["/"]?.home?.hero?.image;
  const srcSet = heroImage?.sources.map((source) => `${source.src} ${source.width}w`).join(", ");
  const preloadLink =
    options.preloadHero && heroImage?.src
      ? `  <link rel="preload" as="image" href="${escapeHtmlAttribute(heroImage.src)}"${
          srcSet ? ` imagesrcset="${escapeHtmlAttribute(srcSet)}"` : ""
        }${heroImage.sizes ? ` imagesizes="${escapeHtmlAttribute(heroImage.sizes)}"` : ""} fetchpriority="high" data-qubi-hero-preload="true">\n`
      : "";
  const bootstrapScript = `  <script id="qubi-bootstrap-data">window.__QUBI_BOOTSTRAP__=${serializeBootstrap(data)};</script>\n`;
  const prerenderHome = options.routePath === "/" || options.routePath === "/home";
  const rootMarkup = prerenderHome
    ? `<div id="root" data-prerendered-route="${escapeHtmlAttribute(options.routePath ?? "/")}">${buildHomePrerenderShell(
        data,
        options.routePath ?? "/",
      )}</div>`
    : '<div id="root"></div>';

  out = out
    .replace(/<div id="root"><\/div>/i, rootMarkup)
    .replace("</head>", `${preloadLink}${bootstrapScript}</head>`);

  return out;
};
