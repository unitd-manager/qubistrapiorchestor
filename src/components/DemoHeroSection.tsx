import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { blocksToText } from "@/lib/strapi";

interface DemoHeroSectionProps {
  eyebrow_text?: string;
  heading?: string;
  highlighted_word?: string;
  description?: string;
  cta_label?: string;
  cta_link?: string;
}

// "|" acts as a manual line-break separator inside heading, same convention
// used for the Lightwarp title fields
const renderHeading = (heading: string, highlight?: string) =>
  heading.split("|").map((line, i, arr) => {
    const trimmed = line.trim();
    const node =
      highlight && trimmed.includes(highlight) ? (
        <>
          {trimmed.split(highlight)[0]}
          <span className="text-gradient">{highlight}</span>
          {trimmed.split(highlight)[1]}
        </>
      ) : (
        trimmed
      );
    return (
      <span key={i}>
        {node}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });

const DemoHeroSection = ({ eyebrow_text, heading, highlighted_word, description, cta_label, cta_link }: DemoHeroSectionProps) => {
  const sub = blocksToText(description);

  return (
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto">
            {renderHeading(heading, highlighted_word)}
          </h1>
        )}
        {sub && (
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {sub}
          </p>
        )}
        {cta_label && (
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {cta_link ? (
              <a href={cta_link} target="_blank" rel="noopener noreferrer">
                <Button variant="hero" size="lg" className="gap-2 px-8 h-12">
                  {cta_label} <ArrowRight size={18} />
                </Button>
              </a>
            ) : (
              <Button variant="hero" size="lg" className="gap-2 px-8 h-12">
                {cta_label} <ArrowRight size={18} />
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DemoHeroSection;