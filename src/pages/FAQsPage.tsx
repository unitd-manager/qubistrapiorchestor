import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFaqs, getSections, type FaqAttributes, type StrapiItem } from "@/lib/strapi";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupFaqs(items: StrapiItem<FaqAttributes>[]) {
  const map = new Map<string, StrapiItem<FaqAttributes>[]>();
  for (const item of items) {
    const cat = item.attributes.category ?? "General";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }
  return map;
}

// ─── AccordionItem ────────────────────────────────────────────────────────────

const AccordionItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-lg font-medium text-foreground">{q}</span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 mt-0.5 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-5 text-base text-muted-foreground leading-relaxed">{a}</div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const FAQsPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: "/resources/faqs",
    fallbackTitle: "FAQs | Qubi Flow Orchestrator",
    fallbackDescription: "Frequently asked questions about Qubi Flow Orchestrator.",
  });

  const { data: heroData } = useQuery({
    queryKey: ["faq-page-hero"],
    queryFn: () => getSections("faq_page_hero"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: faqData } = useQuery({
    queryKey: ["faq-items"],
    queryFn: () => getFaqs(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: ctaData } = useQuery({
    queryKey: ["faq-page-cta"],
    queryFn: () => getSections("faq_page_cta"),
    staleTime: 5 * 60 * 1000,
  });

  // Hero
  const hero = heroData?.data[0]?.attributes;
  const heroBadge = hero?.display_type;
  const heroTitle = hero?.section_title ?? "";
  const heroDesc = hero?.description ?? "";

  // CTA
  const cta = ctaData?.data[0]?.attributes;
  const ctaTitle = cta?.section_title ?? "";
  const ctaDesc = cta?.description ?? "";
  const ctaPrimaryLabel = cta?.display_type ?? "Book a Demo";
  const ctaSecondaryLabel = cta?.internal_link ?? "Contact Us";
  const ctaUrl = cta?.external_link ?? "#";

  // FAQs — grouped by category, preserving sort_order
  const grouped = groupFaqs(faqData?.data ?? []);
  const categories = [...grouped.keys()];

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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground max-w-3xl mx-auto">
            {heroTitle.includes("Questions") ? (
              <>
                {heroTitle.replace("Questions", "")}
                <span className="text-gradient">Questions</span>
              </>
            ) : (
              <span className="text-gradient">{heroTitle}</span>
            )}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            {heroDesc}
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-12">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="text-2xl font-bold text-foreground mb-6 pb-4 border-b border-border">{cat}</h2>
                <div className="bg-surface-elevated rounded-2xl border border-border px-6 divide-y divide-border">
                  {(grouped.get(cat) ?? []).map((item) => (
                    <AccordionItem key={item.id} q={item.attributes.question} a={item.attributes.answer} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-surface-elevated border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {ctaTitle}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            {ctaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="gap-2">
                {ctaPrimaryLabel} <ArrowRight size={16} />
              </Button>
            </a>
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg" className="gap-2">
                {ctaSecondaryLabel} <ArrowRight size={16} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQsPage;

