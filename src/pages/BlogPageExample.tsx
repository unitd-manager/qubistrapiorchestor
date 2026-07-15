/**
 * Example Page with Full SEO Integration
 * Demonstrates how to use the SEO system
 */

import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";

const BlogPageExample = () => {
  const { metadata, jsonLD, loading } = useSEO({
    path: "/resources/blog",
    fallbackTitle: "Blog | Qubi Flow Orchestrator",
    fallbackDescription: "Latest articles and insights about workflow orchestration and automation",
    fetchJsonLD: true,
  });

  if (loading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Metadata */}
      <SEOHead 
        metadata={metadata} 
        jsonLD={jsonLD}
        additionalMeta={{
          "article:published_time": new Date().toISOString(),
          "article:author": "Qubi Team",
        }}
      />

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{metadata?.title || "Blog"}</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {metadata?.description}
          </p>

          {/* Featured Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {/* Article cards would go here */}
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                Getting Started with Workflow Orchestration
              </h3>
              <p className="text-muted-foreground mb-4">
                Learn the basics of workflow orchestration and how it can streamline your business processes.
              </p>
              <a href="#" className="text-primary hover:underline">
                Read More →
              </a>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                Best Practices for API Integration
              </h3>
              <p className="text-muted-foreground mb-4">
                Discover best practices for integrating APIs into your workflow orchestration platform.
              </p>
              <a href="#" className="text-primary hover:underline">
                Read More →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPageExample;
