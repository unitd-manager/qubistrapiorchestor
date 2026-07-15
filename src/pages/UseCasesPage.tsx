import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  FileText,
  HeartPulse,
  DollarSign,
  Truck,
  ShoppingCart,
  Users,
  ArrowRight,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getContents,
  getHomeSectionWithItems,
  getHomeSection,
  stripHtml,
  type ContentAttributes,
  type StrapiItem,
} from "@/lib/strapi";

// Icon mapping: type field → lucide icon
const ICON_MAP: Record<string, LucideIcon> = {
  DollarSign, HeartPulse, ShoppingCart, Users, FileText, Truck,
};

// ─── Static fallbacks ─────────────────────────────────────────────────────────
const ENGINE_EMOJIS: Record<string, string> = {
  Documents: "📄", Decisions: "🧠", Actions: "⚡", Outcomes: "✅",
};

function mapUseCase(item: StrapiItem<ContentAttributes>) {
  const a = item.attributes;
  const outcomes = a.description_short
    ? stripHtml(a.description_short).split("|").map((s) => s.trim()).filter(Boolean)
    : [];
  const IconComponent = ICON_MAP[a.type ?? ""] ?? FileText;
  return {
    id: item.id,
    icon: IconComponent,
    title: a.title,
    description: stripHtml(a.description),
    outcomes,
    industry: a.external_link ?? a.type ?? "Enterprise",
  };
}

const UseCasesPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: "/solutions/use-cases",
    fallbackTitle: "Use Cases | Qubi Flow Orchestrator",
    fallbackDescription: "Explore use cases for Qubi Flow Orchestrator across various industries.",
  });

  // Hero
  const { data: heroSection } = useQuery({
    queryKey: ["uc-page-hero"],
    queryFn: () => getHomeSection("uc_page_hero"),
    staleTime: 5 * 60 * 1000,
  });

  // Stats
  const { data: statsData } = useQuery({
    queryKey: ["uc-page-stats"],
    queryFn: () => getHomeSectionWithItems("uc_page_stats", "stat_item"),
    staleTime: 5 * 60 * 1000,
  });

  // Grid heading
  const { data: gridSection } = useQuery({
    queryKey: ["uc-page-grid"],
    queryFn: () => getHomeSection("uc_page_grid"),
    staleTime: 5 * 60 * 1000,
  });

  // Use case cards
  const { data: useCasesData, isLoading: ucLoading } = useQuery({
    queryKey: ["use-cases"],
    queryFn: () => getContents({ contentType: "use_case" }),
    staleTime: 5 * 60 * 1000,
  });

  // Execution engine
  const { data: engineData } = useQuery({
    queryKey: ["uc-page-engine"],
    queryFn: () => getHomeSectionWithItems("uc_page_engine", "engine_step"),
    staleTime: 5 * 60 * 1000,
  });

  // CTA
  const { data: ctaSection } = useQuery({
    queryKey: ["uc-page-cta"],
    queryFn: () => getHomeSection("uc_page_cta"),
    staleTime: 5 * 60 * 1000,
  });

  // ── Resolve values ──────────────────────────────────────────────────────────
  const heroA = heroSection?.attributes;
  const heroBadge = heroA?.template ?? "Real Operations. Real Outcomes.";
  const heroHeading = heroA?.section_title ?? "";
  const heroSub = stripHtml(heroA?.description) || "";
  const heroCta = heroA?.display_type ?? "";
  const heroUrl = heroA?.external_link ?? "";

  const stats = (statsData?.items ?? []).map((item) => ({ value: item.attributes.description_short ?? "", label: item.attributes.category_title }));

  const gridEyebrow = gridSection?.attributes?.template ?? "Use Cases";
  const gridHeading = gridSection?.attributes?.section_title ?? "Most AI stops here. We don't.";
  const gridSub = stripHtml(gridSection?.attributes?.description) || "We don't automate tasks. We execute outcomes — end-to-end, continuously, as a managed service.";

  const apiUseCases = useCasesData?.data?.map(mapUseCase) ?? [];
  const useCases = apiUseCases;

  const engineHeading = engineData?.section?.attributes?.section_title ?? "The Execution Engine";
  const engineSteps = (engineData?.items ?? []).map((item) => ({
        label: item.attributes.category_title,
        sub: stripHtml(item.attributes.description),
        icon: ENGINE_EMOJIS[item.attributes.category_title] ?? "â–¶",
      }));

  const ctaA = ctaSection?.attributes;
  const ctaHeading = ctaA?.section_title ?? "Ready to run your process with qBotica?";
  const ctaSub = stripHtml(ctaA?.description) || "Tell us your most critical workflow. We'll show you exactly how qubi executes it end-to-end.";
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
            {heroHeading.includes("qBotica") ? (
              <>
                {heroHeading.split("qBotica")[0]}
                <span className="text-gradient">qBotica</span>
                {heroHeading.split("qBotica")[1]}
              </>
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

      {/* Stats */}
      <section className="py-12 bg-surface-elevated border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-gradient">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{gridEyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {gridHeading.includes("We don't.") ? (
                <>
                  {gridHeading.split("We don't.")[0]}
                  <span className="text-gradient">We don't.</span>
                </>
              ) : (
                gridHeading
              )}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">{gridSub}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {ucLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-2xl bg-surface-elevated border border-border animate-pulse" />
                ))
              : useCases.map((uc) => (
                  <div
                    key={uc.title}
                    className="group p-8 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08),0_8px_32px_hsl(0_0%_0%/0.04)] transition-all duration-300"
                  >
                    <div className="flex items-start gap-5 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <uc.icon size={24} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-primary uppercase tracking-widest">{uc.industry}</span>
                        <h3 className="text-xl font-semibold text-foreground mt-1">{uc.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{uc.description}</p>
                    <div className="space-y-2">
                      {uc.outcomes.map((o) => (
                        <div key={o} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle size={14} className="text-primary flex-shrink-0" />
                          {o}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Execution Engine */}
      <section className="py-16 bg-surface-elevated border-y border-border">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12">
            {engineHeading.includes("Execution Engine") ? (
              <>
                The <span className="text-gradient">Execution Engine</span>
              </>
            ) : (
              engineHeading
            )}
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8">
            {engineSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{step.icon}</div>
                  <div className="font-semibold text-foreground text-sm">{step.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-[120px]">{step.sub}</div>
                </div>
                {i < engineSteps.length - 1 && <div className="text-2xl text-primary font-bold hidden lg:block">→</div>}
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
            {ctaHeading.includes("qBotica") ? (
              <>
                {ctaHeading.split("qBotica")[0]}
                <span className="text-gradient">qBotica</span>
                {ctaHeading.split("qBotica")[1]}
              </>
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

export default UseCasesPage;
