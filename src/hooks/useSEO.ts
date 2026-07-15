/**
 * Custom Hook: useSEO
 * Manages SEO metadata and JSON-LD for a page
 */

import { useEffect, useMemo, useState } from 'react';
import { getRouteBootstrapData } from '@/lib/bootstrap';
import { SEOMetadata, JSONLDSchema } from '@/types/seo';
import { strapiAPI } from '@/lib/strapi-api';

interface UseSEOOptions {
  path: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fetchJsonLD?: boolean;
}

export const useSEO = (options: UseSEOOptions) => {
  const {
    path,
    fallbackTitle = 'Qubi Flow Orchestrator',
    fallbackDescription = 'Enterprise workflow orchestration platform',
    fetchJsonLD = true,
  } = options;

  const fallbackMetadata = useMemo<SEOMetadata>(
    () => ({
      id: path,
      title: fallbackTitle,
      description: fallbackDescription,
      robots: 'index, follow',
    }),
    [fallbackDescription, fallbackTitle, path]
  );
  const bootstrappedRoute = getRouteBootstrapData(path);
  const bootstrappedMetadata = bootstrappedRoute?.seo?.metadata ?? null;
  const bootstrappedJsonLD = fetchJsonLD ? bootstrappedRoute?.seo?.jsonLD ?? null : null;

  const [metadata, setMetadata] = useState<SEOMetadata | null>(bootstrappedMetadata ?? fallbackMetadata);
  const [jsonLD, setJsonLD] = useState<JSONLDSchema | null>(bootstrappedJsonLD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSEOData = async () => {
      if (bootstrappedMetadata) {
        setMetadata(bootstrappedMetadata);
        setJsonLD(bootstrappedJsonLD);
        setLoading(false);
        setError(null);
        return;
      }

      setMetadata(fallbackMetadata);
      setJsonLD(null);

      try {
        setError(null);

        // Fetch SEO metadata
        const seoData = await strapiAPI.fetchSEOMetadata(path);
        if (cancelled) return;

        if (seoData) {
          setMetadata(seoData);
        } else {
          setMetadata(fallbackMetadata);
        }

        // Fetch JSON-LD if requested
        if (fetchJsonLD) {
          const schemaData = await strapiAPI.fetchJSONLDSchema(path);
          if (cancelled) return;
          if (schemaData) {
            setJsonLD(schemaData);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch SEO data');
        setMetadata(fallbackMetadata);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    fetchSEOData();

    return () => {
      cancelled = true;
    };
  }, [bootstrappedJsonLD, bootstrappedMetadata, fallbackMetadata, fetchJsonLD, path]);

  return { metadata, jsonLD, loading, error };
};
