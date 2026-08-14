import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { PageBuilderRenderer } from "@/components/PageBuilderRenderer";
import { getHomeSection, getBlogs, getPageBlocks, stripHtml, type StrapiItem, type BlogAttributes } from "@/lib/strapi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBlogDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const BlogPage = () => {
  const { metadata, jsonLD, loading: seoLoading } = useSEO({
    path: "/resources/blog",
    fallbackTitle: "Blog | Qubi Flow Orchestrator",
    fallbackDescription: "Read insights and perspectives on enterprise AI execution.",
  });

  // Page-builder blocks (modern path). The URL is /resources/blog but the CMS
  // slug is flat ("resources-blog") because slug is a uid field (no slashes).
  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["page-blocks", "resources-blog"],
    queryFn: () => getPageBlocks("resources-blog"),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
  const hasBlocks = (blocks?.length ?? 0) > 0;

  const { data: hero } = useQuery({
    queryKey: ["blog-page-hero"],
    queryFn: () => getHomeSection("blog_page_hero"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlocks,
  });

  const { data: cta } = useQuery({
    queryKey: ["blog-page-cta"],
    queryFn: () => getHomeSection("blog_page_cta"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlocks,
  });

  const { data: blogsData, isLoading: blogsLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => getBlogs({ limit: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  // Use only qBotica posts (those with us_title set)
  const allPosts: StrapiItem<BlogAttributes>[] =
    (blogsData?.data ?? []).filter((p) => p.attributes.us_title);

  const visiblePosts = selectedCategory
    ? allPosts.filter((p) => p.attributes.us_title === selectedCategory)
    : allPosts;

  const featuredPost = visiblePosts.find((p) => p.attributes.flag === true) ?? null;
  const regularPosts = visiblePosts.filter((p) => p.attributes.flag !== true);

  // Hero content
  const heroTitle = hero?.attributes.section_title ?? "The qBotica Blog";
  const heroBadge = hero?.attributes.display_type ?? "Insights & Perspectives";
  const heroSub =
    hero?.attributes.description ??
    "Perspectives on enterprise AI execution, operational automation, and the future of work.";

  // CTA content
  const ctaTitle = cta?.attributes.section_title ?? "Get insights delivered to your inbox";
  const ctaSub =
    cta?.attributes.description ??
    "Monthly perspectives on enterprise AI execution, case studies, and operational best practices.";
  const ctaBtn = cta?.attributes.display_type ?? "Subscribe";

  if (seoLoading || blocksLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div style={{ height: 76 }} aria-hidden="true" />
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
      <section className="relative pt-16 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="relative container mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {heroBadge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground max-w-3xl mx-auto">
            The <span className="text-gradient">qubi</span>{" "}
            {heroTitle.replace(/^The\s+qBotica\s*/i, "") || "Blog"}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            {heroSub}
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {blogsLoading ? (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 lg:p-12 animate-pulse">
              <div className="h-6 w-40 bg-surface-elevated rounded-full mb-4" />
              <div className="h-8 w-2/3 bg-surface-elevated rounded mb-4" />
              <div className="h-4 w-full max-w-2xl bg-surface-elevated rounded mb-2" />
              <div className="h-4 w-1/2 max-w-2xl bg-surface-elevated rounded mb-6" />
              <div className="h-9 w-32 bg-surface-elevated rounded" />
            </div>
          </div>
        </section>
      ) : (
        featuredPost && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <Link
              to={`/resources/blog/${featuredPost.attributes.documentId || featuredPost.id}`}
              className="block rounded-2xl bg-primary/5 border border-primary/20 p-8 lg:p-12 hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {featuredPost.attributes.us_title}
                </span>
                <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-surface-elevated border border-border">
                  Featured
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {featuredPost.attributes.title}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mb-6">
                {truncateWords(stripHtml(featuredPost.attributes.description), 50)}
              </p>
              <div className="flex items-center gap-6">
                {featuredPost.attributes.meta_keyword && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {featuredPost.attributes.meta_keyword}
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatBlogDate(featuredPost.attributes.date)}
                </span>
                <Button asChild variant="hero" size="sm" className="gap-1 ml-auto">
                  <span>
                    Read Article <ArrowRight size={14} />
                  </span>
                </Button>
              </div>
            </Link>
          </div>
        </section>
        )
      )}

      {/* All Posts */}
      <section className="py-10 pb-20 lg:pb-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">
            {selectedCategory ? `Latest Articles — ${selectedCategory}` : "Latest Articles"}
          </h2>
          {blogsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-surface-elevated border border-border flex flex-col animate-pulse"
                >
                  <div className="h-4 w-24 bg-background rounded mb-4" />
                  <div className="h-5 w-full bg-background rounded mb-2" />
                  <div className="h-5 w-3/4 bg-background rounded mb-3" />
                  <div className="h-4 w-full bg-background rounded mb-2" />
                  <div className="h-4 w-5/6 bg-background rounded" />
                  <div className="h-4 w-1/3 bg-background rounded mt-6 pt-4 border-t border-border" />
                </div>
              ))}
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                to={`/resources/blog/${post.attributes.documentId || post.id}`}
                className="group p-6 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08)] transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={12} className="text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {post.attributes.us_title}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                  {post.attributes.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed flex-1">
                  {truncateWords(stripHtml(post.attributes.description), 50)}
                </p>
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border">
                  {post.attributes.meta_keyword && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {post.attributes.meta_keyword}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatBlogDate(post.attributes.date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-surface-elevated border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {ctaTitle}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">{ctaSub}</p>
          <Button variant="hero" size="lg" className="mt-6 gap-2">
            {ctaBtn} <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;