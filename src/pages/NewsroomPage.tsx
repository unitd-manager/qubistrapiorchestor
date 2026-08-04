import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, ExternalLink } from "lucide-react";
import { stripHtml } from "@/lib/strapi";
import { useEffect, useState } from "react";

const STRAPI_URL = "";

// ─── Static fallback ──────────────────────────────────────────────────────────
const STATIC_RELEASES = [
  { category: "Company News", title: "qBotica11 Launches qubi Platform — Enterprise AI Execution for Managed Operations", date: "April 2026", excerpt: "qBotica today announced the general availability of qubi, the enterprise AI execution platform that orchestrates AI agents, document intelligence, and workflow automation as a managed service.", featured: true },
  { category: "Product Update", title: "qubi Now Supports 500+ Enterprise Integrations", date: "March 2026", excerpt: "qBotica expands the qubi connector library to 500+ enterprise applications, including enhanced support for SAP S/4HANA, Oracle Fusion, and Salesforce Einstein.", featured: false },
  { category: "Partnership", title: "qBotica and Microsoft Announce Strategic Partnership for AI Execution on Azure", date: "February 2026", excerpt: "qBotica and Microsoft have entered a strategic partnership to deliver qubi-powered AI execution on the Microsoft Azure cloud platform for enterprise clients.", featured: false },
  { category: "Award", title: "qBotica Named a Top 10 AI Automation Company to Watch in 2026", date: "January 2026", excerpt: "Industry analysts recognized qBotica as one of the top 10 AI automation companies shaping enterprise operations in 2026 for its outcome-based managed service model.", featured: false },
  { category: "Company News", title: "qBotica Closes Series B to Accelerate Enterprise AI Execution", date: "November 2025", excerpt: "qBotica announced the close of its Series B funding round, led by leading enterprise technology investors, to expand its managed service capacity and qubi platform capabilities.", featured: false },
];

const mediaContacts = [
  { name: "Press Inquiries", email: "press@qbotica.com" },
  { name: "Partnership Inquiries", email: "partners@qbotica.com" },
];

// Maps a Strapi v5 flat item directly (no { attributes } wrapper needed)
function mapRelease(item: Record<string, unknown>) {
  const contentDate = item.content_date as string | null;
  return {
    id: item.id as number,
    category: (item.type as string) ?? "News",
    title: (item.title as string) ?? "",
    date: contentDate
      ? new Date(contentDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "",
    excerpt: stripHtml((item.description_short ?? item.description) as string | null).slice(0, 280),
    featured: (item.favourite as boolean) ?? false,
  };
}

const NewsroomPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: "/resources/newsroom",
    fallbackTitle: "Newsroom | Qubi Flow Orchestrator",
    fallbackDescription: "Latest news and press releases from Qubi.",
  });

  const [pressReleases, setPressReleases] = useState(STATIC_RELEASES);

  const featuredReleases = pressReleases.filter((p) => p.featured);
  const otherReleases = pressReleases.filter((p) => !p.featured);

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
            Newsroom
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground max-w-3xl mx-auto">
            Latest from <span className="text-gradient">qBotica</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Press releases, company announcements, partnerships, and industry news.
          </p>
        </div>
      </section>

      {/* Featured Release */}
      {featuredReleases.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            {featuredReleases.map((pr) => (
                <div
                  key={pr.title}
                  className="rounded-2xl bg-primary/5 border border-primary/20 p-8 lg:p-12 hover:border-primary/40 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {pr.category}
                    </span>
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-surface-elevated border border-border">
                      Latest
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{pr.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">{pr.excerpt}</p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      {pr.date}
                    </div>
                    <Button variant="hero" size="sm" className="gap-1 ml-auto">
                      Read Full Release <ExternalLink size={14} />
                    </Button>
                  </div>
                </div>
              ))}

          </div>
        </section>
      )}

      {/* All Releases */}
      <section className="py-10 pb-20 lg:pb-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-xl font-semibold text-foreground mb-8">Press Releases & Announcements</h2>
          <div className="space-y-4">
              {otherReleases.map((pr) => (
                <div
                  key={pr.title}
                  className="group p-6 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer flex items-start gap-6"
                >
                  <div className="flex-shrink-0 text-center hidden sm:block">
                    <div className="text-xs text-muted-foreground">{pr.date.split(" ")[0]}</div>
                    <div className="text-lg font-bold text-foreground">{pr.date.split(" ")[1]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary">{pr.category}</span>
                      <span className="text-xs text-muted-foreground sm:hidden">{pr.date}</span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      {pr.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pr.excerpt}</p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-16 bg-surface-elevated border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Media Contact</h2>
            <p className="text-muted-foreground mb-8">
              For press inquiries, interview requests, or additional information about qBotica and the qubi platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {mediaContacts.map((c) => (
                <a
                  key={c.email}
                  href={`mailto:${c.email}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-background border border-border hover:border-primary/30 hover:text-primary transition-all duration-200 text-sm font-medium text-foreground"
                >
                  {c.name}: {c.email}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsroomPage;
