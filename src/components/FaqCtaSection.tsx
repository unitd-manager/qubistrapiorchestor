import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { blocksToText } from "@/lib/strapi";

interface FaqCtaSectionProps {
  eyebrow_text?: string;
  heading?: string;
  description?: any;
  primary_cta_label?: string;
  primary_cta_link?: string;
  secondary_cta_label?: string;
  secondary_cta_link?: string;
}

const FaqCtaSection = ({
  eyebrow_text,
  heading,
  description,
  primary_cta_label,
  primary_cta_link,
  secondary_cta_label,
  secondary_cta_link,
}: FaqCtaSectionProps) => (
  <section className="py-16 bg-surface-elevated border-t border-border">
    <div className="container mx-auto px-4 lg:px-8 text-center">
      {eyebrow_text && (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {eyebrow_text}
        </span>
      )}
      {heading && (
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
          {heading}
        </h2>
      )}
      {description && (
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          {blocksToText(description)}
        </p>
      )}
      {(primary_cta_label || secondary_cta_label) && (
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {primary_cta_label && (
            <a href={primary_cta_link} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="gap-2">
                {primary_cta_label} <ArrowRight size={16} />
              </Button>
            </a>
          )}
          {secondary_cta_label && (
            <a href={secondary_cta_link} target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg" className="gap-2">
                {secondary_cta_label} <ArrowRight size={16} />
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  </section>
);

export default FaqCtaSection;