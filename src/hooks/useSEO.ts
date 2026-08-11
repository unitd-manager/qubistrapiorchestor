/**
 * Custom Hook: useSEO
 *
 * SEO behaviour:
 *
 * EVERY PAGE INCLUDING HOME
 * -------------------------
 *
 * /                  -> pages -> home
 * /customers         -> pages -> customers
 * /pricing           -> pages -> pricing
 * /solutions/...     -> pages -> flat slug
 * /resources/demo    -> resource-pages -> demo
 * /resources/faq     -> resource-pages -> faq
 *
 * The SEO metadata always comes from the corresponding
 * Strapi page.
 *
 * IMPORTANT:
 * We do NOT use Home bootstrap SEO anymore.
 *
 * This prevents Home metadata from becoming stale when
 * navigating between React Router routes.
 */

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  SEOMetadata,
  JSONLDSchema,
} from '@/types/seo';

import {
  strapiAPI,
} from '@/lib/strapi-api';

interface UseSEOOptions {
  path: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fetchJsonLD?: boolean;
}

/**
 * Normalize browser route.
 *
 * Examples:
 *
 * "/"                    -> "/"
 * "/customers/"          -> "/customers"
 * "customers"            -> "/customers"
 * "/pricing?x=1"         -> "/pricing"
 * "/resources/demo#abc"  -> "/resources/demo"
 */
const normalizePath = (
  path: string
): string => {
  if (!path) {
    return '/';
  }

  let value = path.trim();

  /**
   * Remove domain if a complete URL was supplied.
   */
  value = value.replace(
    /^https?:\/\/[^/]+/i,
    ''
  );

  /**
   * Remove query parameters.
   */
  value = value.split('?')[0];

  /**
   * Remove hash.
   */
  value = value.split('#')[0];

  /**
   * Remove duplicate leading/trailing slashes.
   */
  value = value.replace(
    /^\/+|\/+$/g,
    ''
  );

  return value
    ? `/${value}`
    : '/';
};

export const useSEO = (
  options: UseSEOOptions
) => {
  const {
    path,

    fallbackTitle =
      'Qubi Flow Orchestrator',

    fallbackDescription =
      'Enterprise workflow orchestration platform',

    fetchJsonLD = true,
  } = options;

  /**
   * Current normalized browser route.
   */
  const normalizedPath = useMemo(
    () => normalizePath(path),
    [path]
  );

  /**
   * Fallback metadata.
   *
   * This is ONLY temporary while Strapi is being fetched.
   */
  const fallbackMetadata = useMemo(
    (): SEOMetadata => ({
      id: normalizedPath,

      title: fallbackTitle,

      description:
        fallbackDescription,

      robots:
        'index, follow',
    }),
    [
      normalizedPath,
      fallbackTitle,
      fallbackDescription,
    ]
  );

  /**
   * IMPORTANT:
   *
   * Start every route with its fallback.
   *
   * We do NOT use Home bootstrap metadata here.
   */
  const [
    metadata,
    setMetadata,
  ] = useState<SEOMetadata | null>(
    fallbackMetadata
  );

  const [
    jsonLD,
    setJsonLD,
  ] = useState<JSONLDSchema | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  /**
   * ======================================================
   * IMPORTANT ROUTE CHANGE EFFECT
   * ======================================================
   *
   * Whenever React Router changes the URL:
   *
   * pricing -> home
   * home -> pricing
   * customers -> home
   *
   * immediately reset the SEO state for the new route.
   *
   * This prevents the previous page's metadata from
   * remaining in memory.
   */
  useEffect(() => {
    setMetadata(fallbackMetadata);

    setJsonLD(null);

    setLoading(true);

    setError(null);
  }, [
    normalizedPath,
    fallbackMetadata,
  ]);

  /**
   * ======================================================
   * FETCH SEO FROM STRAPI
   * ======================================================
   */
  useEffect(() => {
    let cancelled = false;

    const fetchSEOData =
      async () => {
        try {
          console.log(
            '[SEO] Fetching Strapi SEO for:',
            normalizedPath
          );

          setLoading(true);

          setError(null);

          /**
           * Fetch the current route.
           *
           * IMPORTANT:
           *
           * Home is ALSO fetched.
           *
           * / -> pages -> home
           */
          const seoData =
            await strapiAPI.fetchSEOMetadata(
              normalizedPath
            );

          if (cancelled) {
            return;
          }

          console.log(
            '[SEO] Strapi SEO response:',
            normalizedPath,
            seoData
          );

          /**
           * =================================================
           * STRAPI SEO FOUND
           * =================================================
           */
          if (
            seoData &&
            typeof seoData.title ===
              'string' &&
            seoData.title.trim()
          ) {
            console.log(
              '[SEO] Applying title:',
              seoData.title
            );

            setMetadata(
              seoData
            );

            /**
             * VERY IMPORTANT
             *
             * Explicitly update browser tab.
             *
             * This guarantees that React Router navigation
             * updates the browser title without requiring
             * a page refresh.
             */
            document.title =
              seoData.title;
          } else {
            /**
             * =================================================
             * NO SEO FOUND
             * =================================================
             */
            console.warn(
              '[SEO] No SEO metadata found for:',
              normalizedPath
            );

            setMetadata(
              fallbackMetadata
            );

            /**
             * Use fallback only if Strapi did not return
             * valid SEO.
             */
            document.title =
              fallbackMetadata.title;
          }

          /**
           * =================================================
           * JSON-LD
           * =================================================
           */
          if (fetchJsonLD) {
            const schemaData =
              await strapiAPI.fetchJSONLDSchema(
                normalizedPath
              );

            if (cancelled) {
              return;
            }

            setJsonLD(
              schemaData
            );
          } else {
            setJsonLD(null);
          }
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            '[SEO] Failed to fetch SEO:',
            normalizedPath,
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : 'Failed to fetch SEO data'
          );

          /**
           * Keep the fallback for this route.
           *
           * NEVER use another page's metadata.
           */
          setMetadata(
            fallbackMetadata
          );

          document.title =
            fallbackMetadata.title;

          setJsonLD(null);
        } finally {
          if (cancelled) {
            return;
          }

          setLoading(false);
        }
      };

    void fetchSEOData();

    return () => {
      cancelled = true;
    };
  }, [
    normalizedPath,
    fallbackMetadata,
    fetchJsonLD,
  ]);

  /**
   * ======================================================
   * SAFETY EFFECT
   * ======================================================
   *
   * If another component changes document.title,
   * re-apply the current SEO title whenever metadata
   * changes.
   */
  useEffect(() => {
    if (
      metadata?.title &&
      metadata.title.trim()
    ) {
      document.title =
        metadata.title;
    }
  }, [
    metadata,
  ]);

  return {
    metadata,
    jsonLD,
    loading,
    error,
  };
};