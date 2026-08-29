import { AlertTriangle, Unlink, Eye, Scaling, HandMetal, type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHomeSectionWithItems, stripHtml } from "@/lib/strapi";

const ICON_MAP: Record<string, LucideIcon> = {
  Unlink, HandMetal, AlertTriangle, Eye, Scaling,
};

interface ProblemBlockProps {
  main_title?: string;
  description?: string;
  problem_items?: { icon?: string; title?: string; Publish?: boolean }[];
}

const ProblemSection = (props: ProblemBlockProps = {}) => {
  const hasBlock = Boolean(props.main_title || props.problem_items?.length);
  const { data } = useQuery({
    queryKey: ["home-section-items", "problem", "problem_item"],
    queryFn: () => getHomeSectionWithItems("problem", "problem_item"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlock,
  });

  const heading = props.main_title ?? data?.section?.attributes?.section_title ?? "Enterprise work is too fragmented to automate with bots alone";
  const subheading = stripHtml(props.description) || stripHtml(data?.section?.attributes?.description) || "Most enterprises struggle with siloed tools, manual processes, and limited scalability — making true end-to-end automation impossible.";

  const problems = hasBlock
  ? (props.problem_items ?? [])
      .filter((item) => item.Publish !== false)
      .map((item) => ({
        icon: ICON_MAP[item.icon ?? ""] ?? Unlink,
        label: item.title ?? "",
      }))
  : (data?.items ?? [])
      .filter((item) => item.attributes?.published !== false)
      .map((item) => ({
        icon: ICON_MAP[item.attributes.description_short ?? ""] ?? Unlink,
        label: item.attributes.category_title,
      }));

  return (
    <section className="py-12 lg:py-16 bg-background" id="problem">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {problems.map((item) => (
            <div
              key={item.label}
              className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <item.icon size={24} />
              </div>
              <p className="text-sm font-medium text-center text-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
