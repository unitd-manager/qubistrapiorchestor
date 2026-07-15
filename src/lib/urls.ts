const ENV_SITE_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, "");

const sanitizeUrlInput = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const cleaned = value
    .trim()
    .replace(/`/g, "")
    .replace(/^["']+/, "")
    .replace(/["']+$/, "")
    .trim();

  return cleaned || undefined;
};

export const getSiteUrl = () => {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return ENV_SITE_URL || "";
};

export const toAbsoluteUrl = (value?: string | null) => {
  const trimmed = sanitizeUrlInput(value);
  if (!trimmed) {
    return undefined;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    const siteUrl = getSiteUrl();
    if (!siteUrl) {
      return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    }

    return new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, `${siteUrl}/`).toString();
  }
};

export const toCanonicalUrl = (path: string) => toAbsoluteUrl(path);
