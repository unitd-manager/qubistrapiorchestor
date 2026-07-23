import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { getResourcePageBlocks } from "@/lib/strapi";
import { PageBuilderRenderer } from "@/components/PageBuilderRenderer";

const ResourcePage = () => {
  // Reads whatever slug is in the URL — /resources/product, /resources/demo,
  // /resources/anything-a-client-creates-later — no hardcoded slug.
  const { slug } = useParams<{ slug: string }>();

  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: `/resources/${slug}`,
    fallbackTitle: "Resources | Qubi Flow Orchestrator",
    fallbackDescription: "Learn more about Qubi Flow Orchestrator.",
  });

  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["resource-page", slug],
    queryFn: () => getResourcePageBlocks(slug!),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });

  if (seoLoading || blocksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!blocks || blocks.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
          Page not found.
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead metadata={metadata} jsonLD={jsonLD} />
      <Navbar />
      <PageBuilderRenderer blocks={blocks} />
      <Footer />
    </div>
  );
};

export default ResourcePage;