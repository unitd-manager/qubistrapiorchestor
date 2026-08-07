/**
 * Redirect Handler Component
 * Monitors route changes and applies redirect rules.
 * Mount this once, near the top of your app (e.g. in App.tsx, alongside
 * your <Routes>), so it runs on every navigation.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRedirects } from '@/hooks/useRedirects';

interface RedirectHandlerProps {
  enabled?: boolean;
}

export const RedirectHandler = ({ enabled = true }: RedirectHandlerProps) => {
  const location = useLocation();
  const { checkAndApplyRedirect, loading } = useRedirects();

  useEffect(() => {
    if (!enabled || loading) return;
    checkAndApplyRedirect(location.pathname);
  }, [enabled, location.pathname, loading, checkAndApplyRedirect]);

  return null;
};