/**
 * SEO Data Types (matching Strapi schema)
 */

export interface SEOMetadata {
  id: string;
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
}

export interface JSONLDSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface RedirectRule {
  id: string;
  from: string;
  to: string;
  type: 'permanent_301' | 'temporary_302' | 'temporary_307';
  isActive: boolean;
}

export interface NotFoundLog {
  url: string;
  hits?: number;
}

export interface SEOContextType {
  metadata: SEOMetadata | null;
  loading: boolean;
  error: string | null;
  jsonLD: JSONLDSchema | null;
  fetchSEOData: (path: string) => Promise<void>;
  setSEOData: (data: Partial<SEOMetadata>) => void;
}

// Strapi-specific types
export interface StrapiPageAttributes {
  title: string;
  slug: string;
  content?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    keywords?: string;
    canonicalURL?: string;
    metaImage?: any;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: any;
    twitterCard?: 'summary' | 'summary_large_image';
    schema?: JSONLDSchema;
    seoScore?: number;
    seoAnalysis?: any;
  };
}

export interface StrapiPageItem {
  id: string | number;
  attributes: StrapiPageAttributes;
}

export interface StrapiPageResponse {
  data: Array<StrapiPageItem | (StrapiPageAttributes & { id: string | number; documentId?: string })>;
  meta: any;
}

