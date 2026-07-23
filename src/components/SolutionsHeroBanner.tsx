import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { stripHtml } from "@/lib/strapi";

interface SolutionsHeroBannerProps {
  badgeLabel?: string;
  heading?: string;
  highlightedHeading?: string;
  trailingHeading?: string;
  description?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

/** Top hero banner for the Solutions family of pages (Use Cases, Industries, etc). */
const SolutionsHeroBanner = ({
  badgeLabel,
  heading,
  highlightedHeading,
  trailingHeading,
  description,
  buttonLabel,
  buttonUrl,
}: SolutionsHeroBannerProps) => {
  return (
    <section className="relative pt-20 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="relative container mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
        {badgeLabel && (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {badgeLabel}
          </span>
        )}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto">
          {heading} <span className="text-gradient">{highlightedHeading}</span> {trailingHeading}
        </h1>
        {description && (
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {stripHtml(description)}
          </p>
        )}
        {buttonLabel && buttonUrl && (
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href={buttonUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="gap-2 px-8 h-12">
                {buttonLabel} <ArrowRight size={18} />
              </Button>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default SolutionsHeroBanner;