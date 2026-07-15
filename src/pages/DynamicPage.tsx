import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";
import { PageBuilderRenderer } from "@/components/PageBuilderRenderer";
import { getPageBlocks } from "@/lib/strapi";
import NotFound from "@/pages/NotFound";

/**
 * Generic page route. Any page a client creates in Strapi (any slug, any
 * combination of pageBuilder blocks) is reachable here automatically —
 * no route, no page file, no code change required.
 *
 * This must stay generic: no page-specific logic or hardcoded slug values
 * belong in this file.
 */
/** Root path ("/") carries no slug text in the URL, so it needs one default —
 *  this is the single place that maps it to the site's home page document. */
const ROOT_SLUG = "home";

const DynamicPage = () => {
  const { slug = ROOT_SLUG } = useParams<{ slug: string }>();

  const { data: blocks, isLoading } = useQuery({
    queryKey: ["page-blocks", slug],
    queryFn: () => getPageBlocks(slug),
    staleTime: 5 * 60 * 1000,
  });

  const { metadata, jsonLD } = useSEO({
    path: `/${slug}`,
    fallbackTitle: "Qubi Flow Orchestrator",
    fallbackDescription: "Enterprise workflow orchestration platform",
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background" aria-hidden="true" />;
  }

  if (!blocks || blocks.length === 0) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen">
      <SEOHead metadata={metadata} jsonLD={jsonLD} />
      <Navbar />
      <main id="main-content">
        <PageBuilderRenderer blocks={blocks} />
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPage;
