import { Search, PenTool, Rocket, LineChart, type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHomeSectionWithItems, stripHtml } from "@/lib/strapi";

const ICON_MAP: Record<string, LucideIcon> = {
  Search, PenTool, Rocket, LineChart,
};

interface HowItWorksBlockProps {
  eyebrow?: string;
  main_title?: string;
  steps?: { icon?: string; step_number?: string; title?: string; description?: string }[];
}

const HowItWorksSection = (props: HowItWorksBlockProps = {}) => {
  const hasBlock = Boolean(props.main_title || props.steps?.length);
  const { data } = useQuery({
    queryKey: ["home-section-items", "how-it-works", "step"],
    queryFn: () => getHomeSectionWithItems("how-it-works", "step"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlock,
  });

  const eyebrow = props.eyebrow ?? data?.section?.attributes?.template ?? "How it works";
  const heading = props.main_title ?? data?.section?.attributes?.section_title ?? "From discovery to scale in four steps";

  const steps = hasBlock
    ? (props.steps ?? []).map((item) => ({
        icon: ICON_MAP[item.icon ?? ""] ?? Search,
        step: item.step_number ?? "",
        title: item.title ?? "",
        description: stripHtml(item.description),
      }))
    : (data?.items ?? []).map((item) => ({
        // icon stored in external_link, step number in description_short
        icon: ICON_MAP[item.attributes.external_link ?? ""] ?? Search,
        step: item.attributes.description_short ?? "",
        title: item.attributes.category_title,
        description: stripHtml(item.attributes.description),
      }));

  return (
    <section className="py-12 lg:py-16 bg-surface-elevated" id="how-it-works">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, i) => (
            <div key={item.step} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%)] w-full h-px bg-gradient-to-r from-primary/40 to-transparent z-0" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <item.icon size={32} />
                </div>
                <span className="text-primary font-bold text-sm mb-2">{item.step}</span>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
