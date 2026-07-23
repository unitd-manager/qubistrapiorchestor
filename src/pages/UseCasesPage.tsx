import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { PageBuilderRenderer } from "@/components/PageBuilderRenderer";
import { getPageBlocks } from "@/lib/strapi";

/**
 * Solutions > Use Cases page. Content comes entirely from the Strapi Page
 * entry with slug "solutions-use-cases" — all six pageBuilder blocks
 * (Hero Banner, Stats Band, Use Cases Layout, Industry Layout,
 * Execution Flow, Final CTA) render through the shared PageBuilderRenderer,
 * same as every other page. No hardcoded content lives here anymore.
 *
 * Note: the Strapi slug uses a hyphen ("solutions-use-cases") because
 * Strapi's uid field type rejects "/". The route URL itself still stays
 * "/solutions/use-cases" — that's just React Router and is unrelated to
 * the Strapi slug lookup key.
 */
const PAGE_SLUG = "solutions-use-cases";

const UseCasesPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: PAGE_SLUG,
    fallbackTitle: "Use Cases | Qubi Flow Orchestrator",
    fallbackDescription: "Explore use cases for Qubi Flow Orchestrator across various industries.",
  });

  const { data: blocks = [], isLoading: blocksLoading } = useQuery({
    queryKey: ["page-blocks", PAGE_SLUG],
    queryFn: () => getPageBlocks(PAGE_SLUG),
    staleTime: 5 * 60 * 1000,
  });

  if (seoLoading || blocksLoading) {
    return <div className="min-h-screen bg-background" aria-hidden="true" />;
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

export default UseCasesPage;