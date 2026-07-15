import { DynamicIcon } from "@/components/DynamicIcon";
import { stripHtml } from "@/lib/strapi";

interface IconCardItem {
  icon?: string;
  title?: string;
  description?: string;
}

interface IconGridSectionProps {
  eyebrow?: string;
  main_title?: string;
  description?: string;
  items?: IconCardItem[];
}

/** Section heading plus a grid of icon + title + description cards. */
const IconGridSection = ({ eyebrow, main_title, description, items }: IconGridSectionProps) => {
  const cards = items ?? [];

  return (
    <section className="py-12 lg:py-16 bg-surface-elevated border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {eyebrow && <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>}
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {main_title}
          </h2>
          {description && <p className="mt-4 text-muted-foreground">{stripHtml(description)}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08)] transition-all duration-300 text-center"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                <DynamicIcon name={card.icon} size={22} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IconGridSection;
