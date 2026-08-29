import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { stripHtml } from "@/lib/strapi";
import { filterPublished } from "@/lib/publish";

interface PlanFeature {
  text?: string;
  Publish?: boolean;
}

interface PlanItem {
  tagline?: string;
  title?: string;
  description?: string;
  cta_label?: string;
  highlight?: boolean;
  features?: PlanFeature[];
  Publish?: boolean;
}

interface PlansSectionProps {
  eyebrow?: string;
  main_title?: string;
  description?: string;
  cta_url?: string;
  plans?: PlanItem[];
}

/** Section heading plus a row of pricing/plan cards with feature lists. */
const PlansSection = ({ eyebrow, main_title, description, cta_url, plans }: PlansSectionProps) => {
  const items = filterPublished(plans);

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {eyebrow && <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>}
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {main_title}
          </h2>
          {description && <p className="mt-4 text-muted-foreground">{stripHtml(description)}</p>}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {items.map((plan, planIndex) => (
            <div
              key={plan.title || planIndex}
              className={`rounded-2xl border p-8 flex flex-col h-full transition-all duration-300 ${
                plan.highlight
                  ? "bg-primary/5 border-primary/40 shadow-[0_4px_30px_hsl(24_100%_50%/0.15)] relative"
                  : "bg-surface-elevated border-border hover:border-primary/20"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                {plan.tagline && (
                  <p className="text-sm font-semibold text-primary uppercase tracking-widest">{plan.tagline}</p>
                )}
                <h3 className="text-2xl font-bold text-foreground mt-2">{plan.title}</h3>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{stripHtml(plan.description)}</p>
                )}
              </div>
              <div className="space-y-3 mb-8 flex-1">
                {filterPublished(plan.features).map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    {f.text}
                  </div>
                ))}
              </div>
              {cta_url && (
                <a href={cta_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant={plan.highlight ? "hero" : "hero-outline"} size="lg" className="w-full gap-2">
                    {plan.cta_label} <ArrowRight size={16} />
                  </Button>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;