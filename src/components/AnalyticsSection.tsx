import { BarChart3, Activity, Gauge, Monitor, Headphones, Lock, type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHomeSectionWithItems, stripHtml } from "@/lib/strapi";

const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3, Activity, Gauge, Monitor, Headphones, Lock,
};

interface AnalyticsBlockProps {
  eyebrow?: string;
  main_title?: string;
  features?: { icon?: string; title?: string; description?: string }[];
}

const AnalyticsSection = (props: AnalyticsBlockProps = {}) => {
  const hasBlock = Boolean(props.main_title || props.features?.length);
  const { data } = useQuery({
    queryKey: ["home-section-items", "analytics", "analytics_feature"],
    queryFn: () => getHomeSectionWithItems("analytics", "analytics_feature"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlock,
  });

  const eyebrow = props.eyebrow ?? data?.section?.attributes?.template ?? "Analytics & Trust";
  const heading = props.main_title ?? data?.section?.attributes?.section_title ?? "Visibility, performance, and accountability built in";

  const features = hasBlock
    ? (props.features ?? []).map((item) => ({
        icon: ICON_MAP[item.icon ?? ""] ?? BarChart3,
        title: item.title ?? "",
        description: stripHtml(item.description),
      }))
    : (data?.items ?? []).map((item) => ({
        icon: ICON_MAP[item.attributes.description_short ?? ""] ?? BarChart3,
        title: item.attributes.category_title,
        description: stripHtml(item.attributes.description),
      }));

  return (
    <section className="py-12 lg:py-16 bg-surface-elevated" id="analytics">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {heading.includes("built in") ? (
              <>
                {heading.split("built in")[0]}
                <span className="text-gradient">built in</span>
              </>
            ) : (
              heading
            )}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => (
            <div
              key={item.title}
              className="group p-6 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <item.icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-14">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
