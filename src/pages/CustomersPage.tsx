import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingDown, TrendingUp, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageBuilderRenderer } from "@/components/PageBuilderRenderer";
import {
  getCategories,
  getContents,
  getHomeSection,
  getHomeSectionWithItems,
  getPageBlocks,
  stripHtml,
  type CategoryAttributes,
  type ContentAttributes,
  type StrapiItem,
} from "@/lib/strapi";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type CaseMetric =
  | { label: string; before: string; after: string; positive: boolean }
  | { label: string; reduction: string; positive: boolean }
  | { label: string; value: string; positive: boolean };

interface CaseStudy {
  id: number;
  industry: string;
  title: string;
  logo: string;
  challenge: string;
  solution: string;
  metrics: CaseMetric[];
  quote: string;
  role: string;
}

// â”€â”€â”€ Static fallbacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function mapMetric(m: StrapiItem<ContentAttributes>): CaseMetric {
  const parts = (m.attributes.description_short ?? "").split("|");
  const label = m.attributes.title;
  if (m.attributes.type === "before_after")
    return { label, before: parts[0] ?? "", after: parts[1] ?? "", positive: true };
  if (m.attributes.type === "reduction")
    return { label, reduction: parts[0] ?? "", positive: true };
  return { label, value: parts[0] ?? "", positive: true };
}

function mapCaseStudy(
  cat: StrapiItem<CategoryAttributes>,
  allMetrics: StrapiItem<ContentAttributes>[]
): CaseStudy {
  const a = cat.attributes;
  const [quote = "", role = ""] = (a.internal_link ?? "").split("||");
  const metrics = allMetrics
    .filter((m) => m.attributes.category_id === cat.id)
    .map(mapMetric);
  return {
    id: cat.id,
    industry: a.description_short ?? "Enterprise",
    title: a.category_title,
    logo: (a.description_short ?? "EN").slice(0, 2).toUpperCase(),
    challenge: stripHtml(a.description),
    solution: stripHtml(a.external_link),
    metrics: metrics.length > 0 ? metrics : [{ label: "Outcome", value: "See details", positive: true }],
    quote,
    role,
  };
}

const CustomersPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: "/customers",
    fallbackTitle: "Customers | Qubi Flow Orchestrator",
    fallbackDescription: "See how our customers are using Qubi Flow Orchestrator.",
  });

  // Page-builder blocks (modern path — page with slug "customers")
  const { data: blocks } = useQuery({
    queryKey: ["page-blocks", "customers"],
    queryFn: () => getPageBlocks("customers"),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
  const hasBlocks = (blocks?.length ?? 0) > 0;

  // Hero
  const { data: heroSection } = useQuery({
    queryKey: ["cust-page-hero"],
    queryFn: () => getHomeSection("cust_page_hero"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlocks,
  });

  // Stats bar
  const { data: statsData } = useQuery({
    queryKey: ["cust-page-stats"],
    queryFn: () => getHomeSectionWithItems("cust_page_stats", "stat_item"),
    staleTime: 5 * 60 * 1000,
  });

  // Case studies section heading + case_study categories
  const { data: casesSection } = useQuery({
    queryKey: ["cust-page-cases-section"],
    queryFn: () => getHomeSection("cust_page_cases"),
    staleTime: 5 * 60 * 1000,
  });
  const { data: caseStudyCats, isLoading: catsLoading } = useQuery({
    queryKey: ["cust-case-study-cats"],
    queryFn: () => getCategories({ categoryType: "case_study" }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["cust-case-metrics"],
    queryFn: () => getContents({ contentType: "case_metric" }),
    staleTime: 5 * 60 * 1000,
  });

  // Why clients choose us
  const { data: whyData } = useQuery({
    queryKey: ["cust-page-why"],
    queryFn: () => getHomeSectionWithItems("cust_page_why", "differentiator"),
    staleTime: 5 * 60 * 1000,
  });

  // Our Story
  const { data: storyData } = useQuery({
    queryKey: ["cust-page-story"],
    queryFn: () => getHomeSectionWithItems("cust_page_story", "story_stat"),
    staleTime: 5 * 60 * 1000,
  });

  // CTA
  const { data: ctaSection } = useQuery({
    queryKey: ["cust-page-cta"],
    queryFn: () => getHomeSection("cust_page_cta"),
    staleTime: 5 * 60 * 1000,
  });

  // â”€â”€ Resolve values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const heroA = heroSection?.attributes;
  const heroBadge = heroA?.template ?? "Proven Results";
  const heroHeading = heroA?.section_title ?? "Real Results from Real Operations";
  const heroSub = stripHtml(heroA?.description) || "Proven outcomes across enterprise workflows. No demos. No POCs. Real execution delivering measurable business impact.";

  const stats = (statsData?.items ?? []).map((i) => ({ value: i.attributes.description_short ?? "", label: i.attributes.category_title }));

  const casesEyebrow = casesSection?.attributes?.template ?? "Case Studies";
  const casesHeading = casesSection?.attributes?.section_title ?? "How we execute for enterprise clients";

  const apiCats = caseStudyCats?.data ?? [];
  const allMetrics = metricsData?.data ?? [];
  const isLoadingCases = catsLoading || metricsLoading;
  const caseStudies = apiCats.map((cat) => mapCaseStudy(cat, allMetrics));

  const whyEyebrow = whyData?.section?.attributes?.template ?? "Why qBotica";
  const whyHeading = whyData?.section?.attributes?.section_title ?? "Why enterprise clients choose us";
  const differentiators = (whyData?.items ?? []).map((i) => ({ title: i.attributes.category_title, description: stripHtml(i.attributes.description) }));

  const storyA = storyData?.section?.attributes;
  const storyEyebrow = storyA?.template ?? "Our Story";
  const storyHeading = storyA?.section_title ?? "Why We Built qBotica";
  // Paragraphs stored pipe-separated with || as delimiter
  const storyParagraphs = storyA?.description
    ? stripHtml(storyA.description).split("||").map((p) => p.trim()).filter(Boolean)
    : [];
  const storyStats = (storyData?.items ?? []).map((i) => ({ stat: i.attributes.description_short ?? "", label: i.attributes.category_title }));

  const ctaA = ctaSection?.attributes;
  const ctaHeading = ctaA?.section_title ?? "Become our next success story";
  const ctaSub = stripHtml(ctaA?.description) || "Tell us your most critical workflow. In 30 minutes, we'll show you exactly how qubi executes it end-to-end.";
  const ctaLabel = ctaA?.display_type ?? "Book a Demo";
  const ctaUrl = ctaA?.external_link ?? "https://meetings.hubspot.com/maheshv";

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
            {heroHeading.includes("Real Operations") ? (
              <>{heroHeading.split("Real Operations")[0]}<span className="text-gradient">Real Operations</span></>
            ) : (
              heroHeading
            )}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {heroSub}
          </p>
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

      {/* Case Studies */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{casesEyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {casesHeading}
            </h2>
          </div>

          {isLoadingCases ? (
            <div className="space-y-12">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-surface-elevated border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {caseStudies.map((cs) => (
                <div key={cs.title} className="rounded-2xl bg-surface-elevated border border-border overflow-hidden">
                  <div className="grid lg:grid-cols-5 gap-0">
                    {/* Left panel */}
                    <div className="lg:col-span-2 p-8 bg-primary/5 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
                      <div>
                        <span className="text-sm font-semibold text-primary uppercase tracking-widest">{cs.industry}</span>
                        <h3 className="text-2xl font-bold text-foreground mt-2">{cs.title}</h3>
                        <div className="mt-6">
                          <p className="text-sm font-semibold text-foreground mb-2">Challenge</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{cs.challenge}</p>
                        </div>
                        <div className="mt-6">
                          <p className="text-sm font-semibold text-foreground mb-2">Solution</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{cs.solution}</p>
                        </div>
                      </div>
                      {cs.quote && (
                        <blockquote className="mt-8 border-l-2 border-primary pl-4">
                          <p className="text-sm text-foreground italic">"{cs.quote}"</p>
                          <footer className="mt-2 text-xs text-muted-foreground">â€” {cs.role}</footer>
                        </blockquote>
                      )}
                    </div>

                    {/* Right panel - metrics */}
                    <div className="lg:col-span-3 p-8 flex flex-col justify-center">
                      <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-6">Results</p>
                      <div className="grid sm:grid-cols-3 gap-6">
                        {cs.metrics.map((metric) => (
                          <div key={metric.label} className="p-6 rounded-xl bg-background border border-border text-center">
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {metric.positive ? (
                                <TrendingDown size={16} className="text-green-500" />
                              ) : (
                                <TrendingUp size={16} className="text-green-500" />
                              )}
                            </div>
                            {"before" in metric ? (
                              <div>
                                <div className="text-sm text-muted-foreground line-through">{metric.before}</div>
                                <div className="text-2xl font-bold text-gradient mt-1">{metric.after}</div>
                              </div>
                            ) : "reduction" in metric ? (
                              <div className="text-2xl font-bold text-gradient">{metric.reduction}</div>
                            ) : (
                              <div className="text-2xl font-bold text-gradient">{(metric as { value: string }).value}</div>
                            )}
                            <div className="text-xs text-muted-foreground mt-2">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why clients choose us */}
      <section className="py-12 lg:py-16 bg-surface-elevated border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{whyEyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {whyHeading}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {differentiators.map((d) => (
              <div key={d.title} className="p-6 rounded-2xl bg-background border border-border">
                <CheckCircle size={20} className="text-primary mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-2">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{storyEyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {storyHeading.includes("qBotica") ? (
                <>{storyHeading.split("qBotica")[0]}<span className="text-gradient">qBotica</span></>
              ) : (
                storyHeading
              )}
            </h2>
            <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
              {storyParagraphs.map((para, i) => (
                <p key={i} className={i === 0 ? "text-xl font-semibold text-foreground" : i === 3 ? "text-foreground font-semibold" : undefined}>
                  {para}
                </p>
              ))}
            </div>
            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              {storyStats.map((item) => (
                <div key={item.label} className="p-6 rounded-2xl bg-surface-elevated border border-border text-center">
                  <div className="text-4xl font-bold text-gradient">{item.stat}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none opacity-50" />
        <div className="relative container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
            {ctaHeading.includes("success story") ? (
              <>{ctaHeading.split("success story")[0]}<span className="text-gradient">success story</span></>
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

export default CustomersPage;
