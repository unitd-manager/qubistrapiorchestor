import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DemoPreviewSection from "@/components/DemoPreviewSection";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { DeferredSection } from "@/components/DeferredSection";
import { PageBuilderRenderer } from "@/components/PageBuilderRenderer";
import { getPageBlocks } from "@/lib/strapi";

const Index = () => {
  const { metadata, jsonLD } = useSEO({
    path: "/",
    fallbackTitle: "Qubi Flow Orchestrator - Enterprise Workflow Automation",
    fallbackDescription: "Streamline and automate your business workflows with Qubi Flow Orchestrator.",
  });

  const { data: blocks } = useQuery({
    queryKey: ["page-blocks", "home"],
    queryFn: () => getPageBlocks("home"),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  return (
    <div className="min-h-screen">
      <SEOHead metadata={metadata} jsonLD={jsonLD} />
      <Navbar />
      <main id="main-content">
        {blocks && blocks.length > 0 ? (
          <PageBuilderRenderer blocks={blocks} />
        ) : (
          <>
            <HeroSection />
            <DemoPreviewSection />
            <DeferredSection loader={() => import("@/components/ProblemSection")} minHeight="26rem" />
            <DeferredSection loader={() => import("@/components/CapabilitiesSection")} minHeight="30rem" />
            <DeferredSection loader={() => import("@/components/OutcomesSection")} minHeight="26rem" />
            <DeferredSection loader={() => import("@/components/HowItWorksSection")} minHeight="28rem" />
            <DeferredSection loader={() => import("@/components/UseCasesSection")} minHeight="28rem" />
            <DeferredSection loader={() => import("@/components/IntegrationSection")} minHeight="26rem" />
            <DeferredSection loader={() => import("@/components/HumanInLoopSection")} minHeight="30rem" />
            <DeferredSection loader={() => import("@/components/AnalyticsSection")} minHeight="26rem" />
            <DeferredSection loader={() => import("@/components/FinalCTASection")} minHeight="22rem" />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
