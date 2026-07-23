import { stripHtml } from "@/lib/strapi";

interface FlowStep {
  icon?: string;
  title?: string;
  description?: string;
}

interface SolutionsExecutionFlowProps {
  eyebrowLabel?: string;
  heading?: string;
  highlightedHeading?: string;
  steps?: FlowStep[];
}

/** "The Execution Engine" step flow, used on the Solutions > Use Cases page. */
const SolutionsExecutionFlow = ({
  eyebrowLabel,
  heading,
  highlightedHeading,
  steps,
}: SolutionsExecutionFlowProps) => {
  const items = steps ?? [];
  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-surface-elevated border-y border-border">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        {eyebrowLabel && (
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">
            {eyebrowLabel}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12 mt-2">
          {heading} <span className="text-gradient">{highlightedHeading}</span>
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8">
          {items.map((step, i) => (
            <div key={`${step.title ?? "step"}-${i}`} className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{step.icon}</div>
                <div className="font-semibold text-foreground text-sm">{step.title}</div>
                <div className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                  {stripHtml(step.description)}
                </div>
              </div>
              {i < items.length - 1 && (
                <div className="text-2xl text-primary font-bold hidden lg:block">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsExecutionFlow;