import { filterPublished } from "@/lib/publish";

interface ComparisonItem {
  text?: string;
  Publish?: boolean;
}

interface SolutionsComparisonBlockProps {
  heading?: string;
  highlightedHeading?: string;
  othersLabel?: string;
  othersItems?: ComparisonItem[];
  qubiLabel?: string;
  qubiItems?: ComparisonItem[];
}

/** "Most AI stops here. We don't." two-column comparison block. */
const SolutionsComparisonBlock = ({
  heading,
  highlightedHeading,
  othersLabel,
  othersItems,
  qubiLabel,
  qubiItems,
}: SolutionsComparisonBlockProps) => {
  const others = filterPublished(othersItems);
  const qubi = filterPublished(qubiItems);

  return (
    <section className="py-12 lg:py-16 bg-surface-elevated border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {heading} <span className="text-gradient">{highlightedHeading}</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl bg-background border border-border">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-5">
              {othersLabel ?? "Others"}
            </p>
            <div className="space-y-3">
              {others.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-muted-foreground text-sm">
                  <span className="text-destructive font-bold">—</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/30">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-5">
              {qubiLabel ?? "qubi"}
            </p>
            <div className="space-y-3">
              {qubi.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-foreground text-sm font-medium">
                  <span className="text-primary font-bold">✓</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsComparisonBlock;