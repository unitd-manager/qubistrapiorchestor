/**
 * SEO Head Component
 *
 * Injects:
 * - document.title
 * - meta description
 * - keywords
 * - robots
 * - canonical
 * - Open Graph
 * - Twitter cards
 * - JSON-LD
 *
 * IMPORTANT:
 * Strapi SEO Meta Title has priority.
 *
 * If the document already contains a valid title and the
 * incoming title is only a fallback title, we don't overwrite
 * the existing title.
 */

import { useEffect } from 'react';

import {
  SEOMetadata,
  JSONLDSchema,
} from '@/types/seo';

import {
  toAbsoluteUrl,
} from '@/lib/urls';

interface SEOHeadProps {
  metadata: SEOMetadata | null;
  jsonLD?: JSONLDSchema | null;
  additionalMeta?: Record<string, string>;
}

/**
 * Detect titles that are known fallback titles.
 *
 * These should not overwrite an already-existing Strapi
 * Meta Title in the document.
 */
const isFallbackTitle = (
  value: string | undefined
): boolean => {
  if (!value) {
    return false;
  }

  const normalized =
    value.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  /**
   * Global fallback.
   */
  if (
    normalized ===
    'qubi flow orchestrator'
  ) {
    return true;
  }

  /**
   * Page fallback pattern:
   *
   * Customers | Qubi Flow Orchestrator
   * About | Qubi Flow Orchestrator
   * Contact | Qubi Flow Orchestrator
   */
  if (
    normalized.endsWith(
      '| qubi flow orchestrator'
    )
  ) {
    return true;
  }

  return false;
};

export const SEOHead = ({
  metadata,
  jsonLD,
  additionalMeta = {},
}: SEOHeadProps) => {
  const {
    title,
    description,
    keywords,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
  } = metadata ?? {};

  const normalizedCanonical =
    toAbsoluteUrl(canonical);

  const normalizedOgImage =
    toAbsoluteUrl(ogImage);

  const normalizedTwitterImage =
    toAbsoluteUrl(twitterImage);

  useEffect(() => {
    /**
     * Don't do anything if SEO metadata isn't available.
     */
    if (!metadata) {
      return;
    }

    /**
     * -------------------------------------------------------
     * TITLE
     * -------------------------------------------------------
     *
     * This is the most important part.
     *
     * We want:
     *
     * Strapi SEO → Meta Title
     *        ↓
     * document.title
     *
     * However, during the React lifecycle there can already
     * be a correct title in the HTML document.
     *
     * If the incoming title is only a fallback, don't replace
     * that existing title.
     */
    const resolvedTitle =
      title?.trim();

    if (resolvedTitle) {
      const currentDocumentTitle =
        document.title?.trim();

      const incomingIsFallback =
        isFallbackTitle(
          resolvedTitle
        );

      const currentIsFallback =
        isFallbackTitle(
          currentDocumentTitle
        );

      /**
       * CASE 1:
       *
       * No existing document title.
       *
       * Safe to set the incoming title.
       */
      if (
        !currentDocumentTitle
      ) {
        document.title =
          resolvedTitle;
      }

      /**
       * CASE 2:
       *
       * Existing title is itself a fallback.
       *
       * Safe to replace it with the incoming title.
       */
      else if (
        currentIsFallback
      ) {
        document.title =
          resolvedTitle;
      }

      /**
       * CASE 3:
       *
       * Incoming title is a real Strapi title.
       *
       * Always allow the real Strapi title to replace
       * an existing fallback.
       */
      else if (
        !incomingIsFallback
      ) {
        document.title =
          resolvedTitle;
      }

      /**
       * CASE 4:
       *
       * Existing title is already a real title and incoming
       * title is only a fallback.
       *
       * DO NOTHING (keep the existing real title — a fallback
       * should never clobber real content).
       */

      /**
       * CASE 5:
       *
       * Both the existing title and the incoming title are
       * "real" (non-fallback), but they don't match each other.
       *
       * This happens when a static/prerendered build baked in
       * an older Strapi title (e.g. via `npm run build` +
       * `npm run preview`) and the title has since changed in
       * Strapi. The live, freshly-fetched title should always
       * win over a stale build-time snapshot.
       */
      else if (
        !incomingIsFallback &&
        !currentIsFallback &&
        currentDocumentTitle !== resolvedTitle
      ) {
        document.title =
          resolvedTitle;
      }
    }

    /**
     * -------------------------------------------------------
     * SEO ELEMENT MANAGEMENT
     * -------------------------------------------------------
     */

    const managedNodes: HTMLElement[] =
      [];

    /**
     * Add a meta tag.
     */
    const appendMeta = (
      key: string,
      attr:
        | 'name'
        | 'property',
      value:
        | string
        | undefined
    ) => {
      if (
        typeof value !== 'string' ||
        !value.trim()
      ) {
        return;
      }

      const element =
        document.createElement(
          'meta'
        );

      element.setAttribute(
        attr,
        key
      );

      element.setAttribute(
        'content',
        value
      );

      element.setAttribute(
        'data-seo-head',
        'true'
      );

      document.head.appendChild(
        element
      );

      managedNodes.push(
        element
      );
    };

    /**
     * Add link tag.
     */
    const appendLink = (
      rel: string,
      href:
        | string
        | undefined
    ) => {
      if (
        typeof href !== 'string' ||
        !href.trim()
      ) {
        return;
      }

      const element =
        document.createElement(
          'link'
        );

      element.setAttribute(
        'rel',
        rel
      );

      element.setAttribute(
        'href',
        href
      );

      element.setAttribute(
        'data-seo-head',
        'true'
      );

      document.head.appendChild(
        element
      );

      managedNodes.push(
        element
      );
    };

    /**
     * Add JSON-LD script.
     */
    const appendScript = (
      schema: JSONLDSchema
    ) => {
      const element =
        document.createElement(
          'script'
        );

      element.setAttribute(
        'type',
        'application/ld+json'
      );

      element.setAttribute(
        'data-seo-head',
        'true'
      );

      element.textContent =
        JSON.stringify(schema);

      document.head.appendChild(
        element
      );

      managedNodes.push(
        element
      );
    };

    /**
     * Remove SEO tags created by previous SEOHead render.
     *
     * IMPORTANT:
     * We do NOT touch <title>.
     *
     * document.title is managed separately above.
     */
    document
      .querySelectorAll(
        '[data-seo-head="true"]'
      )
      .forEach(
        (node) => node.remove()
      );

    /**
     * -------------------------------------------------------
     * STANDARD META
     * -------------------------------------------------------
     */

    appendMeta(
      'description',
      'name',
      description
    );

    if (keywords) {
      appendMeta(
        'keywords',
        'name',
        keywords
      );
    }

    if (robots) {
      appendMeta(
        'robots',
        'name',
        robots
      );
    }

    /**
     * -------------------------------------------------------
     * CANONICAL
     * -------------------------------------------------------
     */

    if (normalizedCanonical) {
      appendLink(
        'canonical',
        normalizedCanonical
      );
    }

    /**
     * -------------------------------------------------------
     * OPEN GRAPH
     * -------------------------------------------------------
     */

    appendMeta(
      'og:type',
      'property',
      ogType || 'website'
    );

    appendMeta(
      'og:title',
      'property',
      ogTitle || title
    );

    appendMeta(
      'og:description',
      'property',
      ogDescription ||
        description
    );

    if (normalizedOgImage) {
      appendMeta(
        'og:image',
        'property',
        normalizedOgImage
      );
    }

    if (normalizedCanonical) {
      appendMeta(
        'og:url',
        'property',
        normalizedCanonical
      );
    }

    /**
     * -------------------------------------------------------
     * TWITTER
     * -------------------------------------------------------
     */

    appendMeta(
      'twitter:card',
      'name',
      twitterCard ||
        'summary_large_image'
    );

    appendMeta(
      'twitter:title',
      'name',
      twitterTitle || title
    );

    appendMeta(
      'twitter:description',
      'name',
      twitterDescription ||
        description
    );

    if (normalizedTwitterImage) {
      appendMeta(
        'twitter:image',
        'name',
        normalizedTwitterImage
      );
    }

    /**
     * -------------------------------------------------------
     * ADDITIONAL META
     * -------------------------------------------------------
     */

    Object.entries(
      additionalMeta
    ).forEach(
      ([key, value]) => {
        appendMeta(
          key,
          'name',
          value
        );
      }
    );

    /**
     * -------------------------------------------------------
     * JSON-LD
     * -------------------------------------------------------
     */

    if (jsonLD) {
      appendScript(jsonLD);
    }

    /**
     * Cleanup only the elements created by this component.
     */
    return () => {
      managedNodes.forEach(
        (node) => {
          if (
            node.parentNode
          ) {
            node.parentNode.removeChild(
              node
            );
          }
        }
      );
    };
  }, [
    metadata,
    additionalMeta,
    description,
    jsonLD,
    keywords,
    normalizedCanonical,
    normalizedOgImage,
    normalizedTwitterImage,
    ogDescription,
    ogTitle,
    ogType,
    robots,
    title,
    twitterCard,
    twitterDescription,
    twitterTitle,
  ]);

  return null;
};