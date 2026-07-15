# SEO Integration Guide

## Overview

This document describes the complete SEO integration system for the Qubi Flow Orchestrator frontend, which integrates with the Strapi backend SEO system.

## Features

- ✅ Fetch SEO metadata from Strapi API
- ✅ Inject meta tags (title, description, OG, Twitter)
- ✅ Render JSON-LD schemas
- ✅ Client-side redirect handling
- ✅ 404 error tracking
- ✅ Caching and optimization
- ✅ Reusable hooks and components

## Installation

Dependencies are already installed:
```bash
npm install react-helmet-async axios
```

## Environment Configuration

Create a `.env` file in the project root:

```env
# Strapi API Configuration
VITE_STRAPI_URL=http://localhost:1337/api
VITE_APP_URL=http://localhost:5173
```

## Architecture

### File Structure

```
src/
├── types/
│   └── seo.ts                 # SEO type definitions
├── lib/
│   └── strapi-api.ts          # Strapi API service
├── hooks/
│   ├── useSEO.ts              # Hook for SEO metadata
│   ├── useRedirects.ts        # Hook for redirects
│   └── use404Tracking.ts      # Hook for 404 tracking
├── components/
│   ├── SEOHead.tsx            # SEO meta tags component
│   └── RedirectHandler.tsx    # Redirect handler component
└── pages/
    ├── BlogPageExample.tsx    # Example page with SEO
    └── NotFound.tsx           # 404 page with tracking
```

## Usage

### 1. Basic SEO Setup in a Page

```tsx
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";

const MyPage = () => {
  const { metadata, jsonLD, loading } = useSEO({
    path: "/my-page",
    fallbackTitle: "My Page Title",
    fallbackDescription: "Page description",
    fetchJsonLD: true, // Optional: fetch JSON-LD schema
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SEOHead metadata={metadata} jsonLD={jsonLD} />
      
      {/* Your page content */}
      <div>
        <h1>{metadata?.title}</h1>
        <p>{metadata?.description}</p>
      </div>
    </>
  );
};

export default MyPage;
```

### 2. Adding Custom Meta Tags

```tsx
<SEOHead 
  metadata={metadata} 
  jsonLD={jsonLD}
  additionalMeta={{
    "article:author": "John Doe",
    "article:published_time": "2024-01-01T00:00:00Z",
    "article:section": "Technology",
  }}
/>
```

### 3. Handling Redirects

The `RedirectHandler` component automatically manages redirects:

```tsx
// In App.tsx - already configured
<BrowserRouter>
  <RedirectHandler enabled={true} />
  <Routes>
    {/* routes */}
  </Routes>
</BrowserRouter>
```

Manual redirect handling:

```tsx
import { useRedirects } from "@/hooks/useRedirects";

const MyComponent = () => {
  const { checkAndApplyRedirect } = useRedirects({
    onRedirect: (from, to) => {
      console.log(`Redirecting from ${from} to ${to}`);
    },
  });

  // Check for redirects when needed
  const handleNavigation = async () => {
    await checkAndApplyRedirect("/old-page");
  };

  return <button onClick={handleNavigation}>Check Redirect</button>;
};
```

### 4. 404 Tracking

The `use404Tracking` hook automatically logs 404 errors:

```tsx
import { use404Tracking } from "@/hooks/use404Tracking";

const NotFound = () => {
  // Automatically logs this page view as a 404
  use404Tracking({ enabled: true, debounceMs: 1000 });

  return <div>Page not found</div>;
};
```

## API Endpoints (Strapi Backend)

The system interacts with these Strapi endpoints:

### 1. Fetch SEO Metadata
```
GET /api/pages?filters[path][$eq]=/path&populate=seo
```

### 2. Fetch JSON-LD Schema
```
GET /api/pages?filters[path][$eq]=/path&populate=jsonLD
```

### 3. Fetch Active Redirects
```
GET /api/redirects?filters[isActive][$eq]=true&pagination[limit]=1000
```

### 4. Log 404 Error
```
POST /api/not-found-logs
{
  "data": {
    "url": "/not-found-path",
    "referrer": "...",
    "userAgent": "..."
  }
}
```

## Caching Strategy

The system implements multiple caching strategies:

### 1. Redirect Caching
Redirects are cached in `sessionStorage` to minimize API calls:
```ts
const cached = sessionStorage.getItem('strapi_redirects');
```

### 2. React Query Integration
For more complex scenarios, use React Query:
```tsx
import { useQuery } from "@tanstack/react-query";
import { strapiAPI } from "@/lib/strapi-api";

const usePageSEO = (path: string) => {
  return useQuery({
    queryKey: ["seo", path],
    queryFn: () => strapiAPI.fetchSEOMetadata(path),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
```

## JSON-LD Schema Examples

### Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Qubi Flow Orchestrator",
  "url": "https://qubi.com",
  "logo": "https://qubi.com/logo.png",
  "sameAs": [
    "https://twitter.com/qubi",
    "https://linkedin.com/company/qubi"
  ]
}
```

### BlogPosting Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Getting Started with Workflow Orchestration",
  "datePublished": "2024-01-01T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "image": "https://example.com/image.jpg"
}
```

### LocalBusiness Schema
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Qubi",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94105"
  },
  "telephone": "(415) 555-0100"
}
```

## Performance Optimization

### 1. Lazy Load SEO Data
```tsx
const { metadata, loading } = useSEO({
  path: "/heavy-page",
  fetchJsonLD: false, // Don't fetch if not needed
});
```

### 2. Prefetch on Hover
```tsx
import { useCallback } from "react";
import { strapiAPI } from "@/lib/strapi-api";

const Link = ({ href, children }: any) => {
  const handleMouseEnter = useCallback(() => {
    // Prefetch SEO data on hover
    strapiAPI.fetchSEOMetadata(href);
  }, [href]);

  return (
    <a href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </a>
  );
};
```

### 3. Monitor API Calls
```tsx
// Add performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name.includes('/api/')) {
      console.log(`API call: ${entry.name} took ${entry.duration}ms`);
    }
  }
});

observer.observe({ entryTypes: ['measure'] });
```

## Testing SEO

### 1. Local Testing
```bash
# Start frontend
npm run dev

# Visit pages and check:
# - Meta tags in browser DevTools
# - Network requests in Console
# - React DevTools to inspect components
```

### 2. SEO Audit Tools
- [Google Search Console](https://search.google.com/search-console)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)

### 3. Meta Tag Validation
```bash
# Check Open Graph tags
curl -I https://localhost:5173/

# View rendered meta tags
curl https://localhost:5173/ | grep "<meta"
```

## Troubleshooting

### Issue: SEO data not loading
1. Check Strapi API is running: `curl http://localhost:1337/api/pages`
2. Verify VITE_STRAPI_URL in `.env`
3. Check browser console for errors
4. Check Strapi network tab

### Issue: Redirects not working
1. Verify redirects are marked `isActive: true` in Strapi
2. Check path matching in `resolveRedirect()` method
3. Use browser DevTools to trace redirect logic
4. Check `sessionStorage` for cached redirects

### Issue: 404 not being tracked
1. Verify NotFound page is being rendered
2. Check API endpoint is accessible
3. Look for CORS errors in console
4. Verify Strapi is running

## Best Practices

1. **Always provide fallback titles/descriptions**
   ```tsx
   fallbackTitle: "Page Title | Qubi"
   ```

2. **Use canonical URLs**
   ```tsx
   metadata?.canonical // Automatically set
   ```

3. **Optimize images for OG tags**
   - Use 1200x630px images
   - Keep file size < 1MB
   - Use jpg/png formats

4. **Structure data for searchability**
   - Use semantic HTML (`<h1>`, `<article>`, etc.)
   - Include JSON-LD schemas
   - Use descriptive links

5. **Monitor 404s regularly**
   - Check Strapi dashboard for 404 logs
   - Fix broken links promptly
   - Set up redirects for old URLs

6. **Cache responsibly**
   - Invalidate cache when content changes
   - Use appropriate TTLs
   - Monitor cache hit rates

## Advanced Usage

### Custom API Client

```tsx
import { strapiAPI } from "@/lib/strapi-api";

// Add custom headers
const customAPI = strapiAPI;
customAPI.api.defaults.headers.common['X-Custom-Header'] = 'value';

// Use custom fetch
const data = await customAPI.fetchSEOMetadata('/custom-path');
```

### Middleware Pattern

```tsx
// Create reusable middleware
const withSEO = (Component: React.FC<any>, path: string) => {
  return (props: any) => {
    const { metadata, jsonLD } = useSEO({ path });
    return (
      <>
        <SEOHead metadata={metadata} jsonLD={jsonLD} />
        <Component {...props} metadata={metadata} />
      </>
    );
  };
};

// Use it
const WrappedPage = withSEO(BlogPage, "/resources/blog");
```

### Integration with Third-party Analytics

```tsx
// Track page views with SEO context
useEffect(() => {
  if (metadata) {
    // Send to analytics with SEO data
    analytics.track('page_view', {
      title: metadata.title,
      path: metadata.canonical,
    });
  }
}, [metadata]);
```

## Support & Documentation

- [React Helmet Async Docs](https://github.com/steverikard/react-helmet-async)
- [Strapi REST API Docs](https://docs.strapi.io/developer-docs/latest/api/rest.html)
- [Schema.org Documentation](https://schema.org/)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
