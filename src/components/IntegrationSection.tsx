import { Building2, Database, Globe, Brain, Wrench, type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHomeSectionWithItems, stripHtml } from "@/lib/strapi";
import { filterPublished, filterPublishedLive } from "@/lib/publish";

const ICON_MAP: Record<string, LucideIcon> = {
  Building2, Database, Globe, Brain, Wrench,
};

interface IntegrationBlockProps {
  eyebrow?: string;
  main_title?: string;
  description?: string;
  integration_items?: { icon?: string; label?: string; count?: string; Publish?: boolean }[];
}

const IntegrationSection = (props: IntegrationBlockProps = {}) => {
  const hasBlock = Boolean(props.main_title || props.integration_items?.length);
  const { data } = useQuery({
    queryKey: ["home-section-items", "integrations", "integration_item"],
    queryFn: () => getHomeSectionWithItems("integrations", "integration_item"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlock,
  });

  const eyebrow = props.eyebrow ?? data?.section?.attributes?.template ?? "Integrations";
  const heading = props.main_title ?? data?.section?.attributes?.section_title ?? "Works across your existing stack";
  const subheading = stripHtml(props.description) || stripHtml(data?.section?.attributes?.description) || "Connect to the systems you already use — from enterprise ERPs to modern AI APIs — with pre-built connectors and extensible integration layers.";

  const integrations = hasBlock
    ? filterPublished(props.integration_items).map((item) => ({
        icon: ICON_MAP[item.icon ?? ""] ?? Globe,
        label: item.label ?? "",
        count: item.count ?? "",
      }))
    : filterPublishedLive(data?.items).map((item) => ({
        // icon in description_short, count in description
        icon: ICON_MAP[item.attributes.description_short ?? ""] ?? Globe,
        label: item.attributes.category_title,
        count: item.attributes.description ?? "",
      }));

  return (
    <section className="py-12 lg:py-16 bg-surface-elevated" id="integrations">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {integrations.map((item, i) => (
            <div
              key={item.label || i}
              className="group flex flex-col items-center gap-4 p-8 rounded-2xl border border-border hover:border-primary/40 bg-background transition-all duration-300 hover:shadow-card-hover"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <item.icon size={30} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{item.count}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;