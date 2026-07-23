import {
  Building2,
  HeartPulse,
  BarChart3,
  Truck,
  CreditCard,
  Headphones,
  Layers,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { stripHtml } from "@/lib/strapi";

const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  HeartPulse,
  BarChart3,
  Truck,
  CreditCard,
  Headphones,
};

interface HighlightItem {
  text?: string;
}

interface IndustryCard {
  title?: string;
  description?: string;
  icon?: string;
  highlights?: HighlightItem[];
}

interface SolutionsIndustryLayoutProps {
  main_title?: string;
  description?: string;
  industry_cards?: IndustryCard[];
  class_name?: string;
}

/** Industry segment cards grid, used on the Solutions > Industries page. */
const SolutionsIndustryLayout = ({
  main_title,
  description,
  industry_cards,
  class_name,
}: SolutionsIndustryLayoutProps) => {
  const cards = industry_cards ?? [];

  return (
    <section className={`py-12 lg:py-16 bg-background ${class_name ?? ""}`}>
      <div className="container mx-auto px-4 lg:px-8">
        {main_title && (
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-center max-w-3xl mx-auto">
            {main_title}
          </h2>
        )}
        {description && (
          <div
            className="mt-6 text-lg text-muted-foreground text-center max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {cards.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {cards.map((card, i) => {
              const Icon = ICON_MAP[card.icon ?? ""] ?? Layers;
              return (
                <div
                  key={`${card.title ?? "industry"}-${i}`}
                  className="group p-8 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08),0_8px_32px_hsl(0_0%_0%/0.04)] transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon size={24} />
                    </div>
                    {card.title && (
                      <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
                    )}
                  </div>
                  {card.description && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {stripHtml(card.description)}
                    </p>
                  )}
                  {card.highlights && card.highlights.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {card.highlights.map((h, hi) => (
                        <div key={hi} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                          <span>{h.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default SolutionsIndustryLayout;