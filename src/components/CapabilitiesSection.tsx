import { Paintbrush, Layers, Plug, Users, BarChart3, ShieldCheck, type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHomeSectionWithItems, stripHtml } from "@/lib/strapi";

const ICON_MAP: Record<string, LucideIcon> = {
  Paintbrush, Layers, Plug, Users, BarChart3, ShieldCheck,
};

interface CapabilitiesBlockProps {
  eyebrow?: string;
  main_title?: string;
  capability_items?: { icon?: string; title?: string; description?: string; Publish?: boolean }[];
}

const CapabilitiesSection = (props: CapabilitiesBlockProps = {}) => {
  const hasBlock = Boolean(props.main_title || props.capability_items?.length);
  const { data } = useQuery({
    queryKey: ["home-section-items", "capabilities", "capability_item"],
    queryFn: () => getHomeSectionWithItems("capabilities", "capability_item"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlock,
  });

  const eyebrow = props.eyebrow ?? data?.section?.attributes?.template ?? "What qubi is";
  const heading = props.main_title ?? data?.section?.attributes?.section_title ?? "One platform. Modular capabilities. Enterprise control.";

  const capabilities = hasBlock
    ? (props.capability_items ?? [])
        .filter((item) => item.Publish !== false)
        .map((item) => ({
          icon: ICON_MAP[item.icon ?? ""] ?? Plug,
          title: item.title ?? "",
          description: stripHtml(item.description),
        }))
    : (data?.items ?? [])
        .filter((item) => item.attributes?.published !== false)
        .map((item) => ({
          icon: ICON_MAP[item.attributes.description_short ?? ""] ?? Plug,
          title: item.attributes.category_title,
          description: stripHtml(item.attributes.description),
        }));

  return (
    <section className="py-12 lg:py-16 bg-orange-50" id="capabilities">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-widest">{eyebrow}</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {heading.includes("Enterprise control") ? (
              <>
                {heading.split("Enterprise control.")[0]}
                <span className="text-gradient">Enterprise control.</span>
              </>
            ) : (
              heading
            )}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="group relative p-8 rounded-2xl bg-background border border-border hover:border-primary/40 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <cap.icon size={28} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{cap.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
