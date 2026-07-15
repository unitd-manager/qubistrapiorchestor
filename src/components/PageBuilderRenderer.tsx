import type { ComponentType } from "react";
import HeroSection from "@/components/HeroSection";
import DemoPreviewSection from "@/components/DemoPreviewSection";
import ProblemSection from "@/components/ProblemSection";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import OutcomesSection from "@/components/OutcomesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import UseCasesSection from "@/components/UseCasesSection";
import IntegrationSection from "@/components/IntegrationSection";
import HumanInLoopSection from "@/components/HumanInLoopSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import FinalCTASection from "@/components/FinalCTASection";
import SimpleHeroSection from "@/components/SimpleHeroSection";
import StatsSection from "@/components/StatsSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import StorySection from "@/components/StorySection";
import DifferentiatorsSection from "@/components/DifferentiatorsSection";
import BlogListSection from "@/components/BlogListSection";
import SubscribeCtaSection from "@/components/SubscribeCtaSection";
import CalloutSection from "@/components/CalloutSection";
import PlansSection from "@/components/PlansSection";
import IconGridSection from "@/components/IconGridSection";
import ExecutionSection from "@/components/ExecutionSection";
import ComparisonSection from "@/components/ComparisonSection";
import FaqSection from "@/components/FaqSection";
import type { PageBlock } from "@/lib/strapi";

const BLOCK_COMPONENTS: Record<string, ComponentType<any>> = {
  "acf-sections.qubi-home-hero": HeroSection,
  "acf-sections.qubi-demo-preview": DemoPreviewSection,
  "acf-sections.qubi-problem-section": ProblemSection,
  "acf-sections.qubi-capabilities-section": CapabilitiesSection,
  "acf-sections.qubi-outcomes-section": OutcomesSection,
  "acf-sections.qubi-how-it-works-section": HowItWorksSection,
  "acf-sections.qubi-use-cases-section": UseCasesSection,
  "acf-sections.qubi-integration-section": IntegrationSection,
  "acf-sections.qubi-human-in-loop-section": HumanInLoopSection,
  "acf-sections.qubi-analytics-section": AnalyticsSection,
  "acf-sections.qubi-final-cta-section": FinalCTASection,
  "acf-sections.qubi-simple-hero": SimpleHeroSection,
  "acf-sections.qubi-stats-section": StatsSection,
  "acf-sections.qubi-case-studies-section": CaseStudiesSection,
  "acf-sections.qubi-story-section": StorySection,
  "acf-sections.qubi-differentiators-section": DifferentiatorsSection,
  "acf-sections.qubi-callout-section": CalloutSection,
  "acf-sections.qubi-plans-section": PlansSection,
  "acf-sections.qubi-icon-grid-section": IconGridSection,
  "acf-sections.qubi-execution-section": ExecutionSection,
  "acf-sections.qubi-comparison-section": ComparisonSection,
  "acf-sections.qubi-faq-section": FaqSection,
  "acf-sections.qubi-blog-list-section": BlogListSection,
  "acf-sections.qubi-subscribe-cta-section": SubscribeCtaSection,
};

export function PageBuilderRenderer({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        const Component = BLOCK_COMPONENTS[block.__component];
        if (!Component) {
          if (import.meta.env.DEV) {
            console.warn("[PageBuilderRenderer] No component for:", block.__component);
          }
          return null;
        }
        // Strapi v5 blocks are flat — spread the block fields directly as props.
        // Component ids are only unique per component type, so a page using the
        // same block type twice can repeat an id; the index keeps keys unique.
        const { id, __component, ...props } = block;
        return <Component key={`${__component}-${id ?? "x"}-${i}`} {...props} />;
      })}
    </>
  );
}
