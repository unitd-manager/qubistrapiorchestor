import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  Building2,
  HeartPulse,
  BarChart3,
  Truck,
  CreditCard,
  Headphones,
  ArrowRight,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getContents,
  getHomeSection,
  getHomeSectionWithItems,
  stripHtml,
  type CategoryAttributes,
  type ContentAttributes,
  type StrapiItem,
} from "@/lib/strapi";

const ICON_MAP: Record<string, LucideIcon> = {
  Building2, HeartPulse, BarChart3, Truck, CreditCard, Headphones,
};

const COLOR_MAP = [
  "from-blue-500/10 to-primary/10",
  "from-green-500/10 to-primary/10",
  "from-purple-500/10 to-primary/10",
  "from-orange-500/10 to-primary/10",
  "from-yellow-500/10 to-primary/10",
  "from-pink-500/10 to-primary/10",
];

// ─── Static fallbacks ─────────────────────────────────────────────────────────
function mapIndustry(item: StrapiItem<CategoryAttributes>, contents: StrapiItem<ContentAttributes>[], idx: number) {
  const a = item.attributes;
  const workflows = contents
    .filter((c) => c.attributes.category_id === item.id)
    .map((c) => c.attributes.title);
  // icon stored in description_short field
  const IconComponent = ICON_MAP[a.description_short ?? ""] ?? Building2;
  return {
    id: item.id,
    icon: IconComponent,
    title: a.category_title,
    description: stripHtml(a.description),
    workflows: workflows.length > 0 ? workflows : [],
    color: COLOR_MAP[idx % COLOR_MAP.length],
  };
}

const IndustriesPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: "/solutions/industries",
    fallbackTitle: "Industries | Qubi Flow Orchestrator",
    fallbackDescription: "Industry-specific solutions for Qubi Flow Orchestrator.",
  });

  // Hero
  const { data: heroSection } = useQuery({
    queryKey: ["ind-page-hero"],
    queryFn: () => getHomeSection("ind_page_hero"),
    staleTime: 5 * 60 * 1000,
  });

  // Industries grid categories + their workflow contents
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["ind-industry-cats"],
    queryFn: () => getCategories({ categoryType: "industry" }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ["ind-industry-contents"],
    queryFn: () => getContents({ contentType: "industry_workflow" }),
    staleTime: 5 * 60 * 1000,
  });

  // What qBotica does — verbs
  const { data: whatData } = useQuery({
    queryKey: ["ind-page-what"],
    queryFn: () => getHomeSectionWithItems("ind_page_what", "what_verb"),
    staleTime: 5 * 60 * 1000,
  });

  // What qBotica does — cards
  const { data: whatCardsData } = useQuery({
    queryKey: ["ind-page-what-cards"],
    queryFn: () => getCategories({ categoryType: "what_card" }),
    staleTime: 5 * 60 * 1000,
  });

  // Comparison section
  const { data: compData } = useQuery({
    queryKey: ["ind-page-comparison"],
    queryFn: () => getHomeSectionWithItems("ind_page_comparison", "others_item"),
    staleTime: 5 * 60 * 1000,
  });
  const { data: qboticaItemsData } = useQuery({
    queryKey: ["ind-page-qbotica-items"],
    queryFn: () => getCategories({ categoryType: "qubi_item" }),
    staleTime: 5 * 60 * 1000,
  });

  // Problems section
  const { data: probData } = useQuery({
    queryKey: ["ind-page-problems"],
    queryFn: () => getHomeSectionWithItems("ind_page_problems", "problem_card"),
    staleTime: 5 * 60 * 1000,
  });

  // CTA
  const { data: ctaSection } = useQuery({
    queryKey: ["ind-page-cta"],
    queryFn: () => getHomeSection("ind_page_cta"),
    staleTime: 5 * 60 * 1000,
  });

  // ── Resolve values ──────────────────────────────────────────────────────────
  const isLoading = catLoading || contentLoading;
  const apiCats = catData?.data ?? [];
  const apiContents = contentData?.data ?? [];
  const industries = apiCats.map((cat, idx) => mapIndustry(cat, apiContents, idx));

  const heroA = heroSection?.attributes;
  const heroBadge = heroA?.template ?? "Industry Solutions";
  const heroHeading = heroA?.section_title ?? "Industries and Workflows We Run";
  const heroSub = stripHtml(heroA?.description) || "From financial services to healthcare, we handle the complexity of real enterprise operations. End-to-end execution, as a managed service.";
  const heroCta = heroA?.display_type ?? "Talk to an Industry Expert";
  const heroUrl = heroA?.external_link ?? "https://meetings.hubspot.com/maheshv";

  const whatA = whatData?.section?.attributes;
  const whatHeading = whatA?.section_title ?? "What qBotica actually does";
  const whatEyebrow = whatA?.template ?? "Plain English";
  const whatSub = stripHtml(whatA?.description) || "No jargon. Here's what happens when qBotica runs your work.";
  const whatTagline = whatA?.display_type ?? "We don't automate tasks. We execute outcomes.";
  const verbs = (whatData?.items ?? []).map((i) => ({ verb: i.attributes.category_title, detail: stripHtml(i.attributes.description) }));

  const CARD_EMOJIS: Record<string, string> = { Documents: "📄", Decisions: "🧠", Actions: "⚡", Outcomes: "✅" };
  const whatCards = (whatCardsData?.data ?? []).map((i) => ({
        icon: i.attributes.description_short ?? "",
        title: i.attributes.category_title,
        description: stripHtml(i.attributes.description),
      }));

  const compHeading = compData?.section?.attributes?.section_title ?? "Most AI stops here. We don't.";
  const othersItems = (compData?.items ?? []).map((i) => i.attributes.category_title);
  const qboticaItems = (qboticaItemsData?.data ?? []).map((i) => i.attributes.category_title);

  const probA = probData?.section?.attributes;
  const probHeading = probA?.section_title ?? "Why Enterprise AI Fails";
  const probEyebrow = probA?.template ?? "The Problem";
  const probSub = stripHtml(probA?.description) || "Most AI solutions stop short of real execution. They analyze, they assist, but they don't complete the work.";
  const problemCards = (probData?.items ?? []).map((i) => ({ title: i.attributes.category_title, description: stripHtml(i.attributes.description) }));

  const ctaA = ctaSection?.attributes;
  const ctaHeading = ctaA?.section_title ?? "Don't see your industry? Let's talk.";
  const ctaSub = stripHtml(ctaA?.description) || "We work across any industry where documents, decisions, and system actions need to happen together. Tell us your workflow.";
  const ctaLabel = ctaA?.display_type ?? "Book a Demo";
  const ctaUrl = ctaA?.external_link ?? "https://meetings.hubspot.com/maheshv";

  if (seoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
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
            {heroHeading.includes("We Run") ? (
              <>{heroHeading.split("We Run")[0]}<span className="text-gradient">We Run</span></>
            ) : (
              heroHeading
            )}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {heroSub}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href={heroUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="gap-2 px-8 h-12">
                {heroCta} <ArrowRight size={18} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-surface-elevated border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.map((industry) => (
                <div
                  key={industry.title}
                  className="group p-8 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08),0_8px_32px_hsl(0_0%_0%/0.04)] transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <industry.icon size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{industry.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{industry.description}</p>
                  <div className="space-y-2 mt-auto">
                    {industry.workflows.map((w) => (
                      <div key={w} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* What qBotica Actually Does */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-widest">{whatEyebrow}</span>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                {whatHeading.includes("actually does") ? (
                  <>{whatHeading.split("actually does")[0]}<span className="text-gradient">actually does</span></>
                ) : (
                  whatHeading
                )}
              </h2>
              <p className="mt-4 text-muted-foreground">{whatSub}</p>
              <div className="mt-8 space-y-4">
                {verbs.map((item) => (
                  <div key={item.verb} className="flex items-baseline gap-3">
                    <span className="text-primary font-bold text-lg min-w-[110px]">{item.verb}</span>
                    <span className="text-muted-foreground">{item.detail}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm font-semibold text-foreground border-l-2 border-primary pl-4">
                {whatTagline}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {whatCards.map((card) => (
                <div key={card.title} className="p-6 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 transition-all duration-300">
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <div className="font-semibold text-foreground mb-1">{card.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{card.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Most AI Stops Here. We Don't. */}
      <section className="py-12 lg:py-16 bg-surface-elevated border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {compHeading.includes("We don") ? (
                <>{compHeading.split("We don")[0]}<span className="text-gradient">We don't.</span></>
              ) : (
                compHeading
              )}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="p-8 rounded-2xl bg-background border border-border">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-5">Others</p>
              <div className="space-y-3">
                {othersItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-muted-foreground text-sm">
                    <span className="text-destructive font-bold">—</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-primary/5 border border-primary/30">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-5">qubi</p>
              <div className="space-y-3">
                {qboticaItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-foreground text-sm font-medium">
                    <span className="text-primary font-bold">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Enterprise AI Fails */}
      <section className="py-12 lg:py-16 bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{probEyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {probHeading}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">{probSub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {problemCards.map((item) => (
              <div key={item.title} className="p-8 rounded-2xl bg-background border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none opacity-50" />
        <div className="relative container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
            {ctaHeading.includes("Let's talk") ? (
              <>{ctaHeading.split("Let's talk")[0]}<span className="text-gradient">Let's talk.</span></>
            ) : (
              ctaHeading
            )}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">{ctaSub}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="gap-2 px-8 h-12">
                {ctaLabel} <ArrowRight size={18} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndustriesPage;
