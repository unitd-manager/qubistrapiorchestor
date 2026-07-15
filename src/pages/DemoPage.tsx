import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DemoPreviewSection from "@/components/DemoPreviewSection";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, Play } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createEnquiry, getHomeSection, getCategories } from "@/lib/strapi";

const DemoPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: "/resources/demo",
    fallbackTitle: "Demo | Qubi Flow Orchestrator",
    fallbackDescription: "Watch a demo of Qubi Flow Orchestrator.",
  });

  const [form, setForm] = useState({ first_name: "", email: "", company: "", phone: "", comments: "" });
  const [submitted, setSubmitted] = useState(false);

  const { data: hero } = useQuery({ queryKey: ["demo-page-hero"], queryFn: () => getHomeSection("demo_page_hero"), staleTime: 5 * 60 * 1000 });
  const { data: capsSection } = useQuery({ queryKey: ["demo-capabilities-section"], queryFn: () => getHomeSection("demo_capabilities_section"), staleTime: 5 * 60 * 1000 });
  const { data: clipsData } = useQuery({ queryKey: ["demo-clips"], queryFn: () => getCategories({ sectionId: 108, categoryType: "demo_clip" }), staleTime: 5 * 60 * 1000 });
  const { data: ctaSection } = useQuery({ queryKey: ["demo-page-cta"], queryFn: () => getHomeSection("demo_page_cta"), staleTime: 5 * 60 * 1000 });

  const { mutate: submitEnquiry, isPending } = useMutation({
    mutationFn: () => createEnquiry({ ...form, enquiry_type: "demo_request", subject: "Demo Request", product: "qubi" }),
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.email) return;
    submitEnquiry();
  }

  const heroBadge = hero?.attributes.display_type ?? "Product Demo";
  const heroSub = hero?.attributes.description ?? "Watch real AI execution not slides, not a prototype. qubi reading documents, making decisions, and posting to enterprise systems in minutes.";
  const heroCtaLabel = hero?.attributes.internal_link ?? "Book a Live Demo";
  const heroCtaUrl = hero?.attributes.external_link ?? "https://meetings.hubspot.com/maheshv";
  const capsBadge = capsSection?.attributes.display_type ?? "On-Demand Demos";
  const capsTitle = capsSection?.attributes.section_title ?? "Explore specific capabilities";
  const clips = (clipsData?.data ?? []).map((c) => ({ id: c.id, title: c.attributes.category_title, duration: c.attributes.description_short ?? "", description: c.attributes.description ?? "", highlights: (c.attributes.internal_link ?? "").split("|").filter(Boolean) }));
  const ctaTitle = ctaSection?.attributes.section_title ?? "Want a live demo on your workflow?";
  const ctaSub = ctaSection?.attributes.description ?? "Book 30 minutes with our team. We'll walk you through qubi executing a workflow just like yours with real data, real systems, real outcomes.";
  const ctaBtn = ctaSection?.attributes.display_type ?? "Book a Live Demo";
  const ctaDisclaimer = ctaSection?.attributes.internal_link ?? "No sales pitch. No slides. Just execution.";

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
      <section className="relative pt-20 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="relative container mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />{heroBadge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto">
            See <span className="text-gradient">qubi</span> execute<br />a real workflow
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">{heroSub}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href={heroCtaUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="gap-2 px-8 h-12">{heroCtaLabel} <ArrowRight size={18} /></Button>
            </a>
          </div>
        </div>
      </section>
      <DemoPreviewSection />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{capsBadge}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">{capsTitle}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {clips.map((demo) => (
              <div key={demo.id} className="group p-8 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08)] transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{demo.title}</h3>
                  {demo.duration && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background border border-border rounded-full px-2.5 py-1 shrink-0 ml-4">
                      <Clock size={11} />{demo.duration}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{demo.description}</p>
                {demo.highlights.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {demo.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle size={13} className="text-primary flex-shrink-0" />{h}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all duration-200">
                  <Play size={14} className="fill-primary" />Watch Demo
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 lg:py-16 bg-surface-elevated border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                Want a <span className="text-gradient">live demo</span> on your workflow?
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">{ctaSub}</p>
            </div>
            {submitted ? (
              <div className="text-center py-12 rounded-2xl bg-primary/5 border border-primary/20">
                <CheckCircle size={40} className="text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground">Request received!</h3>
                <p className="text-muted-foreground mt-2">We'll be in touch within one business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 bg-surface-elevated border border-border rounded-2xl p-8">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="demo-name">Name *</label>
                  <input id="demo-name" type="text" required value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="Your name" className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="demo-email">Work Email *</label>
                  <input id="demo-email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@company.com" className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="demo-company">Company</label>
                  <input id="demo-company" type="text" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Your company name" className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="demo-phone">Phone</label>
                  <input id="demo-phone" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="demo-comments">What workflow do you want to automate?</label>
                  <textarea id="demo-comments" rows={3} value={form.comments} onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))} placeholder="Describe your process..." className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <div className="sm:col-span-2 flex justify-center">
                  <Button type="submit" variant="hero" size="lg" className="gap-2 px-8 h-12" disabled={isPending}>
                    {isPending ? "Sending..." : ctaBtn} <ArrowRight size={18} />
                  </Button>
                </div>
                <p className="sm:col-span-2 text-center text-xs text-muted-foreground">{ctaDisclaimer}</p>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default DemoPage;
