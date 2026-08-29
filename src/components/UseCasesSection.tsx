import { Headphones, Calculator, Monitor, FileText, UserCog, GitBranch, type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHomeSectionWithItems, stripHtml } from "@/lib/strapi";
import { filterPublished, filterPublishedLive } from "@/lib/publish";

const ICON_MAP: Record<string, LucideIcon> = {
  Headphones, Calculator, Monitor, FileText, UserCog, GitBranch,
};

interface UseCasesBlockProps {
  eyebrow?: string;
  main_title?: string;
  use_case_items?: { icon?: string; title?: string; description?: string; Publish?: boolean }[];
}

const UseCasesSection = (props: UseCasesBlockProps = {}) => {
  const hasBlock = Boolean(props.main_title || props.use_case_items?.length);
  const { data } = useQuery({
    queryKey: ["home-section-items", "use-cases", "use_case_item"],
    queryFn: () => getHomeSectionWithItems("use-cases", "use_case_item"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlock,
  });

  const eyebrow = props.eyebrow ?? data?.section?.attributes?.template ?? "Use cases";
  const heading = props.main_title ?? data?.section?.attributes?.section_title ?? "Automation that fits your business";

  const useCases = hasBlock
    ? filterPublished(props.use_case_items).map((item) => ({
        icon: ICON_MAP[item.icon ?? ""] ?? FileText,
        title: item.title ?? "",
        description: stripHtml(item.description),
      }))
    : filterPublishedLive(data?.items).map((item) => ({
        icon: ICON_MAP[item.attributes.description_short ?? ""] ?? FileText,
        title: item.attributes.category_title,
        description: stripHtml(item.attributes.description),
      }));

  return (
    <section className="py-12 lg:py-16 bg-background" id="use-cases">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((item, i) => (
            <div
              key={item.title || i}
              className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;