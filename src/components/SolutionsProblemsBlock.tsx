import { stripHtml } from "@/lib/strapi";
import { filterPublished } from "@/lib/publish";

interface ProblemItem {
  title?: string;
  description?: string;
  Publish?: boolean;
}

interface SolutionsProblemsBlockProps {
  eyebrowLabel?: string;
  heading?: string;
  description?: string;
  problems?: ProblemItem[];
}

/** "Why Enterprise AI Fails" 3-card problems block. */
const SolutionsProblemsBlock = ({
  eyebrowLabel,
  heading,
  description,
  problems,
}: SolutionsProblemsBlockProps) => {
  const items = filterPublished(problems);

  return (
    <section className="py-12 lg:py-16 bg-background border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {eyebrowLabel && (
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">
              {eyebrowLabel}
            </span>
          )}
          {heading && (
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {heading}
            </h2>
          )}
          {description && (
            <p className="mt-6 text-lg text-muted-foreground">{stripHtml(description)}</p>
          )}
        </div>
        {items.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {items.map((item, i) => (
              <div key={`${item.title ?? "problem"}-${i}`} className="p-8 rounded-2xl bg-background border border-border">
                {item.title && (
                  <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
                )}
                {item.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {stripHtml(item.description)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SolutionsProblemsBlock;