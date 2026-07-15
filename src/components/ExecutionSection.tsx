import { DynamicIcon } from "@/components/DynamicIcon";
import { stripHtml } from "@/lib/strapi";

interface IconCardItem {
  icon?: string;
  title?: string;
  description?: string;
}

interface ExecutionSectionProps {
  main_title?: string;
  title_highlight?: string;
  description?: string;
  items?: IconCardItem[];
  callout_title?: string;
  callout_description?: string;
}

/** Heading with a gradient tail, three icon cards, and a highlighted callout banner. */
const ExecutionSection = ({
  main_title,
  title_highlight,
  description,
  items,
  callout_title,
  callout_description,
}: ExecutionSectionProps) => {
  const cards = items ?? [];

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {main_title} {title_highlight && <span className="text-gradient">{title_highlight}</span>}
            </h2>
            {description && (
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{stripHtml(description)}</p>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {cards.map((item) => (
              <div key={item.title} className="p-8 rounded-2xl bg-surface-elevated border border-border">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <DynamicIcon name={item.icon} size={22} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          {callout_title && (
            <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-lg font-semibold text-foreground">{callout_title}</p>
              {callout_description && <p className="mt-2 text-muted-foreground text-sm">{callout_description}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExecutionSection;
