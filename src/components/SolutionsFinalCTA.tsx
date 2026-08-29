import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { stripHtml } from "@/lib/strapi";
import { filterPublished } from "@/lib/publish";

interface StatItem {
  value?: string;
  label?: string;
  Publish?: boolean;
}

interface SolutionsFinalCTAProps {
  heading?: string;
  highlightedHeading?: string;
  trailingHeading?: string;
  description?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  stats?: StatItem[];
}

/** Closing CTA band, used on the Solutions family of pages. */
const SolutionsFinalCTA = ({
  heading,
  highlightedHeading,
  trailingHeading,
  description,
  buttonLabel,
  buttonUrl,
  stats,
}: SolutionsFinalCTAProps) => {
  const items = filterPublished(stats);

  return (
    <section className="py-12 lg:py-16 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none opacity-50" />
      <div className="relative container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
          {heading} <span className="text-gradient">{highlightedHeading}</span> {trailingHeading}
        </h2>
        {description && (
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            {stripHtml(description)}
          </p>
        )}
        {items.length > 0 && (
          <div className="mt-10 grid sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {items.map((item, i) => (
              <div key={item.label || i} className="text-center">
                <div className="text-3xl font-bold text-gradient">{item.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
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