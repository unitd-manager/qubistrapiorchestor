/**
 * Custom Hook: useSEO
 *
 * SEO behaviour:
 *
 * HOME:
 *   / 
 *   -> uses Home bootstrap SEO
 *
 * OTHER PAGES:
 *   /customers
 *   /pricing
 *   /solutions/...
 *   /resources/...
 *
 *   -> fetches that specific page from Strapi
 *   -> reads that page's SEO component
 *   -> uses that page's metaTitle
 *
 * IMPORTANT:
 * Home page SEO is NEVER used as the SEO for another route.
 */

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getRouteBootstrapData,
} from '@/lib/bootstrap';

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
 * Normalize a browser route.
 *
 * Examples:
 *
 * "/customers/"       -> "/customers"
 * "customers"         -> "/customers"
 * "/pricing?x=1"      -> "/pricing"
 * "/"                 -> "/"
 */
const normalizePath = (
  path: string
): string => {
  if (!path) {
    return '/';
  }

  let value = path.trim();

  // Remove domain if a complete URL was supplied.
  value = value.replace(
    /^https?:\/\/[^/]+/i,
    ''
  );

  // Remove query parameters.
  value = value.split('?')[0];

  // Remove hash.
  value = value.split('#')[0];

  // Remove duplicate leading/trailing slashes.
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
   * Current browser route.
   */
  const normalizedPath =
    normalizePath(path);

  /**
   * VERY IMPORTANT:
   *
   * Only "/" is the Home page.
   */
  const isHomePage =
    normalizedPath === '/';

  /**
   * ---------------------------------------------------------
   * HOME BOOTSTRAP DATA
   * ---------------------------------------------------------
   *
   * We only read bootstrap SEO for Home.
   *
   * This prevents Home's SEO from being reused by:
   *
   * /customers
   * /pricing
   * /solutions
   * /resources
   */
  const bootstrappedRoute =
    isHomePage
      ? getRouteBootstrapData(
          normalizedPath
        )
      : null;

  const bootstrappedMetadata =
    isHomePage
      ? (
          bootstrappedRoute?.seo
            ?.metadata ?? null
        )
      : null;

  const bootstrappedJsonLD =
    isHomePage && fetchJsonLD
      ? (
          bootstrappedRoute?.seo
            ?.jsonLD ?? null
        )
      : null;

  /**
   * ---------------------------------------------------------
   * FALLBACK METADATA
   * ---------------------------------------------------------
   */
  const fallbackMetadata =
    useMemo<SEOMetadata>(
      () => ({
        id: normalizedPath,

        title:
          fallbackTitle,

        description:
          fallbackDescription,

        robots:
          'index, follow',
      }),
      [
        fallbackDescription,
        fallbackTitle,
        normalizedPath,
      ]
    );

  /**
   * ---------------------------------------------------------
   * INITIAL METADATA
   * ---------------------------------------------------------
   *
   * HOME:
   *   Use bootstrap immediately.
   *
   * OTHER PAGES:
   *   Do NOT use Home bootstrap.
   *
   *   Start with the page fallback only until Strapi
   *   returns the actual page SEO.
   */
  const initialMetadata =
    isHomePage &&
    bootstrappedMetadata
      ? bootstrappedMetadata
      : fallbackMetadata;

  const [
    metadata,
    setMetadata,
  ] = useState<SEOMetadata | null>(
    initialMetadata
  );

  const [
    jsonLD,
    setJsonLD,
  ] = useState<JSONLDSchema | null>(
    isHomePage
      ? bootstrappedJsonLD
      : null
  );

  const [
    loading,
    setLoading,
  ] = useState<boolean>(
    !(
      isHomePage &&
      bootstrappedMetadata
    )
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    const fetchSEOData =
      async () => {
        /**
         * ---------------------------------------------------
         * HOME PAGE
         * ---------------------------------------------------
         *
         * Home can use bootstrap SEO.
         */
        if (
          isHomePage &&
          bootstrappedMetadata
        ) {
          if (cancelled) {
            return;
          }

          setMetadata(
            bootstrappedMetadata
          );

          setJsonLD(
            bootstrappedJsonLD
          );

          setLoading(false);

          setError(null);

          return;
        }

        /**
         * ---------------------------------------------------
         * EVERY NON-HOME PAGE
         * ---------------------------------------------------
         *
         * This is the important part.
         *
         * We ALWAYS ask Strapi for THIS route.
         *
         * Examples:
         *
         * /customers
         * /pricing
         * /solutions/healthcare
         * /resources/faqs
         */
        setLoading(true);

        setError(null);

        try {
          console.log(
            '[SEO] Fetching Strapi SEO for:',
            normalizedPath
          );

          /**
           * Fetch THIS PAGE's SEO.
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
           * -------------------------------------------------
           * STRAPI PAGE FOUND
           * -------------------------------------------------
           *
           * seoData.title should be:
           *
           * Strapi:
           * SEO -> Meta Title
           */
          if (
            seoData &&
            typeof seoData.title ===
              'string' &&
            seoData.title.trim()
          ) {
            setMetadata(
              seoData
            );
          } else {
            /**
             * No SEO metadata found.
             *
             * Keep the current page's fallback.
             *
             * NEVER use Home metadata here.
             */
            setMetadata(
              (current) => {
                if (
                  current?.title &&
                  current.title.trim()
                ) {
                  return current;
                }

                return fallbackMetadata;
              }
            );
          }

          /**
           * -------------------------------------------------
           * JSON-LD
           * -------------------------------------------------
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
           * IMPORTANT:
           *
           * Don't replace the current page title
           * with Home SEO if the API fails.
           */
          setMetadata(
            (current) => {
              if (
                current?.title &&
                current.title.trim()
              ) {
                return current;
              }

              return fallbackMetadata;
            }
          );

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
    bootstrappedJsonLD,
    bootstrappedMetadata,
    fallbackMetadata,
    fetchJsonLD,
    isHomePage,
    normalizedPath,
  ]);

  return {
    metadata,
    jsonLD,
    loading,
    error,
  };
};