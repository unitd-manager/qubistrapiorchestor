/**
 * Custom Hook: useRedirects
 * Handles client-side redirect resolution
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RedirectRule } from '@/types/seo';
import { strapiAPI } from '@/lib/strapi-api';

interface UseRedirectsOptions {
  enabled?: boolean;
  onRedirect?: (from: string, to: string) => void;
}

export const useRedirects = (options: UseRedirectsOptions = {}) => {
  const { enabled = true, onRedirect } = options;
  const navigate = useNavigate();
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [loading, setLoading] = useState(true);

  const sanitizeRedirectTarget = useCallback((value: string): string => {
    const trimmed = value.trim().replace(/`/g, '').trim();
    return trimmed.replace(/^["']+/, '').replace(/["']+$/, '').trim();
  }, []);

  useEffect(() => {
    const fetchRedirects = async () => {
      try {
        const cacheKey = 'strapi_redirects_v2';
        const cached = !import.meta.env.DEV ? sessionStorage.getItem(cacheKey) : null;
        if (cached) {
          try {
            setRedirects(JSON.parse(cached));
          } catch {
            sessionStorage.removeItem(cacheKey);
          }
        }

        const rules = await strapiAPI.fetchRedirects();
        setRedirects(rules);
        if (!import.meta.env.DEV) {
          sessionStorage.setItem(cacheKey, JSON.stringify(rules));
        }
      } catch (err) {
        console.error('Error fetching redirects:', err);
      } finally {
        setLoading(false);
      }
    };

    if (enabled) {
      fetchRedirects();
    }
  }, [enabled]);

  /**
   * Check current path against redirect rules
   */
  const checkAndApplyRedirect = useCallback(async (currentPath: string) => {
    if (!enabled || loading) return;

    const redirectTarget = await strapiAPI.resolveRedirect(currentPath, redirects);
    if (redirectTarget) {
      const cleanedTarget = sanitizeRedirectTarget(redirectTarget);
      if (onRedirect) {
        onRedirect(currentPath, cleanedTarget);
      }
      if (typeof window !== 'undefined' && /^https?:\/\//i.test(cleanedTarget)) {
        const targetUrl = new URL(cleanedTarget);
        if (targetUrl.origin === window.location.origin) {
          navigate(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`, { replace: true });
        } else {
          window.location.replace(cleanedTarget);
        }
      } else {
        const normalized = cleanedTarget.startsWith('/') ? cleanedTarget : `/${cleanedTarget}`;
        navigate(normalized, { replace: true });
      }
    }
  }, [enabled, loading, redirects, onRedirect, navigate, sanitizeRedirectTarget]);

  return {
    redirects,
    loading,
    checkAndApplyRedirect,
  };
};
