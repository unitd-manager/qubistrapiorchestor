/**
 * Strapi API Service for SEO (updated for actual Strapi schema)
 */

import axios, { AxiosInstance } from 'axios';
import { 
  SEOMetadata, 
  RedirectRule, 
  JSONLDSchema,
  StrapiPageAttributes,
} from '@/types/seo';
import { toAbsoluteUrl } from '@/lib/urls';

// Always call the Strapi backend explicitly by its real domain, in both
// dev and production. Falls back to the real production backend domain
// if VITE_STRAPI_URL isn't set in .env.
const API_BASE_URL = `${import.meta.env.VITE_STRAPI_URL ?? 'https://qubistrapiadmin.unitdtechnologies.com'}/api`;

class StrapiAPIService {
  private api: AxiosInstance;

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private normalizeRedirectRaw(value: string): string | null {
    let out = value.trim();
    if (!out) return null;
    out = out.replace(/`/g, '').trim();
    out = out.replace(/^["']+/, '').replace(/["']+$/, '').trim();
    return out || null;
  }

  private normalizeRedirectMatchPath(value: string): string | null {
    const raw = this.normalizeRedirectRaw(value);
    if (!raw) return null;

    let pathname = raw;
    if (/^https?:\/\//i.test(raw)) {
      try {
        pathname = new URL(raw).pathname;
      } catch {
        return null;
      }
    }

    if (!pathname.startsWith('/')) pathname = `/${pathname}`;
    pathname = pathname.replace(/\/+$/, '');
    return pathname || '/';
  }

  private getSeoObject(value: unknown): Record<string, unknown> | null {
    if (!this.isObject(value)) return null;
    if ('attributes' in value && this.isObject((value as { attributes?: unknown }).attributes)) {
      return (value as { attributes: Record<string, unknown> }).attributes;
    }
    if (
      'data' in value &&
      this.isObject((value as { data?: unknown }).data) &&
      'attributes' in (value as { data: Record<string, unknown> }).data &&
      this.isObject(((value as { data: Record<string, unknown> }).data as { attributes?: unknown }).attributes)
    ) {
      return ((value as { data: Record<string, unknown> }).data as { attributes: Record<string, unknown> }).attributes;
    }
    return value;
  }

  private pickString(obj: Record<string, unknown> | null, keys: string[]): string | undefined {
    if (!obj) return undefined;
    for (const key of keys) {
      const v = obj[key];
      if (typeof v === 'string' && v.trim()) return v;
    }
    return undefined;
  }

  private getPageAttributes(pageData: unknown): StrapiPageAttributes {
    if (this.isObject(pageData) && 'attributes' in pageData) {
      const attrs = (pageData as { attributes: unknown }).attributes;
      if (this.isObject(attrs)) return attrs as unknown as StrapiPageAttributes;
    }
    return pageData as unknown as StrapiPageAttributes;
  }

  private getPageId(pageData: unknown): string | undefined {
    if (this.isObject(pageData) && 'id' in pageData) {
      const id = (pageData as { id?: unknown }).id;
      if (typeof id === 'string' || typeof id === 'number') return String(id);
    }
    return undefined;
  }

  private getPageItems(responseBody: unknown): unknown[] {
    if (!this.isObject(responseBody)) return [];

    const directData = (responseBody as { data?: unknown }).data;
    if (Array.isArray(directData)) return directData;

    const directResults = (responseBody as { results?: unknown }).results;
    if (Array.isArray(directResults)) return directResults;

    if (this.isObject(directData)) {
      const nestedData = (directData as { data?: unknown }).data;
      if (Array.isArray(nestedData)) return nestedData;

      const nestedResults = (directData as { results?: unknown }).results;
      if (Array.isArray(nestedResults)) return nestedResults;
    }

    return [];
  }

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('strapi_jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Helper to get full media URL from Strapi
   */
  private getMediaUrl(media: unknown): string | undefined {
    if (!media) return undefined;
    if (typeof media === 'string') {
      if (media.startsWith('http')) return media;
      return `${API_BASE_URL.replace(/\/api\/?$/, '')}${media}`;
    }
    if (this.isObject(media) && typeof media.url === 'string') {
      if (media.url.startsWith('http')) return media.url;
      return `${API_BASE_URL.replace(/\/api\/?$/, '')}${media.url}`;
    }
    if (
      this.isObject(media) &&
      'attributes' in media &&
      this.isObject((media as { attributes?: unknown }).attributes) &&
      typeof ((media as { attributes: Record<string, unknown> }).attributes.url) === 'string'
    ) {
      const url = (media as { attributes: Record<string, unknown> }).attributes.url as string;
      if (url.startsWith('http')) return url;
      return `${API_BASE_URL.replace(/\/api\/?$/, '')}${url}`;
    }
    if (
      this.isObject(media) &&
      'data' in media &&
      this.isObject((media as { data?: unknown }).data) &&
      'attributes' in (media as { data: Record<string, unknown> }).data &&
      this.isObject(((media as { data: Record<string, unknown> }).data as { attributes?: unknown }).attributes) &&
      typeof (((media as { data: Record<string, unknown> }).data as { attributes: Record<string, unknown> }).attributes.url) ===
        'string'
    ) {
      const url = ((media as { data: Record<string, unknown> }).data as { attributes: Record<string, unknown> }).attributes
        .url as string;
      if (url.startsWith('http')) return url;
      return `${API_BASE_URL.replace(/\/api\/?$/, '')}${url}`;
    }
    return undefined;
  }

  /**
   * Fetch SEO metadata for a specific page (uses slug instead of path)
   */
  async fetchSEOMetadata(slug: string): Promise<SEOMetadata | null> {
    try {
      const slugsToTry = Array.from(
        new Set([slug, slug.startsWith('/') ? slug.slice(1) : `/${slug}`].filter(Boolean))
      );

      for (const s of slugsToTry) {
        const queries = [
          `/pages?filters[slug][$eq]=${encodeURIComponent(s)}`,
          `/pages?populate[seo]=*&filters[slug][$eq]=${encodeURIComponent(s)}`,
          `/pages?populate=seo&filters[slug][$eq]=${encodeURIComponent(s)}`,
          `/pages?populate=*&filters[slug][$eq]=${encodeURIComponent(s)}`,
        ];

        for (const q of queries) {
          const response = await this.api.get<unknown>(q);
          const items = this.getPageItems(response.data);
          if (items.length > 0) {
            const pageData = items[0];
            return this.normalizeSEOData(pageData, slug);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching SEO metadata:', error);
      return null;
    }
  }

  /**
   * Fetch JSON-LD schema for a page (uses schema field from SEO component)
   */
  async fetchJSONLDSchema(slug: string): Promise<JSONLDSchema | null> {
    try {
      const slugsToTry = Array.from(
        new Set([slug, slug.startsWith('/') ? slug.slice(1) : `/${slug}`].filter(Boolean))
      );

      for (const s of slugsToTry) {
        const queries = [
          `/pages?filters[slug][$eq]=${encodeURIComponent(s)}`,
          `/pages?populate[seo]=*&filters[slug][$eq]=${encodeURIComponent(s)}`,
          `/pages?populate=seo&filters[slug][$eq]=${encodeURIComponent(s)}`,
          `/pages?populate=*&filters[slug][$eq]=${encodeURIComponent(s)}`,
        ];

        for (const q of queries) {
          const response = await this.api.get<unknown>(q);
          const items = this.getPageItems(response.data);
          if (items.length > 0) {
            const pageData = items[0];
            const attrs = this.getPageAttributes(pageData);
            if (attrs.seo?.schema) return attrs.seo.schema;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching JSON-LD schema:', error);
      return null;
    }
  }

  /**
   * Fetch redirect rules
   */
  async fetchRedirects(): Promise<RedirectRule[]> {
    try {
      const response = await this.api.get<{ data?: Array<{ id?: number | string; attributes?: Record<string, unknown> } | Record<string, unknown>> }>('/redirects', {
        params: {
          filters: {
            isActive: {
              $eq: true,
            },
          },
          pagination: {
            limit: 1000,
          },
        },
      });

      const items = response.data.data ?? [];
      const rules: RedirectRule[] = [];

      for (const item of items) {
        if (!this.isObject(item)) continue;
        const attrs = this.isObject((item as { attributes?: unknown }).attributes)
          ? ((item as { attributes: Record<string, unknown> }).attributes as Record<string, unknown>)
          : (item as Record<string, unknown>);
        if (!attrs) continue;
        const from = attrs.from;
        const to = attrs.to;
        const type = attrs.type;
        const isActive = attrs.isActive;
        if (typeof from !== 'string') continue;
        if (typeof to !== 'string') continue;
        if (type !== 'permanent_301' && type !== 'temporary_302' && type !== 'temporary_307') continue;
        if (typeof isActive !== 'boolean') continue;
        rules.push({
          id: String(item.id ?? ''),
          from,
          to,
          type,
          isActive,
        });
      }

      return rules;
    } catch (error) {
      console.error('Error fetching redirects:', error);
      return [];
    }
  }

  /**
   * Log 404 errors
   */
  async log404Error(url: string): Promise<void> {
    try {
      await this.api.post('/not-found-logs', {
        data: {
          url,
          hits: 1,
        },
      });
    } catch (error) {
      console.error('Error logging 404:', error);
    }
  }

  /**
   * Normalize SEO data from Strapi format
   */
  private normalizeSEOData(pageData: unknown, path: string): SEOMetadata {
    const attrs = this.getPageAttributes(pageData);
    const seo = this.getSeoObject((attrs as unknown as { seo?: unknown }).seo);

    const title =
      this.pickString(seo, ['metaTitle', 'meta_title', 'title', 'metaTitleText']) ||
      attrs.title ||
      'Qubi Flow Orchestrator';
    const description =
      this.pickString(seo, ['metaDescription', 'meta_description', 'description']) || 'Enterprise workflow orchestration platform';
    const keywords = this.pickString(seo, ['keywords', 'metaKeywords', 'meta_keywords', 'meta_keyword']);
    const canonical = toAbsoluteUrl(
      this.pickString(seo, ['canonicalURL', 'canonical_url', 'canonical', 'canonicalUrl'])
    );
    const ogTitle = this.pickString(seo, ['ogTitle', 'og_title']) || title;
    const ogDescription = this.pickString(seo, ['ogDescription', 'og_description']) || description;
    const twitterCard = this.pickString(seo, ['twitterCard', 'twitter_card']) || 'summary_large_image';
    const twitterTitle = this.pickString(seo, ['twitterTitle', 'twitter_title']) || ogTitle;
    const twitterDescription = this.pickString(seo, ['twitterDescription', 'twitter_description']) || ogDescription;

    const ogImageRaw =
      (seo?.ogImage as unknown) ??
      (seo?.og_image as unknown) ??
      (seo?.metaImage as unknown) ??
      (seo?.meta_image as unknown);
    const ogImage = this.getMediaUrl(ogImageRaw);
    const twitterImageRaw = (seo?.twitterImage as unknown) ?? (seo?.twitter_image as unknown) ?? ogImageRaw;
    const twitterImage = this.getMediaUrl(twitterImageRaw);

    return {
      id: this.getPageId(pageData) ?? path,
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogType: 'website',
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonical,
      robots: 'index, follow',
    };
  }

  /**
   * Get default SEO metadata when no specific data exists
   */
  private getDefaultSEOMetadata(path: string): SEOMetadata {
    const defaultTitle = 'Qubi Flow Orchestrator';
    const defaultDescription = 'Enterprise workflow orchestration platform';

    return {
      id: path,
      title: defaultTitle,
      description: defaultDescription,
      keywords: 'workflow, orchestration, automation',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      robots: 'index, follow',
    };
  }

  /**
   * Check if URL matches any redirect rules
   */
  async resolveRedirect(currentPath: string, redirects?: RedirectRule[]): Promise<string | null> {
    const rulesToCheck = redirects || (await this.fetchRedirects());
    const normalizedCurrent = this.normalizeRedirectMatchPath(currentPath);
    if (!normalizedCurrent) return null;

    for (const rule of rulesToCheck) {
      const normalizedFrom = this.normalizeRedirectMatchPath(rule.from);
      if (normalizedFrom && normalizedFrom === normalizedCurrent) {
        return rule.to;
      }
    }

    return null;
  }
}

// Export singleton instance
export const strapiAPI = new StrapiAPIService();