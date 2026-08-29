import { filterPublished } from "@/lib/publish";

interface StoryParagraph {
  text?: string;
  Publish?: boolean;
}

interface StatItem {
  value?: string;
  label?: string;
  Publish?: boolean;
}

interface StorySectionProps {
  eyebrow?: string;
  main_title?: string;
  paragraphs?: StoryParagraph[];
  stats?: StatItem[];
}

/** Eyebrow, heading, story paragraphs, and a row of stat cards. */
const StorySection = ({ eyebrow, main_title, paragraphs, stats }: StorySectionProps) => {
  const heading = main_title ?? "";
  const paras = filterPublished(paragraphs).map((p) => p.text ?? "").filter(Boolean);
  const statItems = filterPublished(stats).filter((s) => s.value || s.label);

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {eyebrow && (
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
          )}
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {heading.includes("qBotica") ? (
              <>
                {heading.split("qBotica")[0]}
                <span className="text-gradient">qBotica</span>
                {heading.split("qBotica")[1]}
              </>
            ) : (
              heading
            )}
          </h2>
          <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
            {paras.map((para, i) => (
              <p
                key={i}
                className={i === 0 ? "text-xl font-semibold text-foreground" : undefined}
              >
                {para}
              </p>
            ))}
          </div>
          {statItems.length > 0 && (
            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              {statItems.map((item, i) => (
                <div key={item.label || i} className="p-6 rounded-2xl bg-surface-elevated border border-border text-center">
                  <div className="text-4xl font-bold text-gradient">{item.value}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StorySection;