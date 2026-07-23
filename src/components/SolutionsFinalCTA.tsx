import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { stripHtml } from "@/lib/strapi";

interface SolutionsFinalCTAProps {
  heading?: string;
  highlightedHeading?: string;
  description?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

/** Closing CTA band, used on the Solutions family of pages. */
const SolutionsFinalCTA = ({
  heading,
  highlightedHeading,
  description,
  buttonLabel,
  buttonUrl,
}: SolutionsFinalCTAProps) => {
  return (
    <section className="py-12 lg:py-16 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none opacity-50" />
      <div className="relative container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
          {heading} <span className="text-gradient">{highlightedHeading}</span>
        </h2>
        {description && (
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
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

export default SolutionsFinalCTA;