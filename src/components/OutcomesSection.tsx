import { Zap, DollarSign, TrendingUp, Shield, Eye, Lock, type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHomeSectionWithItems, stripHtml } from "@/lib/strapi";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, DollarSign, TrendingUp, Shield, Eye, Lock,
};

interface OutcomesBlockProps {
  eyebrow?: string;
  main_title?: string;
  outcome_items?: { icon?: string; title?: string; description?: string }[];
}

const OutcomesSection = (props: OutcomesBlockProps = {}) => {
  const hasBlock = Boolean(props.main_title || props.outcome_items?.length);
  const { data } = useQuery({
    queryKey: ["home-section-items", "outcomes", "outcome_item"],
    queryFn: () => getHomeSectionWithItems("outcomes", "outcome_item"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlock,
  });

  const eyebrow = props.eyebrow ?? data?.section?.attributes?.template ?? "Platform outcomes";
  const heading = props.main_title ?? data?.section?.attributes?.section_title ?? "Built for measurable operational impact";

  const outcomes = hasBlock
    ? (props.outcome_items ?? []).map((item) => ({
        icon: ICON_MAP[item.icon ?? ""] ?? Zap,
        title: item.title ?? "",
        description: stripHtml(item.description),
      }))
    : (data?.items ?? []).map((item) => ({
        icon: ICON_MAP[item.attributes.description_short ?? ""] ?? Zap,
        title: item.attributes.category_title,
        description: stripHtml(item.attributes.description),
      }));

  return (
    <section className="py-12 lg:py-16 bg-muted" id="outcomes">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {outcomes.map((item) => (
            <div
              key={item.title}
              className="group flex items-start gap-5 p-6 rounded-2xl hover:bg-surface-elevated transition-all duration-300"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
