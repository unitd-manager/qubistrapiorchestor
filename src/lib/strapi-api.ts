/**
 * Strapi API Service for SEO
 */

import axios, { AxiosInstance } from 'axios';

import {
  SEOMetadata,
  RedirectRule,
  JSONLDSchema,
  StrapiPageAttributes,
} from '@/types/seo';

import { toAbsoluteUrl } from '@/lib/urls';

/**
 * ============================================================
 * STRAPI CONFIGURATION
 * ============================================================
 *
 * Local Strapi:
 * VITE_STRAPI_URL=http://localhost:1339
 *
 * Production:
 * VITE_STRAPI_URL=https://qubistrapiadmin.unitdtechnologies.com
 */
const STRAPI_ORIGIN =
  import.meta.env.VITE_STRAPI_URL ||
  'http://localhost:1339';

const API_BASE_URL =
  `${STRAPI_ORIGIN.replace(/\/+$/, '')}/api`;

/**
 * ============================================================
 * STRAPI API SERVICE
 * ============================================================
 */
class StrapiAPIService {
  private api: AxiosInstance;

  /**
   * Check whether a value is a plain object.
   */
  private isObject(
    value: unknown
  ): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null
    );
  }

  /**
   * ============================================================
   * REDIRECT HELPERS
   * ============================================================
   */

  private normalizeRedirectRaw(
    value: string
  ): string | null {
    let out = value.trim();

    if (!out) {
      return null;
    }

    out = out
      .replace(/`/g, '')
      .trim();

    out = out
      .replace(/^["']+/, '')
      .replace(/["']+$/, '')
      .trim();

    return out || null;
  }

  private normalizeRedirectMatchPath(
    value: string
  ): string | null {
    const raw =
      this.normalizeRedirectRaw(value);

    if (!raw) {
      return null;
    }

    let pathname = raw;

    if (/^https?:\/\//i.test(raw)) {
      try {
        pathname = new URL(raw).pathname;
      } catch {
        return null;
      }
    }

    if (!pathname.startsWith('/')) {
      pathname = `/${pathname}`;
    }

    pathname = pathname.replace(
      /\/+$/,
      ''
    );

    return pathname || '/';
  }

  /**
   * ============================================================
   * SEO OBJECT HELPERS
   * ============================================================
   *
   * Supports:
   *
   * Strapi v4:
   * {
   *   seo: {
   *     attributes: {...}
   *   }
   * }
   *
   * Strapi nested:
   * {
   *   seo: {
   *     data: {
   *       attributes: {...}
   *     }
   *   }
   * }
   *
   * Strapi v5:
   * {
   *   seo: {
   *     metaTitle: "..."
   *   }
   * }
   */
  private getSeoObject(
    value: unknown
  ): Record<string, unknown> | null {
    if (!this.isObject(value)) {
      return null;
    }

    /**
     * Strapi v4:
     *
     * seo: {
     *   attributes: {...}
     * }
     */
    if (
      'attributes' in value &&
      this.isObject(
        (
          value as {
            attributes?: unknown;
          }
        ).attributes
      )
    ) {
      return (
        value as {
          attributes: Record<
            string,
            unknown
          >;
        }
      ).attributes;
    }

    /**
     * Nested format:
     *
     * seo: {
     *   data: {
     *     attributes: {...}
     *   }
     * }
     */
    if (
      'data' in value &&
      this.isObject(
        (
          value as {
            data?: unknown;
          }
        ).data
      )
    ) {
      const data = (
        value as {
          data: Record<
            string,
            unknown
          >;
        }
      ).data;

      if (
        'attributes' in data &&
        this.isObject(
          (
            data as {
              attributes?: unknown;
            }
          ).attributes
        )
      ) {
        return (
          data as {
            attributes: Record<
              string,
              unknown
            >;
          }
        ).attributes;
      }
    }

    /**
     * Strapi v5 direct object.
     */
    return value;
  }

  /**
   * Safely get a string from an object.
   */
  private pickString(
    obj: Record<string, unknown> | null,
    keys: string[]
  ): string | undefined {
    if (!obj) {
      return undefined;
    }

    for (const key of keys) {
      const value = obj[key];

      if (
        typeof value === 'string' &&
        value.trim()
      ) {
        return value.trim();
      }
    }

    return undefined;
  }

  /**
   * ============================================================
   * STRAPI PAGE HELPERS
   * ============================================================
   */

  /**
   * Extract page attributes from Strapi response.
   */
  private getPageAttributes(
    pageData: unknown
  ): StrapiPageAttributes {
    if (
      this.isObject(pageData) &&
      'attributes' in pageData
    ) {
      const attrs = (
        pageData as {
          attributes: unknown;
        }
      ).attributes;

      if (this.isObject(attrs)) {
        return attrs as unknown as StrapiPageAttributes;
      }
    }

    return pageData as unknown as StrapiPageAttributes;
  }

  /**
   * Extract page ID.
   */
  private getPageId(
    pageData: unknown
  ): string | undefined {
    if (
      this.isObject(pageData) &&
      'id' in pageData
    ) {
      const id = (
        pageData as {
          id?: unknown;
        }
      ).id;

      if (
        typeof id === 'string' ||
        typeof id === 'number'
      ) {
        return String(id);
      }
    }

    return undefined;
  }

  /**
   * Extract collection items from Strapi response.
   *
   * Supports:
   *
   * {
   *   data: [...]
   * }
   *
   * and nested/custom formats.
   */
  private getPageItems(
    responseBody: unknown
  ): unknown[] {
    if (!this.isObject(responseBody)) {
      return [];
    }

    const directData = (
      responseBody as {
        data?: unknown;
      }
    ).data;

    /**
     * Normal Strapi collection response.
     */
    if (Array.isArray(directData)) {
      return directData;
    }

    const directResults = (
      responseBody as {
        results?: unknown;
      }
    ).results;

    if (Array.isArray(directResults)) {
      return directResults;
    }

    /**
     * Handle nested response formats.
     */
    if (this.isObject(directData)) {
      const nestedData = (
        directData as {
          data?: unknown;
        }
      ).data;

      if (Array.isArray(nestedData)) {
        return nestedData;
      }

      const nestedResults = (
        directData as {
          results?: unknown;
        }
      ).results;

      if (Array.isArray(nestedResults)) {
        return nestedResults;
      }
    }

    return [];
  }

  /**
   * ============================================================
   * CONSTRUCTOR
   * ============================================================
   */
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,

      headers: {
        'Content-Type':
          'application/json',
      },
    });

    /**
     * Add Strapi JWT if available.
     */
    this.api.interceptors.request.use(
      (config) => {
        const token =
          localStorage.getItem(
            'strapi_jwt'
          );

        if (token) {
          config.headers.Authorization =
            `Bearer ${token}`;
        }

        return config;
      }
    );
  }

  /**
   * ============================================================
   * MEDIA URL
   * ============================================================
   */

  /**
   * Get full media URL from Strapi.
   */
  private getMediaUrl(
    media: unknown
  ): string | undefined {
    if (!media) {
      return undefined;
    }

    /**
     * Media is already a string.
     */
    if (typeof media === 'string') {
      if (media.startsWith('http')) {
        return media;
      }

      return `${
        STRAPI_ORIGIN.replace(
          /\/+$/,
          ''
        )
      }${media}`;
    }

    /**
     * Strapi v5:
     *
     * {
     *   url: "/uploads/..."
     * }
     */
    if (
      this.isObject(media) &&
      typeof media.url === 'string'
    ) {
      if (
        media.url.startsWith('http')
      ) {
        return media.url;
      }

      return `${
        STRAPI_ORIGIN.replace(
          /\/+$/,
          ''
        )
      }${media.url}`;
    }

    /**
     * Strapi v4:
     *
     * {
     *   attributes: {
     *     url: "..."
     *   }
     * }
     */
    if (
      this.isObject(media) &&
      'attributes' in media &&
      this.isObject(
        (
          media as {
            attributes?: unknown;
          }
        ).attributes
      )
    ) {
      const attributes = (
        media as {
          attributes: Record<
            string,
            unknown
          >;
        }
      ).attributes;

      if (
        typeof attributes.url ===
        'string'
      ) {
        const url =
          attributes.url;

        if (
          url.startsWith('http')
        ) {
          return url;
        }

        return `${
          STRAPI_ORIGIN.replace(
            /\/+$/,
            ''
          )
        }${url}`;
      }
    }

    /**
     * Nested Strapi media:
     *
     * {
     *   data: {
     *     attributes: {
     *       url: "..."
     *     }
     *   }
     * }
     */
    if (
      this.isObject(media) &&
      'data' in media &&
      this.isObject(
        (
          media as {
            data?: unknown;
          }
        ).data
      )
    ) {
      const data = (
        media as {
          data: Record<
            string,
            unknown
          >;
        }
      ).data;

      if (
        'attributes' in data &&
        this.isObject(
          (
            data as {
              attributes?: unknown;
            }
          ).attributes
        )
      ) {
        const attributes = (
          data as {
            attributes: Record<
              string,
              unknown
            >;
          }
        ).attributes;

        if (
          typeof attributes.url ===
          'string'
        ) {
          const url =
            attributes.url;

          if (
            url.startsWith('http')
          ) {
            return url;
          }

          return `${
            STRAPI_ORIGIN.replace(
              /\/+$/,
              ''
            )
          }${url}`;
        }
      }
    }

    return undefined;
  }

  /**
   * ============================================================
   * SEO ENDPOINT RESOLUTION
   * ============================================================
   *
   * IMPORTANT HOMEPAGE FIX:
   *
   * /
   *    ↓
   * pages
   *    ↓
   * slug = home
   *
   * Your Strapi Home entry has:
   *
   * Title:
   * Home
   *
   * Slug:
   * home
   *
   * SEO metaTitle:
   * AI Agent Orchestration Platform | qubi
   *
   * Therefore the homepage MUST NOT return null.
   */
  private resolveSeoEndpoint(
    path: string
  ): {
    collection:
      | 'pages'
      | 'resource-pages';

    slug: string;
  } | null {
    let clean =
      path.trim();

    /**
     * Remove full URL origin.
     */
    clean = clean.replace(
      /^https?:\/\/[^/]+/i,
      ''
    );

    /**
     * Remove query parameters.
     */
    clean =
      clean.split('?')[0];

    /**
     * Remove hash.
     */
    clean =
      clean.split('#')[0];

    /**
     * Remove leading/trailing slash.
     */
    clean =
      clean.replace(
        /^\/+|\/+$/g,
        ''
      );

    /**
     * ========================================================
     * HOMEPAGE
     * ========================================================
     *
     * /
     * /home
     *
     * Both point to:
     *
     * /api/pages?filters[slug][$eq]=home
     */
    if (
      !clean ||
      clean.toLowerCase() ===
        'home'
    ) {
      console.log(
        '[SEO] Homepage detected -> pages/home'
      );

      return {
        collection: 'pages',
        slug: 'home',
      };
    }

    /**
     * ========================================================
     * RESOURCE PAGES
     * ========================================================
     *
     * /resources/demo
     * /resources/faq
     *
     * -> resource-pages
     */
    if (
      clean.startsWith(
        'resources/'
      ) &&
      !clean.startsWith(
        'resources/blog'
      )
    ) {
      const slug =
        clean.slice(
          'resources/'.length
        );

      if (!slug) {
        return null;
      }

      return {
        collection:
          'resource-pages',
        slug,
      };
    }

    /**
     * ========================================================
     * NORMAL PAGES
     * ========================================================
     *
     * /customers
     * -> customers
     *
     * /pricing
     * -> pricing
     *
     * /solutions/use-cases
     * -> solutions-use-cases
     */
    const slug =
      clean.replace(
        /\//g,
        '-'
      );

    if (!slug) {
      return null;
    }

    return {
      collection: 'pages',
      slug,
    };
  }

  /**
   * ============================================================
   * FETCH PAGE ENTRY
   * ============================================================
   *
   * Fetch the actual page from Strapi.
   *
   * Example Home:
   *
   * GET /api/pages
   *
   * ?filters[slug][$eq]=home
   * &populate[seo]=true
   */
  private async fetchPageEntry(
    path: string
  ): Promise<unknown | null> {
    const target =
      this.resolveSeoEndpoint(
        path
      );

    if (!target) {
      console.warn(
        '[SEO] No SEO endpoint resolved for:',
        path
      );

      return null;
    }

    try {
      console.log(
        '[SEO] Fetching:',
        target.collection,
        target.slug
      );

      /**
       * Standard Strapi collection endpoint.
       *
       * We intentionally use:
       *
       * populate[seo]=true
       *
       * instead of:
       *
       * populate[seo]=*
       *
       * because your SEO component does not require
       * every nested field.
       */
      const response =
        await this.api.get(
          `/${target.collection}`,
          {
            params: {
              'filters[slug][$eq]':
                target.slug,

              'populate[seo]':
                true,
            },
          }
        );

      const items =
        this.getPageItems(
          response.data
        );

      /**
       * ========================================================
       * PAGE FOUND
       * ========================================================
       */
      if (
        items.length > 0
      ) {
        console.log(
          '[SEO] Found:',
          target.collection,
          target.slug,
          items[0]
        );

        return items[0];
      }

      /**
       * ========================================================
       * PAGE NOT FOUND
       * ========================================================
       */
      console.warn(
        `[SEO] No entry found in ${target.collection} for slug: ${target.slug}`
      );

      return null;
    } catch (error) {
      console.error(
        `[SEO] Failed to fetch ${target.collection}/${target.slug}:`,
        error
      );

      return null;
    }
  }

  /**
   * ============================================================
   * FETCH SEO METADATA
   * ============================================================
   *
   * Strapi seo.metaTitle has highest priority.
   */
  async fetchSEOMetadata(
    path: string
  ): Promise<SEOMetadata | null> {
    const entry =
      await this.fetchPageEntry(
        path
      );

    if (!entry) {
      console.warn(
        '[SEO] No entry available for:',
        path
      );

      return null;
    }

    const metadata =
      this.normalizeSEOData(
        entry,
        path
      );

    console.log(
      '[SEO] Normalized metadata:',
      path,
      metadata
    );

    return metadata;
  }

  /**
   * ============================================================
   * FETCH JSON-LD
   * ============================================================
   */
  async fetchJSONLDSchema(
    path: string
  ): Promise<JSONLDSchema | null> {
    const entry =
      await this.fetchPageEntry(
        path
      );

    if (!entry) {
      return null;
    }

    const attrs =
      this.getPageAttributes(
        entry
      );

    const seo =
      this.getSeoObject(
        (
          attrs as unknown as {
            seo?: unknown;
          }
        ).seo
      );

    const rawSchema =
      seo?.schema;

    if (
      this.isObject(
        rawSchema
      )
    ) {
      return rawSchema as unknown as JSONLDSchema;
    }

    if (
      typeof rawSchema ===
      'string'
    ) {
      try {
        const parsed =
          JSON.parse(
            rawSchema
          );

        if (
          this.isObject(
            parsed
          )
        ) {
          return parsed as unknown as JSONLDSchema;
        }

        return null;
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * ============================================================
   * FETCH REDIRECTS
   * ============================================================
   */
  async fetchRedirects(): Promise<
    RedirectRule[]
  > {
    try {
      const response =
        await this.api.get<{
          data?: Array<
            | {
                id?:
                  | number
                  | string;

                attributes?: Record<
                  string,
                  unknown
                >;
              }
            | Record<
                string,
                unknown
              >
          >;
        }>('/redirects', {
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

      const items =
        response.data.data ??
        [];

      const rules:
        RedirectRule[] = [];

      for (
        const item of items
      ) {
        if (
          !this.isObject(
            item
          )
        ) {
          continue;
        }

        const attrs =
          this.isObject(
            (
              item as {
                attributes?: unknown;
              }
            ).attributes
          )
            ? (
                item as {
                  attributes: Record<
                    string,
                    unknown
                  >;
                }
              ).attributes
            : (
                item as Record<
                  string,
                  unknown
                >
              );

        if (!attrs) {
          continue;
        }

        const from =
          attrs.from;

        const to =
          attrs.to;

        const type =
          attrs.type;

        const isActive =
          attrs.isActive;

        if (
          typeof from !==
          'string'
        ) {
          continue;
        }

        if (
          typeof to !==
          'string'
        ) {
          continue;
        }

        if (
          type !==
            'permanent_301' &&
          type !==
            'temporary_302' &&
          type !==
            'temporary_307'
        ) {
          continue;
        }

        if (
          typeof isActive !==
          'boolean'
        ) {
          continue;
        }

        rules.push({
          id: String(
            item.id ?? ''
          ),

          from,

          to,

          type,

          isActive,
        });
      }

      return rules;
    } catch (error) {
      console.error(
        'Error fetching redirects:',
        error
      );

      return [];
    }
  }

  /**
   * ============================================================
   * LOG 404
   * ============================================================
   */
  async log404Error(
    url: string
  ): Promise<void> {
    try {
      await this.api.post(
        '/not-found-logs',
        {
          data: {
            url,
            hits: 1,
          },
        }
      );
    } catch (error) {
      console.error(
        'Error logging 404:',
        error
      );
    }
  }

  /**
   * ============================================================
   * NORMALIZE SEO DATA
   * ============================================================
   *
   * TITLE PRIORITY:
   *
   * 1. seo.metaTitle
   * 2. seo.meta_title
   * 3. seo.title
   * 4. seo.metaTitleText
   * 5. page.title
   * 6. fallback
   *
   * The URL slug is NEVER used as the title.
   */
  private normalizeSEOData(
    pageData: unknown,
    path: string
  ): SEOMetadata {
    const attrs =
      this.getPageAttributes(
        pageData
      );

    const seo =
      this.getSeoObject(
        (
          attrs as unknown as {
            seo?: unknown;
          }
        ).seo
      );

    const attrsRecord =
      attrs as unknown as Record<
        string,
        unknown
      >;

    /**
     * ========================================================
     * META TITLE
     * ========================================================
     */
    const title =
      this.pickString(
        seo,
        [
          'metaTitle',
          'meta_title',
          'title',
          'metaTitleText',
        ]
      ) ||
      this.pickString(
        attrsRecord,
        ['title']
      ) ||
      'Qubi Flow Orchestrator';

    /**
     * ========================================================
     * META DESCRIPTION
     * ========================================================
     */
    const description =
      this.pickString(
        seo,
        [
          'metaDescription',
          'meta_description',
          'description',
        ]
      ) ||
      'Enterprise workflow orchestration platform';

    /**
     * ========================================================
     * KEYWORDS
     * ========================================================
     */
    const keywords =
      this.pickString(
        seo,
        [
          'keywords',
          'metaKeywords',
          'meta_keywords',
          'meta_keyword',
        ]
      );

    /**
     * ========================================================
     * CANONICAL
     * ========================================================
     */
    const canonical =
      toAbsoluteUrl(
        this.pickString(
          seo,
          [
            'canonicalURL',
            'canonical_url',
            'canonical',
            'canonicalUrl',
          ]
        )
      );

    /**
     * ========================================================
     * OPEN GRAPH TITLE
     * ========================================================
     */
    const ogTitle =
      this.pickString(
        seo,
        [
          'ogTitle',
          'og_title',
        ]
      ) ||
      title;

    /**
     * ========================================================
     * OPEN GRAPH DESCRIPTION
     * ========================================================
     */
    const ogDescription =
      this.pickString(
        seo,
        [
          'ogDescription',
          'og_description',
        ]
      ) ||
      description;

    /**
     * ========================================================
     * TWITTER CARD
     * ========================================================
     */
    const twitterCard =
      this.pickString(
        seo,
        [
          'twitterCard',
          'twitter_card',
        ]
      ) ||
      'summary_large_image';

    /**
     * ========================================================
     * TWITTER TITLE
     * ========================================================
     */
    const twitterTitle =
      this.pickString(
        seo,
        [
          'twitterTitle',
          'twitter_title',
        ]
      ) ||
      ogTitle;

    /**
     * ========================================================
     * TWITTER DESCRIPTION
     * ========================================================
     */
    const twitterDescription =
      this.pickString(
        seo,
        [
          'twitterDescription',
          'twitter_description',
        ]
      ) ||
      ogDescription;

    /**
     * ========================================================
     * OPEN GRAPH IMAGE
     * ========================================================
     */
    const ogImageRaw =
      seo?.ogImage ??
      seo?.og_image ??
      seo?.metaImage ??
      seo?.meta_image;

    const ogImage =
      this.getMediaUrl(
        ogImageRaw
      );

    /**
     * ========================================================
     * TWITTER IMAGE
     * ========================================================
     */
    const twitterImageRaw =
      seo?.twitterImage ??
      seo?.twitter_image ??
      ogImageRaw;

    const twitterImage =
      this.getMediaUrl(
        twitterImageRaw
      );

    /**
     * ========================================================
     * FINAL SEO DATA
     * ========================================================
     */
    return {
      id:
        this.getPageId(
          pageData
        ) ??
        path,

      title,

      description,

      keywords,

      ogTitle,

      ogDescription,

      ogImage,

      ogType:
        'website',

      twitterCard,

      twitterTitle,

      twitterDescription,

      twitterImage,

      canonical,

      robots:
        'index, follow',
    };
  }

  /**
   * ============================================================
   * DEFAULT SEO
   * ============================================================
   */
  private getDefaultSEOMetadata(
    path: string
  ): SEOMetadata {
    return {
      id: path,

      title:
        'Qubi Flow Orchestrator',

      description:
        'Enterprise workflow orchestration platform',

      keywords:
        'workflow, orchestration, automation',

      ogType:
        'website',

      twitterCard:
        'summary_large_image',

      robots:
        'index, follow',
    };
  }

  /**
   * ============================================================
   * REDIRECT RESOLUTION
   * ============================================================
   */
  async resolveRedirect(
    currentPath: string,
    redirects?: RedirectRule[]
  ): Promise<string | null> {
    const rulesToCheck =
      redirects ||
      (await this.fetchRedirects());

    const normalizedCurrent =
      this.normalizeRedirectMatchPath(
        currentPath
      );

    if (!normalizedCurrent) {
      return null;
    }

    for (
      const rule of rulesToCheck
    ) {
      const normalizedFrom =
        this.normalizeRedirectMatchPath(
          rule.from
        );

      if (
        normalizedFrom &&
        normalizedFrom ===
          normalizedCurrent
      ) {
        return rule.to;
      }
    }

    return null;
  }
}

/**
 * ============================================================
 * EXPORT SINGLETON
 * ============================================================
 */
export const strapiAPI =
  new StrapiAPIService();