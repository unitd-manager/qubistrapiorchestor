import { stripHtml } from "@/lib/strapi";

interface SimpleHeroProps {
  badge_text?: string;
  main_title?: string;
  description?: string;
}

/** Centered text-only page hero (customers, and other sub-pages). */
const SimpleHeroSection = ({ badge_text, main_title, description }: SimpleHeroProps) => {
  const heading = main_title ?? "";
  // Highlight the tail after the last comma-free break if it matches known gradient phrases
  const gradientPhrase = ["Real Operations", "qubi"].find((p) => heading.includes(p));

  return (
    <section className="relative pt-20 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="relative container mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
        {badge_text && (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {badge_text}
          </span>
        )}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto">
          {gradientPhrase ? (
            <>
              {heading.split(gradientPhrase)[0]}
              <span className="text-gradient">{gradientPhrase}</span>
              {heading.split(gradientPhrase)[1]}
            </>
          ) : (
            heading
          )}
        </h1>
        {description && (
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {stripHtml(description)}
          </p>
        )}
      </div>
    </section>
  );
};

export default SimpleHeroSection;
