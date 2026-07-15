import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart2,
  Bot,
  CheckCircle,
  FileText,
  Lightbulb,
  Link2,
  MessageSquare,
  MousePointerClick,
  Settings,
  Unplug,
  type LucideProps,
} from "lucide-react";
import type { ElementType } from "react";

const ICON_MAP: Record<string, ElementType<LucideProps>> = {
  BarChart2,
  Bot,
  FileText,
  Lightbulb,
  Link2,
  MousePointerClick,
  Settings,
  Unplug,
};

function DynamicIcon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
import { useQuery } from "@tanstack/react-query";
import { PageBuilderRenderer } from "@/components/PageBuilderRenderer";
import {
  getCategories,
  getHomeSection,
  getHomeSectionWithItems,
  getPageBlocks,
  stripHtml,
  type CategoryAttributes,
  type StrapiItem,
} from "@/lib/strapi";

// â”€â”€â”€ Static fallbacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function mapPlan(cat: StrapiItem<CategoryAttributes>) {
  const a = cat.attributes;
  const features = (a.internal_link ?? "").split("|").map((s) => s.trim()).filter(Boolean);
  return {
    id: cat.id,
    name: a.category_title,
    tagline: a.description_short ?? "",
    description: stripHtml(a.description),
    features: features.length > 0 ? features : ["See details"],
    cta: a.external_link ?? "Talk to Sales",
    highlight: a.display_type === "highlight",
  };
}


const PricingPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: "/pricing",
    fallbackTitle: "Pricing | Qubi Flow Orchestrator",
    fallbackDescription: "Explore pricing options for Qubi Flow Orchestrator.",
  });

  // Page-builder blocks (modern path — page with slug "pricing")
  const { data: blocks } = useQuery({
    queryKey: ["page-blocks", "pricing"],
    queryFn: () => getPageBlocks("pricing"),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
  const hasBlocks = (blocks?.length ?? 0) > 0;

  // Hero
  const { data: heroSection } = useQuery({
    queryKey: ["price-page-hero"],
    queryFn: () => getHomeSection("price_page_hero"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlocks,
  });

  // Callout
  const { data: calloutSection } = useQuery({
    queryKey: ["price-page-callout"],
    queryFn: () => getHomeSection("price_page_callout"),
    staleTime: 5 * 60 * 1000,
  });

  // Plans section heading
  const { data: plansSection } = useQuery({
    queryKey: ["price-page-plans-section"],
    queryFn: () => getHomeSection("price_page_plans"),
    staleTime: 5 * 60 * 1000,
  });
  // Plans categories
  const { data: plansCats, isLoading: plansLoading } = useQuery({
    queryKey: ["price-page-plans"],
    queryFn: () => getCategories({ categoryType: "pricing_plan" }),
    staleTime: 5 * 60 * 1000,
  });

  // Platform components
  const { data: componentsData } = useQuery({
    queryKey: ["price-page-components"],
    queryFn: () => getHomeSectionWithItems("price_page_components", "platform_component"),
    staleTime: 5 * 60 * 1000,
  });

  // Execution section
  const { data: executionData } = useQuery({
    queryKey: ["price-page-execution"],
    queryFn: () => getHomeSectionWithItems("price_page_execution", "problem_card"),
    staleTime: 5 * 60 * 1000,
  });

  // Comparison
  const { data: comparisonData } = useQuery({
    queryKey: ["price-page-comparison"],
    queryFn: () => getHomeSectionWithItems("price_page_comparison", "comparison_row"),
    staleTime: 5 * 60 * 1000,
  });

  // FAQ
  const { data: faqData } = useQuery({
    queryKey: ["price-page-faq"],
    queryFn: () => getHomeSectionWithItems("price_page_faq", "faq_item"),
    staleTime: 5 * 60 * 1000,
  });

  // CTA
  const { data: ctaSection } = useQuery({
    queryKey: ["price-page-cta"],
    queryFn: () => getHomeSection("price_page_cta"),
    staleTime: 5 * 60 * 1000,
  });

  // â”€â”€ Resolve values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const heroA = heroSection?.attributes;
  const heroBadge = heroA?.template ?? "Outcome-Based Pricing";
  const heroHeading = heroA?.section_title ?? "You pay for work completed, not licenses consumed";
  const heroSub = stripHtml(heroA?.description) || "qBotica is a managed service, not a software subscription. We run your operations end-to-end and charge based on outcomes delivered.";

  const calloutA = calloutSection?.attributes;
  const calloutIcon = calloutA?.display_type ?? "Lightbulb";
  const calloutHeading = calloutA?.section_title ?? "Automation-as-a-Service";
  const calloutBody = stripHtml(calloutA?.description) || "Unlike software platforms, qBotica is an execution partner. We design, deploy, and operate your AI workflows 24/7. No internal team needed. No implementation risk. Just outcomes.";

  const plansEyebrow = plansSection?.attributes?.template ?? "Plans";
  const plansHeading = plansSection?.attributes?.section_title ?? "Execution programs for every scale";
  const plansSub = stripHtml(plansSection?.attributes?.description) || "All plans are custom-scoped. These are starting frameworks â€” contact us for a tailored proposal.";
  const plansCtaUrl = plansSection?.attributes?.display_type ?? "https://meetings.hubspot.com/maheshv";
  const apiPlans = plansCats?.data ?? [];
  const plans = apiPlans.map(mapPlan);

  const compsEyebrow = componentsData?.section?.attributes?.template ?? "The Execution Engine";
  const compsHeading = componentsData?.section?.attributes?.section_title ?? "Platform Components";
  const compsSub = stripHtml(componentsData?.section?.attributes?.description) || "Not standalone products. Components of one execution engine, working together to run your operations.";
  const components = (componentsData?.items ?? []).map((i) => ({ icon: i.attributes.description_short ?? "FileText", title: i.attributes.category_title, description: stripHtml(i.attributes.description) }));

  const execA = executionData?.section?.attributes;
  const execHeading = execA?.section_title ?? "AI isn't the problem.";
  const execGradient = execA?.template ?? "Execution is.";
  const execSub = stripHtml(execA?.description) || "Most enterprise AI promises intelligence. But intelligence without action is just another dashboard.";
  const execCalloutH = execA?.external_link ?? "qBotica doesn't sell intelligence. We sell execution.";
  const execCalloutSub = execA?.internal_link ?? "Stop managing AI projects. Start getting work done.";
  const problems = (executionData?.items ?? []).map((i) => ({ icon: i.attributes.description_short ?? "BarChart2", title: i.attributes.category_title, description: stripHtml(i.attributes.description) }));

  const cmpEyebrow = comparisonData?.section?.attributes?.template ?? "Comparison";
  const cmpHeading = comparisonData?.section?.attributes?.section_title ?? "Why qBotica, not workflow tools?";
  const compRows = (comparisonData?.items ?? []).map((i) => ({ aspect: i.attributes.category_title, them: i.attributes.description_short ?? "", us: i.attributes.external_link ?? "" }));

  const faqEyebrow = faqData?.section?.attributes?.template ?? "FAQ";
  const faqHeading = faqData?.section?.attributes?.section_title ?? "Common questions";
  const faqs = (faqData?.items ?? []).map((i) => ({ q: i.attributes.category_title, a: stripHtml(i.attributes.description) }));

  const ctaA = ctaSection?.attributes;
  const ctaHeading = ctaA?.section_title ?? "Get a custom proposal for your workflow";
  const ctaSub = stripHtml(ctaA?.description) || "Every engagement starts with a 30-minute discovery call. We'll scope your workflow, define success metrics, and provide a tailored proposal.";
  const ctaPrimaryLabel = ctaA?.display_type ?? "Book a Discovery Call";
  const ctaUrl = ctaA?.external_link ?? "https://meetings.hubspot.com/maheshv";
  const ctaSecondaryLabel = ctaA?.internal_link ?? "Talk to an Expert";

  if (seoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (hasBlocks) {
    return (
      <div className="min-h-screen">
        <SEOHead metadata={metadata} jsonLD={jsonLD} />
        <Navbar />
        <main id="main-content">
          <PageBuilderRenderer blocks={blocks!} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead metadata={metadata} jsonLD={jsonLD} />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="relative container mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {heroBadge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto">
            {heroHeading.includes("work completed") ? (
              <>
                {heroHeading.split("work completed")[0]}
                <span className="text-gradient">work completed</span>
                {heroHeading.split("work completed")[1]}
              </>
            ) : (
              heroHeading
            )}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {heroSub}
          </p>
        </div>
      </section>

      {/* Callout */}
      <section className="py-10 bg-surface-elevated border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary flex-shrink-0">
              <DynamicIcon name={calloutIcon} size={28} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-semibold text-foreground">{calloutHeading}</p>
              <p className="text-muted-foreground mt-2">{calloutBody}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{plansEyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {plansHeading}
            </h2>
            <p className="mt-4 text-muted-foreground">{plansSub}</p>
          </div>

          {plansLoading ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-surface-elevated border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-8 flex flex-col h-full transition-all duration-300 ${
                    plan.highlight
                      ? "bg-primary/5 border-primary/40 shadow-[0_4px_30px_hsl(24_100%_50%/0.15)] relative"
                      : "bg-surface-elevated border-border hover:border-primary/20"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-primary uppercase tracking-widest">{plan.tagline}</p>
                    <h3 className="text-2xl font-bold text-foreground mt-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{plan.description}</p>
                  </div>
                  <div className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <a href={plansCtaUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button variant={plan.highlight ? "hero" : "hero-outline"} size="lg" className="w-full gap-2">
                      {plan.cta} <ArrowRight size={16} />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Platform Components */}
      <section className="py-12 lg:py-16 bg-surface-elevated border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{compsEyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {compsHeading}
            </h2>
            <p className="mt-4 text-muted-foreground">{compsSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {components.map((comp) => (
              <div
                key={comp.title}
                className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08)] transition-all duration-300 text-center"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                  <DynamicIcon name={comp.icon} size={22} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{comp.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{comp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI isn't the problem. Execution is. */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                {execHeading} <span className="text-gradient">{execGradient}</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{execSub}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {problems.map((item) => (
                <div key={item.title} className="p-8 rounded-2xl bg-surface-elevated border border-border">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                    <DynamicIcon name={item.icon} size={22} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-lg font-semibold text-foreground">
                {execCalloutH.includes("We sell execution") ? (
                  <>
                    {execCalloutH.split("We sell execution")[0]}
                    <span className="text-gradient">We sell execution.</span>
                  </>
                ) : (
                  execCalloutH
                )}
              </p>
              <p className="mt-2 text-muted-foreground text-sm">{execCalloutSub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 lg:py-16 bg-surface-elevated border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{cmpEyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {cmpHeading}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-8 font-semibold text-foreground">Aspect</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Workflow Automation Tools</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary">qubi</th>
                </tr>
              </thead>
              <tbody>
                {compRows.map((row) => (
                  <tr key={row.aspect} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                    <td className="py-4 pr-8 font-medium text-foreground">{row.aspect}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{row.them}</td>
                    <td className="py-4 px-4 text-center text-primary font-medium">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{faqEyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {faqHeading}
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-6 rounded-2xl bg-surface-elevated border border-border">
                <h3 className="text-base font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none opacity-50" />
        <div className="relative container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
            {ctaHeading.includes("your workflow") ? (
              <>
                {ctaHeading.split("your workflow")[0]}
                <span className="text-gradient">your workflow</span>
              </>
            ) : (
              ctaHeading
            )}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">{ctaSub}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="gap-2 px-8 h-12">
                {ctaPrimaryLabel} <ArrowRight size={18} />
              </Button>
            </a>
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg" className="gap-2 px-8 h-12">
                <MessageSquare size={16} /> {ctaSecondaryLabel}
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
