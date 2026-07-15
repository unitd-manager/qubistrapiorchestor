/**
 * Custom Hook: use404Tracking
 * Tracks 404 page visits
 */

import { useEffect } from 'react';
import { strapiAPI } from '@/lib/strapi-api';

interface Use404TrackingOptions {
  enabled?: boolean;
  debounceMs?: number;
}

export const use404Tracking = (options: Use404TrackingOptions = {}) => {
  const { enabled = true, debounceMs = 1000 } = options;

  useEffect(() => {
    if (!enabled) return;

    let debounceTimer: ReturnType<typeof setTimeout>;

    const track404 = () => {
      debounceTimer = setTimeout(() => {
        strapiAPI.log404Error(window.location.pathname);
      }, debounceMs);
    };

    track404();

    return () => clearTimeout(debounceTimer);
  }, [enabled, debounceMs]);
};
