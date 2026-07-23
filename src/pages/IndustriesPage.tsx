import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { PageBuilderRenderer } from "@/components/PageBuilderRenderer";
import { getPageBlocks } from "@/lib/strapi";

/**
 * Solutions > Industries page. Content comes entirely from the Strapi Page
 * entry with slug "solutions-industries", using the same solutions-*
 * pageBuilder blocks as the Use Cases page:
 *   - Solutions - Hero Banner      → hero
 *   - Solutions Industry Layout    → the 6 industry cards grid
 *   - Solutions - Execution Flow   → "What qBotica Actually Does" 4-card row
 *   - Solutions Final CTA          → closing CTA
 *
 * This replaces the old legacy sections/categories/contents fetching
 * (getHomeSection, getCategories, getContents, seed-industries-page.ps1)
 * that page used previously.
 *
 * Note: "Comparison" (Others vs qubi) and "Why Enterprise AI Fails" from the
 * old version don't have an equivalent solutions-* component yet — they are
 * intentionally left out of this pageBuilder version for now. Say the word
 * if you want two new components built for those.
 */
const PAGE_SLUG = "solutions-industries";

const IndustriesPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: PAGE_SLUG,
    fallbackTitle: "Industries | Qubi Flow Orchestrator",
    fallbackDescription: "Industry-specific solutions for Qubi Flow Orchestrator.",
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

export default IndustriesPage;