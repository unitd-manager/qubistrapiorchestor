import { CheckCircle } from "lucide-react";
import { stripHtml } from "@/lib/strapi";
import { filterPublished } from "@/lib/publish";

interface DifferentiatorItem {
  title?: string;
  description?: string;
  Publish?: boolean;
}

interface DifferentiatorsSectionProps {
  eyebrow?: string;
  main_title?: string;
  items?: DifferentiatorItem[];
}

/** Four-column grid of check-marked cards ("Why enterprise clients choose us"). */
const DifferentiatorsSection = ({ eyebrow, main_title, items }: DifferentiatorsSectionProps) => {
  const cards = filterPublished(items);

  return (
    <section className="py-12 lg:py-16 bg-surface-elevated border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {eyebrow && (
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
          )}
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {main_title}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((d, i) => (
            <div key={d.title || i} className="p-6 rounded-2xl bg-background border border-border">
              <CheckCircle size={20} className="text-primary mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">{d.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{stripHtml(d.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorsSection;