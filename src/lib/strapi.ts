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
  return { id: id as number, attributes: rest as A };
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
    "?populate=images" +
    "&filters[published][$eq]=true" +
    (options?.featured !== undefined ? `&filters[flag][$eq]=${options.featured}` : "") +
    "&sort[0]=date:desc" +
    (options?.limit ? `&pagination[pageSize]=${options.limit}` : "&pagination[pageSize]=50");
  const raw = await strapiGet<unknown>("/api/blogs", qs);
  return normalizeList<BlogAttributes>(raw);
}

export async function getBlogById(id: number) {
  const raw = await strapiGet<unknown>(`/api/blogs/${id}?populate=images`);
  return normalizeOne<BlogAttributes>(raw);
}

export async function getBlogByDocumentId(documentId: string) {
  const raw = await strapiGet<unknown>(`/api/blogs/${encodeURIComponent(documentId)}?populate=images`);
  return normalizeOne<BlogAttributes>(raw);
}

// ─── Sections ────────────────────────────────────────────────────────────────

export async function getSections(sectionType?: string) {
  const filter = sectionType ? `&filters[section_type][$eq]=${encodeURIComponent(sectionType)}` : "";
  const raw = await strapiGet<unknown>(
    "/api/sections",
    `?populate=images&filters[published][$eq]=true${filter}&sort[0]=sort_order:asc&pagination[pageSize]=100`
  );
  return normalizeList<SectionAttributes>(raw);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(options?: { sectionId?: number; categoryType?: string }) {
  let filter = "";
  if (options?.sectionId) filter += `&filters[section_id][$eq]=${options.sectionId}`;
  if (options?.categoryType) filter += `&filters[category_type][$eq]=${encodeURIComponent(options.categoryType)}`;
  const raw = await strapiGet<unknown>(
    "/api/categories",
    `?populate=images&filters[published][$eq]=true${filter}&sort[0]=sort_order:asc&pagination[pageSize]=100`
  );
  return normalizeList<CategoryAttributes>(raw);
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
  const [sectionsRaw, categoriesRaw] = await Promise.all([
    strapiGet<unknown>(
      "/api/sections",
      "?filters[published][$eq]=true&filters[show_in_nav][$eq]=true&sort[0]=sort_order:asc&pagination[pageSize]=100"
    ),
    strapiGet<unknown>(
      "/api/categories",
      "?filters[published][$eq]=true&filters[show_in_nav][$eq]=true&sort[0]=sort_order:asc&pagination[pageSize]=100"
    ),
  ]);

  const sections = normalizeList<SectionAttributes>(sectionsRaw).data;
  const categories = normalizeList<CategoryAttributes>(categoriesRaw).data;
  const itemsBySection = new Map<number, NavbarLink[]>();

  for (const category of categories) {
    const sectionId = category.attributes.section_id;
    const href = category.attributes.internal_link || category.attributes.external_link;
    if (!sectionId || !href) continue;

    const items = itemsBySection.get(sectionId) ?? [];
    items.push({
      label: category.attributes.category_title,
      href,
    });
    itemsBySection.set(sectionId, items);
  }

  return sections.reduce<NavbarSectionData[]>((acc, section) => {
    const items = itemsBySection.get(section.id) ?? [];
    if (items.length > 0) {
      acc.push({
        title: section.attributes.section_title,
        items,
      });
      return acc;
    }

    const href = section.attributes.internal_link || section.attributes.external_link;
    if (href) {
      acc.push({
        title: section.attributes.section_title,
        items: [],
        href,
      });
    }

    return acc;
  }, []);
}

// ─── Contents ────────────────────────────────────────────────────────────────

export async function getContents(options?: {
  sectionId?: number;
  categoryId?: number;
  contentType?: string;
  type?: string;
  limit?: number;
}) {
  let filter = "";
  if (options?.sectionId) filter += `&filters[section_id][$eq]=${options.sectionId}`;
  if (options?.categoryId) filter += `&filters[category_id][$eq]=${options.categoryId}`;
  if (options?.contentType) filter += `&filters[content_type][$eq]=${encodeURIComponent(options.contentType)}`;
  if (options?.type) filter += `&filters[type][$eq]=${encodeURIComponent(options.type)}`;
  const limit = options?.limit ?? 50;
  const raw = await strapiGet<unknown>(
    "/api/contents",
    `?populate=images&filters[published][$eq]=true${filter}&sort[0]=sort_order:asc&pagination[pageSize]=${limit}`
  );
  return normalizeList<ContentAttributes>(raw);
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
  const sectionResp = await getSections(sectionType);
  const section = sectionResp.data[0] ?? null;
  if (!section) return { section: null, items: [] as StrapiItem<CategoryAttributes>[] };
  const itemsResp = await getCategories({ sectionId: section.id, categoryType });
  return { section, items: itemsResp.data };
}

/** Fetch only the first published section of a given type */
export async function getHomeSection(sectionType: string) {
  const resp = await getSections(sectionType);
  return resp.data[0] ?? null;
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
