import { Button } from "@/components/ui/button";
import { UserCheck, Bot, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHomeSectionWithItems, stripHtml } from "@/lib/strapi";

interface HumanInLoopBlockProps {
  eyebrow?: string;
  main_title?: string;
  description?: string;
  badges?: { title?: string }[];
  button?: { label?: string; url?: string } | null;
}

const HumanInLoopSection = (props: HumanInLoopBlockProps = {}) => {
  const hasBlock = Boolean(props.main_title || props.badges?.length);
  const { data } = useQuery({
    queryKey: ["home-section-items", "human-in-loop", "hil_badge"],
    queryFn: () => getHomeSectionWithItems("human-in-loop", "hil_badge"),
    staleTime: 5 * 60 * 1000,
    enabled: !hasBlock,
  });

  const a = data?.section?.attributes;
  const eyebrow = props.eyebrow ?? a?.template ?? "";
  const heading = props.main_title ?? a?.section_title ?? "";
  const description = stripHtml(props.description) || stripHtml(a?.description);
  const ctaLabel = props.button?.label ?? a?.display_type ?? "";
  const ctaUrl = props.button?.url ?? a?.external_link ?? "";
  const badges = hasBlock
    ? (props.badges ?? []).map((item) => item.title ?? "").filter(Boolean)
    : (data?.items ?? []).map((item) => item.attributes.category_title);

  return (
    <section className="py-12 lg:py-16 bg-background" id="human-in-loop">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-primary/20 animate-[spin_30s_linear_infinite]" />
              </div>
              <div className="absolute inset-8 flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-primary/10" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
                  <ArrowRight size={40} className="text-primary-foreground" />
                </div>
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shadow-card">
                <Bot size={28} className="text-primary" />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shadow-card">
                <UserCheck size={28} className="text-primary" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {heading.includes("Human judgment") ? (
                <>
                  {heading.split("Human judgment")[0]}
                  <span className="text-gradient">Human judgment{heading.split("Human judgment")[1]}</span>
                </>
              ) : (
                heading
              )}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              {badges.map((badge) => (
                <div key={badge} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-elevated">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-foreground">{badge}</span>
                </div>
              ))}
            </div>
            <Button asChild variant="hero" size="lg" className="mt-8 gap-2">
              <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                {ctaLabel} <ArrowRight size={18} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HumanInLoopSection;
