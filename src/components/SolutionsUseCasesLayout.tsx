import {
  FileText,
  HeartPulse,
  DollarSign,
  Truck,
  ShoppingCart,
  Users,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { stripHtml } from "@/lib/strapi";

const ICON_MAP: Record<string, LucideIcon> = {
  DollarSign,
  HeartPulse,
  ShoppingCart,
  Users,
  FileText,
  Truck,
};

interface UseCaseStat {
  text?: string;
}

interface UseCaseItem {
  icon?: string;
  categoryLabel?: string;
  title?: string;
  description?: string;
  stats?: UseCaseStat[];
}

interface SolutionsUseCasesLayoutProps {
  eyebrowLabel?: string;
  heading?: string;
  highlightedHeading?: string;
  description?: string;
  useCases?: UseCaseItem[];
}

/** Main use-case card grid for the Solutions > Use Cases page. */
const SolutionsUseCasesLayout = ({
  eyebrowLabel,
  heading,
  highlightedHeading,
  description,
  useCases,
}: SolutionsUseCasesLayoutProps) => {
  const items = useCases ?? [];

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {eyebrowLabel && (
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">
              {eyebrowLabel}
            </span>
          )}
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {heading} <span className="text-gradient">{highlightedHeading}</span>
          </h2>
          {description && (
            <p className="mt-6 text-lg text-muted-foreground">{stripHtml(description)}</p>
          )}
        </div>

        {items.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            {items.map((uc, i) => {
              const Icon = ICON_MAP[uc.icon ?? ""] ?? FileText;
              return (
                <div
                  key={`${uc.title ?? "use-case"}-${i}`}
                  className="group p-8 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08),0_8px_32px_hsl(0_0%_0%/0.04)] transition-all duration-300"
                >
                  <div className="flex items-start gap-5 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon size={24} />
                    </div>
                    <div>
                      {uc.categoryLabel && (
                        <span className="text-sm font-semibold text-primary uppercase tracking-widest">
                          {uc.categoryLabel}
                        </span>
                      )}
                      {uc.title && (
                        <h3 className="text-xl font-semibold text-foreground mt-1">{uc.title}</h3>
                      )}
                    </div>
                  </div>
                  {uc.description && (
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      {stripHtml(uc.description)}
                    </p>
                  )}
                  {uc.stats && uc.stats.length > 0 && (
                    <div className="space-y-2">
                      {uc.stats.map((s, si) => (
                        <div key={si} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle size={14} className="text-primary flex-shrink-0" />
                          {s.text}
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

export default SolutionsUseCasesLayout;