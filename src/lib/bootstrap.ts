import type { NavbarSectionData } from "@/lib/strapi";
import type { JSONLDSchema, SEOMetadata } from "@/types/seo";

export interface BootstrapImageSource {
  src: string;
  width: number;
}

export interface BootstrapHeroImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  sources: BootstrapImageSource[];
}

export interface BootstrapHeroData {
  badge: string;
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaUrl: string;
  image?: BootstrapHeroImage;
}

export interface BootstrapDemoData {
  videoTitle: string;
  videoDuration: string;
}

export interface RouteBootstrapData {
  seo?: {
    metadata: SEOMetadata;
    jsonLD?: JSONLDSchema | null;
  };
  home?: {
    hero?: BootstrapHeroData;
    demo?: BootstrapDemoData;
    seoContentHtml?: string;
  };
}

export interface AppBootstrapData {
  navbar?: NavbarSectionData[];
  routes?: Record<string, RouteBootstrapData>;
}

const normalizePath = (path: string) => {
  if (!path) return "/";
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+/, "").replace(/\/+$/, "")}`;
};

export const getAppBootstrapData = (): AppBootstrapData | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.__QUBI_BOOTSTRAP__;
};

export const getNavbarBootstrapData = (): NavbarSectionData[] | undefined => getAppBootstrapData()?.navbar;

export const getRouteBootstrapData = (path: string): RouteBootstrapData | undefined => {
  const normalizedPath = normalizePath(path);
  return getAppBootstrapData()?.routes?.[normalizedPath];
};

export const getHeroImageSrcSet = (image?: BootstrapHeroImage) =>
  image?.sources?.map((source) => `${source.src} ${source.width}w`).join(", ");
