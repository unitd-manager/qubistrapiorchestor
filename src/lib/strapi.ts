// Strapi v5 REST API client — use same-origin `/api` and `/uploads` paths.
// The live nginx setup already proxies these correctly, which avoids browser CORS failures.

const API_BASE_URL = "";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StrapiMeta {
  pagination?: { page: number; pageSize: number; pageCount: number; total: number };
}

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiItem<A> {
  id: number;
  attributes: A;
}

export interface StrapiMediaFormat {
  ext?: string;
  url: string;
  hash?: string;
  mime?: string;
  name?: string;
  path?: string | null;
  size?: number;
  width?: number;
  height?: number;
  sizeInBytes?: number;
}

export interface StrapiMediaAsset {
  id: number;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, StrapiMediaFormat> | null;
}

// Content-type attribute shapes
export interface BlogAttributes {
  documentId?: string | null;
  title: string;
  description: string | null;
  author: string | null;
  date: string | null;
  category_id: number | null;
  flag: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keyword: string | null;
  us_title: string | null;
  us_description: string | null;
  published: boolean | null;
  images: StrapiMediaAsset[] | null;
}

export interface SectionAttributes {
  section_title: string;
  section_type: string | null;
  display_type: string | null;
  description: string | null;
  sort_order: number | null;
  published: boolean | null;
  external_link: string | null;
  internal_link: string | null;
  template: string | null;
  show_in_nav: boolean | null;
  images: StrapiMediaAsset[] | null;
}

export interface CategoryAttributes {
  section_id: number | null;
  category_title: string;
  category_type: string | null;
  description: string | null;
  description_short: string | null;
  display_type: string | null;
  template: string | null;
  sort_order: number | null;
  published: boolean | null;
  external_link: string | null;
  internal_link: string | null;
  images: StrapiMediaAsset[] | null;
}

export interface ContentAttributes {
  section_id: number | null;
  category_id: number | null;
  title: string;
  show_title: boolean | null;
  type: string | null;
  content_type: string | null;
  description_short: string | null;
  description: string | null;
  sort_order: number | null;
  published: boolean | null;
  content_date: string | null;
  external_link: string | null;
  favourite: boolean | null;
  images: StrapiMediaAsset[] | null;
}

export interface NavbarLink {
  label: string;
  href: string;
}

export interface NavbarSectionData {
  title: string;
  items: NavbarLink[];
  href?: string;
}

export interface SiteSettings {
  footer_company_name?: string;
  cta_label?: string;
  cta_url?: string;
}

/**
 * Fetch the header or footer menu from the Menu Manager (menu-item collection).
 * Top-level header items with children render as dropdowns; the rest are
 * direct links. Fully client-managed in the admin.
 */
export async function getMenu(location: "header" | "footer"): Promise<NavbarSectionData[]> {
  const raw = await strapiGet<{ data?: Array<Record<string, unknown>> }>(
    "/api/menu-items",
    `?filters[location][$eq]=${location}&filters[parent][id][$null]=true&populate[children][sort][0]=order:asc&sort[0]=order:asc&pagination[pageSize]=100`
  );

  return (raw.data ?? []).map((item) => {
    const children = (item.children as Array<Record<string, unknown>> | undefined) ?? [];
    if (children.length > 0) {
      return {
        title: String(item.label ?? ""),
        items: children.map((c) => ({ label: String(c.label ?? ""), href: String(c.url ?? "#") })),
      };
    }
    return {
      title: String(item.label ?? ""),
      items: [],
      href: String(item.url ?? "#"),
    };
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const raw = await strapiGet<{ data?: SiteSettings }>("/api/site-setting", "");
    return raw.data ?? {};
  } catch {
    return {};
  }
}

export interface FooterData {
  copyright_text?: string;
}

/** The footer copyright line from the self-contained Footer single type. */
export async function getFooter(): Promise<FooterData> {
  try {
    const raw = await strapiGet<{ data?: { copyright_text?: string } }>("/api/footer");
    return { copyright_text: raw.data?.copyright_text };
  } catch {
    return {};
  }
}

// ─── Header (single type) ─────────────────────────────────────────────────
// Distinct type names on purpose so they don't clash with the existing
// NavbarLink/NavbarSectionData used by getMenu (Menu Item collection).

export interface HeaderNavChild {
  label: string;
  url: string;
  publish?: boolean;
}

export interface HeaderNavLink {
  label: string;
  url?: string;
  publish?: boolean;
  children?: HeaderNavChild[];
}

export interface HeaderData {
  logo?: StrapiMediaAsset;
  logo_link?: string;
  nav_links: HeaderNavLink[];
  cta_label?: string;
  cta_url?: string;
}

export async function getHeaderData(): Promise<HeaderData> {
  try {
    const raw = await strapiGet<{ data?: Record<string, unknown> }>(
      "/api/header",
      "?populate[logo]=true&populate[nav_links][populate][children]=true"
    );
    const attrs = raw.data ?? {};

    return {
      logo: (attrs.logo as StrapiMediaAsset | undefined) ?? undefined,
      logo_link: (attrs.logo_link as string | undefined) ?? "/",
      nav_links: (attrs.nav_links as HeaderNavLink[] | undefined) ?? [],
      cta_label: attrs.cta_label as string | undefined,
      cta_url: attrs.cta_url as string | undefined,
    };
  } catch {
    return { nav_links: [] };
  }
}

export interface EnquiryPayload {
  first_name: string;
  last_name?: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  comments?: string;
  enquiry_type?: string;
  product?: string;
}

export interface SettingAttributes {
  key_text: string;
  value: string | null;
  group_name: string | null;
  value_type: string | null;
  published: boolean | null;
}

export interface FaqAttributes {
  question: string;
  answer: string;
  category: string | null;
  sort_order: number | null;
  published: boolean | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildQS(params: Record<string, string | number | boolean | undefined>) {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

async function strapiGet<T>(path: string, qs = ""): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}${qs}`);
  if (!res.ok) throw new Error(`Strapi API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function strapiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: body }),
  });
  if (!res.ok) throw new Error(`Strapi API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ─── Strapi v5 → v4 normalizer ───────────────────────────────────────────────
// Strapi v5 REST API returns flat objects; normalize to { id, attributes } so
// all page mapping functions continue working without changes.
function normalizeItem<A>(raw: Record<string, unknown>): StrapiItem<A> {
  const { id, ...rest } = raw;
  return { id: id as number, attributes: rest as unknown as A };
}
function normalizeList<A>(raw: unknown): StrapiResponse<StrapiItem<A>[]> {
  const r = raw as { data: Record<string, unknown>[]; meta: StrapiMeta };
  return { data: (r.data ?? []).map((item) => normalizeItem<A>(item)), meta: r.meta ?? {} };
}

function normalizeOne<A>(raw: unknown): StrapiResponse<StrapiItem<A>> {
  const r = raw as { data: Record<string, unknown>; meta: StrapiMeta };
  return { data: normalizeItem<A>(r.data), meta: r.meta ?? {} };
}

/** Strip basic HTML/richtext tags for plain-text display */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").trim();
}

/** Resolve a Strapi media URL to an absolute URL */
export function mediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function getBlogs(options?: { featured?: boolean; limit?: number }) {
  const qs =
    "?populate[images]=true&populate[blog_category]=true" +
    "&filters[published][$eq]=true" +
    (options?.featured !== undefined ? `&filters[flag][$eq]=${options.featured}` : "") +
    "&sort[0]=date:desc" +
    (options?.limit ? `&pagination[pageSize]=${options.limit}` : "&pagination[pageSize]=50");
  const raw = await strapiGet<unknown>("/api/blogs", qs);
  return normalizeList<BlogAttributes>(raw);
}

/** The central blog category list, for the sidebar and filters. */
export async function getBlogCategories(): Promise<string[]> {
  try {
    const raw = await strapiGet<{ data?: Array<Record<string, unknown>> }>(
      "/api/blog-categories",
      "?sort[0]=sort_order:asc&fields[0]=name&pagination[pageSize]=100"
    );
    return (raw.data ?? []).map((c) => String(c.name ?? "")).filter(Boolean);
  } catch {
    return [];
  }
}

/** Category label for a blog: the linked category name, or the legacy us_title. */
export function blogCategoryName(attributes: BlogAttributes | undefined): string {
const rel = (attributes as unknown as Record<string, unknown> | undefined)?.blog_category as    | { name?: string }
    | null
    | undefined;
  return rel?.name || attributes?.us_title || "";
}

export async function getBlogById(id: number) {
  const raw = await strapiGet<unknown>(`/api/blogs/${id}?populate=images`);
  return normalizeOne<BlogAttributes>(raw);
}

export async function getBlogByDocumentId(documentId: string) {
  const raw = await strapiGet<unknown>(`/api/blogs/${encodeURIComponent(documentId)}?populate[images]=true&populate[blog_category]=true`);
  return normalizeOne<BlogAttributes>(raw);
}

// ─── Sections ────────────────────────────────────────────────────────────────

export async function getSections(sectionType?: string) {
  // Sections API has been removed. Return an empty response so callers can fall back safely.
  return { data: [], meta: {} } as StrapiResponse<StrapiItem<SectionAttributes>[]>;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(options?: { sectionId?: number; categoryType?: string }) {
  // Categories API disabled.
  return { data: [], meta: {} } as StrapiResponse<StrapiItem<CategoryAttributes>[]>;
}

/**
 * Direct-link nav entries sourced from the Page collection: any page with
 * showInNav=true appears in the menu automatically, ordered by navOrder.
 * This is how a client-created page reaches the menu with zero code —
 * they just tick "Show in navigation" on the page itself.
 */
export async function getNavPages(): Promise<NavbarSectionData[]> {
  const raw = await strapiGet<{ data?: Array<Record<string, unknown>> }>(
    "/api/pages",
    // Note: dynamic zones (pageBuilder) cannot be used in filters — Strapi
    // rejects the query with a 400. showInNav alone is the intended switch.
    "?filters[showInNav][$eq]=true&sort[0]=navOrder:asc&fields[0]=title&fields[1]=slug&fields[2]=navLabel&fields[3]=navOrder&pagination[pageSize]=100"
  );
  return (raw.data ?? []).map((page) => {
    const slug = String(page.slug ?? "");
    const label = (page.navLabel as string) || (page.title as string) || slug;
    const href = slug === "home" ? "/" : `/${slug}`;
    return { title: label, items: [], href };
  });
}

export async function getNavbarData(): Promise<NavbarSectionData[]> {
  // The Sections API is removed. Navbar data is loaded via /api/header instead.
  return [];
}

// ─── Contents ────────────────────────────────────────────────────────────────

export async function getContents(options?: {
  sectionId?: number;
  categoryId?: number;
  contentType?: string;
  type?: string;
  limit?: number;
}) {
  // Contents API disabled.
  return { data: [], meta: {} } as StrapiResponse<StrapiItem<ContentAttributes>[]>;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(groupName?: string) {
  const filter = groupName ? `&filters[group_name][$eq]=${encodeURIComponent(groupName)}` : "";
  const raw = await strapiGet<unknown>(
    "/api/settings",
    `?filters[published][$eq]=true${filter}`
  );
  return normalizeList<SettingAttributes>(raw);
}

export async function getSettingByKey(key: string) {
  const raw = await strapiGet<unknown>(
    "/api/settings",
    `?filters[key_text][$eq]=${encodeURIComponent(key)}&filters[published][$eq]=true`
  );
  return normalizeList<SettingAttributes>(raw);
}

// ─── Home-page helpers ───────────────────────────────────────────────────────

/** Fetch the first published section of a given type, plus its categories */
export async function getHomeSectionWithItems(sectionType: string, categoryType: string) {
  // The Sections API is disabled, so return items by category type only.
  const itemsResp = await getCategories({ categoryType });
  return { section: null, items: itemsResp.data };
}

/** Fetch only the first published section of a given type */
export async function getHomeSection(sectionType: string) {
  // The Sections API is disabled. Caller should use fallback content.
  return null;
}

// ─── Page builder (dynamic zone) ─────────────────────────────────────────────

export interface PageBlock {
  id?: number;
  __component: string;
  [key: string]: unknown;
}

/** Fetch a page's pageBuilder blocks by slug via the backend's findBySlug
 *  endpoint, which deep-populates every block (including nested components
 *  like case-study metrics that a generic populate=* cannot reach). */
export async function getPageBlocks(slug: string): Promise<PageBlock[]> {
  try {
    const raw = await strapiGet<{ data?: Record<string, unknown> }>(
      `/api/pages/slug/${encodeURIComponent(slug)}`
    );
    return (raw.data?.pageBuilder as PageBlock[] | undefined) ?? [];
  } catch {
    // Page not found (404) or endpoint unavailable — caller falls back
    return [];
  }
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export async function createEnquiry(payload: EnquiryPayload) {
  return strapiPost<StrapiResponse<StrapiItem<EnquiryPayload>>>("/api/enquiries", {
    ...payload,
    creation_date: new Date().toISOString(),
    status: "new",
  });
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export async function getFaqs(options?: { category?: string }) {
  let filter = "";
  if (options?.category) filter += `&filters[category][$eq]=${encodeURIComponent(options.category)}`;
  const raw = await strapiGet<unknown>(
    "/api/faqs",
    `?filters[published][$eq]=true${filter}&sort[0]=sort_order:asc&pagination[pageSize]=100`
  );
  return normalizeList<FaqAttributes>(raw);
}
/** Fetch a Resource Page's pageBuilder blocks by slug.*/
export async function getResourcePageBlocks(slug: string): Promise<PageBlock[]> {
  try {
    const raw = await strapiGet<{ data?: Record<string, unknown> }>(
      `/api/resource-pages/slug/${encodeURIComponent(slug)}`
    );
    if (raw.data?.pageBuilder) {
      return raw.data.pageBuilder as PageBlock[];
    }
  } catch {
    // custom endpoint not available — fall through to generic REST fetch
  }

  try {
    const qs = buildQS({
      "filters[slug][$eq]": slug,
      "populate[pageBuilder][populate]": "*",
    });
    const raw = await strapiGet<{ data?: Record<string, unknown>[] }>(
      "/api/resource-pages",
      qs
    );
    const entry = raw.data?.[0];
    return (entry?.pageBuilder as PageBlock[] | undefined) ?? [];
  } catch {
    return [];
  }
}
interface StrapiBlockNode {
  type?: string;
  text?: string;
  children?: StrapiBlockNode[];
}

/** Convert Strapi Blocks rich-text (array of nodes) to plain text.
 *  Use this instead of stripHtml() for any `description` field that comes
 *  back as an array rather than an HTML string. */
export function blocksToText(blocks: StrapiBlockNode[] | string | null | undefined): string {
  if (!blocks) return "";
  if (typeof blocks === "string") return stripHtml(blocks); // legacy HTML string fallback
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((node) =>
      (node.children ?? []).map((child) => child.text ?? "").join("")
    )
    .join("\n\n")
    .trim();
}