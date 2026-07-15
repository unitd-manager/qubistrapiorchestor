import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { getBlogs, stripHtml, type StrapiItem, type BlogAttributes } from "@/lib/strapi";

interface BlogListSectionProps {
  main_title?: string;
  show_featured?: boolean;
  max_posts?: number;
}

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

/**
 * Renders blog articles from the Blog collection: an optional featured article
 * followed by the latest-articles grid. Articles are managed in Content
 * Manager > Blog — this block only controls how they are presented.
 */
const BlogListSection = ({ main_title, show_featured = true, max_posts = 50 }: BlogListSectionProps) => {
  const { data: blogsData } = useQuery({
    queryKey: ["blog-posts", max_posts],
    queryFn: () => getBlogs({ limit: max_posts }),
    staleTime: 5 * 60 * 1000,
  });

  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  // Use only qBotica posts (those with us_title set)
  const allPosts: StrapiItem<BlogAttributes>[] = (blogsData?.data ?? []).filter((p) => p.attributes.us_title);

  const visiblePosts = selectedCategory
    ? allPosts.filter((p) => p.attributes.us_title === selectedCategory)
    : allPosts;

  const featuredPost = show_featured ? (visiblePosts.find((p) => p.attributes.flag === true) ?? null) : null;
  const regularPosts = featuredPost ? visiblePosts.filter((p) => p.attributes.flag !== true) : visiblePosts;

  const listTitle = main_title || "Latest Articles";

  return (
    <>
      {featuredPost && (
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
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{featuredPost.attributes.title}</h2>
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
                <span className="text-xs text-muted-foreground">{formatBlogDate(featuredPost.attributes.date)}</span>
                <Button asChild variant="hero" size="sm" className="gap-1 ml-auto">
                  <span>
                    Read Article <ArrowRight size={14} />
                  </span>
                </Button>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="py-10 pb-20 lg:pb-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">
            {selectedCategory ? `${listTitle} — ${selectedCategory}` : listTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                to={`/resources/blog/${post.attributes.documentId || post.id}`}
                className="group p-6 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08)] transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={12} className="text-primary" />
                  <span className="text-xs font-semibold text-primary">{post.attributes.us_title}</span>
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
                  <span className="text-xs text-muted-foreground ml-auto">{formatBlogDate(post.attributes.date)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogListSection;
