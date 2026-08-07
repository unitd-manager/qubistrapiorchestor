/**
 * useRedirects — fetches active redirect rules from Strapi and checks the
 * current path against them, navigating away if a match is found.
 *
 * Rewritten to be intentionally simple: no sessionStorage caching (that
 * was masking test results during debugging), clear console logging at
 * every step, and a single normalization function shared for both sides
 * of the comparison.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { strapiAPI } from '@/lib/strapi-api';

interface RedirectRule {
  id: string;
  from: string;
  to: string;
  type: 'permanent_301' | 'temporary_302' | 'temporary_307';
  isActive: boolean;
}

/** Strips protocol/domain and trailing slash so "/foo/", "foo", and
 *  "https://example.com/foo" all normalize to the same "/foo". */
function normalizePath(value: string): string | null {
  const raw = value?.trim();
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

async function fetchActiveRedirects(): Promise<RedirectRule[]> {
  // Pulls active redirect rules from Strapi (GET /api/redirects, isActive=true).
  return strapiAPI.fetchRedirects();
}

export function useRedirects() {
  const navigate = useNavigate();
  const [redirects, setRedirects] = useState<RedirectRule[] | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchActiveRedirects()
      .then(setRedirects)
      .catch((err) => {
        console.error('[useRedirects] Unexpected error fetching redirects:', err);
        setRedirects([]);
      });
  }, []);

  const checkAndApplyRedirect = useCallback(
    (currentPath: string) => {
      if (redirects === null) {
        return;
      }

      const normalizedCurrent = normalizePath(currentPath);
      if (!normalizedCurrent) return;

      const match = redirects.find((rule) => normalizePath(rule.from) === normalizedCurrent);

      if (!match) {
       
        return;
      }

     

      const targetPath = normalizePath(match.to);
      if (targetPath && !/^https?:\/\//i.test(match.to)) {
        // Same-app internal path — use client-side navigation.
        navigate(targetPath, { replace: true });
      } else {
        // External or absolute URL — full browser navigation.
        window.location.replace(match.to);
      }
    },
    [redirects, navigate]
  );

  return { redirects, loading: redirects === null, checkAndApplyRedirect };
}