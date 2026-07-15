import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User } from "lucide-react";
import { getBlogByDocumentId, getBlogs, mediaUrl, stripHtml, type BlogAttributes, type StrapiItem } from "@/lib/strapi";
import type { SEOMetadata } from "@/types/seo";

function formatBlogDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function sanitizeBlogHtml(html: string): string {
  if (typeof window === "undefined") return stripHtml(html);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((el) => el.remove());

  const allowedTags = new Set([
    "a",
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "ul",
    "ol",
    "li",
    "hr",
    "img",
    "code",
    "pre",
    "span",
    "div",
  ]);

  const walk = (node: Element) => {
    const tag = node.tagName.toLowerCase();
    if (!allowedTags.has(tag)) {
      const text = doc.createTextNode(node.textContent ?? "");
      node.replaceWith(text);
      return;
    }

    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || name === "style") {
        node.removeAttribute(attr.name);
        continue;
      }
      if (tag === "a") {
        if (name !== "href" && name !== "target" && name !== "rel") node.removeAttribute(attr.name);
      } else if (tag === "img") {
        if (name !== "src" && name !== "alt" && name !== "title") node.removeAttribute(attr.name);
      } else {
        if (name !== "class") node.removeAttribute(attr.name);
      }
    }

    if (tag === "a") {
      const href = node.getAttribute("href")?.trim() ?? "";
      if (!href || /^javascript:/i.test(href)) {
        const text = doc.createTextNode(node.textContent ?? "");
        node.replaceWith(text);
        return;
      }
      const target = node.getAttribute("target");
      if (target === "_blank") {
        const rel = node.getAttribute("rel") ?? "";
        const needed = ["noopener", "noreferrer"];
        const merged = Array.from(new Set(rel.split(/\s+/).filter(Boolean).concat(needed))).join(" ");
        node.setAttribute("rel", merged);
      }
    }

    Array.from(node.children).forEach(walk);
  };

  Array.from(doc.body.children).forEach(walk);
  return doc.body.innerHTML;
}

export default function BlogDetailPage() {
  const params = useParams();
  const documentId = params.documentId;

  const { data, isLoading } = useQuery({
    queryKey: ["blog", documentId],
    queryFn: () => getBlogByDocumentId(documentId as string),
    enabled: typeof documentId === "string" && documentId.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const blog: StrapiItem<BlogAttributes> | null = data?.data ?? null;
  const contentHtml = blog?.attributes.description ? sanitizeBlogHtml(blog.attributes.description) : "";

  const bannerUrl =
    blog?.attributes.images && blog.attributes.images.length > 0 ? mediaUrl(blog.attributes.images[0].url) : "";

  const title = blog?.attributes.meta_title || blog?.attributes.title || "Blog";
  const description = blog?.attributes.meta_description || stripHtml(blog?.attributes.description) || "Blog article";

  const seoMetadata: SEOMetadata | null = blog
    ? {
        id: String(blog.id),
        title,
        description,
        keywords: blog.attributes.meta_keyword || undefined,
        robots: "index, follow",
        ogType: "article",
        ogTitle: title,
        ogDescription: description,
        ogImage: bannerUrl || undefined,
        twitterCard: "summary_large_image",
        twitterTitle: title,
        twitterDescription: description,
        twitterImage: bannerUrl || undefined,
      }
    : null;

  const { data: recentData } = useQuery({
    queryKey: ["blog-recent"],
    queryFn: () => getBlogs({ limit: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const allRecent = (recentData?.data ?? []).filter((p) => p.attributes.us_title);
  const recentPosts = allRecent
    .filter((p) => (documentId ? p.attributes.documentId !== documentId : true))
    .slice(0, 5);
  const categories = Array.from(new Set(allRecent.map((p) => p.attributes.us_title).filter(Boolean))).slice(0, 20);

  return (
    <div className="min-h-screen">
      <SEOHead metadata={seoMetadata} />
      <Navbar />

      <section className="pt-20 pb-14 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/resources/blog">
                <ArrowLeft size={14} />
                Back to Blog
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div>Loading...</div>
            </div>
          ) : !blog ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div>Blog not found</div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt={blog.attributes.images?.[0]?.alternativeText || blog.attributes.title}
                    width="1200"
                    height="675"
                    className="w-full h-[260px] sm:h-[340px] object-cover rounded-2xl border border-border"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-[260px] sm:h-[340px] rounded-2xl border border-border bg-surface-elevated" />
                )}

                <div className="mt-8">
                  {blog.attributes.us_title && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      {blog.attributes.us_title}
                    </div>
                  )}

                  <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                    {blog.attributes.title}
                  </h1>

                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    {blog.attributes.author && (
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{blog.attributes.author}</span>
                      </div>
                    )}
                    {blog.attributes.date && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{formatBlogDate(blog.attributes.date)}</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="blog-content mt-8 text-base sm:text-lg text-foreground"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                </div>
              </div>

              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-24 space-y-6">
                  <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                    <div className="text-sm font-semibold text-foreground mb-4">Recent Posts</div>
                    <div className="space-y-3">
                      {recentPosts.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No posts</div>
                      ) : (
                        recentPosts.map((p) => (
                          <Link
                            key={p.id}
                            to={`/resources/blog/${p.attributes.documentId || p.id}`}
                            className="block rounded-lg hover:bg-background/70 transition-colors p-2 -m-2"
                          >
                            <div className="text-sm font-medium text-foreground leading-snug">{p.attributes.title}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{formatBlogDate(p.attributes.date)}</div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                    <div className="text-sm font-semibold text-foreground mb-4">Categories</div>
                    <div className="flex flex-wrap gap-2">
                      {categories.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No categories</div>
                      ) : (
                        categories.map((c) => (
                          <Link
                            key={c}
                            to={`/resources/blog?category=${encodeURIComponent(c)}`}
                            className="px-3 py-1 rounded-full bg-background border border-border text-xs font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                          >
                            {c}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
