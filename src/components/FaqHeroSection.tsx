import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { blocksToText } from "@/lib/strapi";

interface FaqHeroSectionProps {
  eyebrow_text?: string;
  heading?: string;
  highlighted_word?: string;
  description?: any;
  primary_cta_label?: string;
  primary_cta_link?: string;
  secondary_cta_label?: string;
  secondary_cta_link?: string;
}

const renderHeading = (heading: string, highlight?: string) => {
  if (!highlight || !heading.includes(highlight)) return heading;
  const [before, after] = heading.split(highlight);
  return (
    <>
      {before}
      <span className="text-gradient">{highlight}</span>
      {after}
    </>
  );
};

const FaqHeroSection = ({
  eyebrow_text,
  heading,
  highlighted_word,
  description,
  primary_cta_label,
  primary_cta_link,
  secondary_cta_label,
  secondary_cta_link,
}: FaqHeroSectionProps) => (
  <section className="relative pt-20 overflow-hidden bg-background">
    <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
    <div className="relative container mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
      {eyebrow_text && (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {eyebrow_text}
        </span>
      )}
      {heading && (
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground max-w-3xl mx-auto">
          {renderHeading(heading, highlighted_word)}
        </h1>
      )}
      {description && (
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
          {blocksToText(description)}
        </p>
      )}
      {(primary_cta_label || secondary_cta_label) && (
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {primary_cta_label && (
            <a href={primary_cta_link} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="gap-2 px-8 h-12">
                {primary_cta_label} <ArrowRight size={18} />
              </Button>
            </a>
          )}
          {secondary_cta_label && (
            <a href={secondary_cta_link} target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg" className="gap-2 px-8 h-12">
                {secondary_cta_label} <ArrowRight size={18} />
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  </section>
);

export default FaqHeroSection;