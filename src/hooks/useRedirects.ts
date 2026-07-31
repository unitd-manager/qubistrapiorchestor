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

const API_BASE_URL = import.meta.env.DEV
  ? `${import.meta.env.VITE_STRAPI_URL ?? 'http://localhost:1338'}/api`
  : '/api';

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
  const url = `${API_BASE_URL}/redirects?filters[isActive][$eq]=true&pagination[limit]=1000`;

  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!res.ok) {
    console.error(`[useRedirects] Fetch failed: ${res.status} ${res.statusText} — ${url}`);
    return [];
  }

  const body = await res.json();
  const items: unknown[] = Array.isArray(body?.data) ? body.data : [];

  const rules: RedirectRule[] = [];
  for (const item of items) {
    if (typeof item !== 'object' || item === null) continue;
    const attrs = 'attributes' in item && typeof (item as any).attributes === 'object'
      ? (item as any).attributes
      : item;

    const { from, to, type, isActive } = attrs as Record<string, unknown>;
    if (typeof from !== 'string' || typeof to !== 'string') continue;

    rules.push({
      id: String((item as any).id ?? ''),
      from,
      to,
      type: (type as RedirectRule['type']) ?? 'permanent_301',
      isActive: isActive !== false,
    });
  }

  console.log(`[useRedirects] Loaded ${rules.length} active redirect rule(s):`, rules);
  return rules;
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
        console.log('[useRedirects] Redirects not loaded yet, skipping check for', currentPath);
        return;
      }

      const normalizedCurrent = normalizePath(currentPath);
      if (!normalizedCurrent) return;

      const match = redirects.find((rule) => normalizePath(rule.from) === normalizedCurrent);

      if (!match) {
        console.log(`[useRedirects] No redirect rule matches "${normalizedCurrent}"`);
        return;
      }

      console.log(`[useRedirects] MATCH: "${normalizedCurrent}" → "${match.to}" (${match.type})`);

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