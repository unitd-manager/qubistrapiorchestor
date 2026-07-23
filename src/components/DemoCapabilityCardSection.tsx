import { CheckCircle, Clock, Play } from "lucide-react";

interface BulletPoint {
  id?: number;
  simple?: string;
  content?: string;
}

interface CapabilityCardItem {
  id?: number;
  title?: string;
  duration_badge?: string;
  bullet_points?: BulletPoint[];
  cta_label?: string;
  cta_link?: string;
}

interface DemoCapabilityCardSectionProps {
  title?: string;
  subtitle?: string;
  card?: CapabilityCardItem[];
}

const DemoCapabilityCardSection = ({ title, subtitle, card = [] }: DemoCapabilityCardSectionProps) => (
  <section className="py-12 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      {(title || subtitle) && (
        <div className="max-w-3xl mx-auto text-center mb-16">
          {title && (
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{title}</span>
          )}
          {subtitle && (
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {subtitle}
            </h2>
          )}
        </div>
      )}
      {card.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8">
          {card.map((item, idx) => {
            const bullets = (item.bullet_points ?? []).filter((b) => b.content);
            return (
              <a
                key={item.id ?? idx}
                href={item.cta_link || undefined}
                target={item.cta_link ? "_blank" : undefined}
                rel={item.cta_link ? "noopener noreferrer" : undefined}
                className="group p-8 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.08)] transition-all duration-300 cursor-pointer block"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  {item.duration_badge && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background border border-border rounded-full px-2.5 py-1 shrink-0 ml-4">
                      <Clock size={11} />
                      {item.duration_badge}
                    </div>
                  )}
                </div>
                {bullets.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {bullets.map((b, bi) => (
                      <div key={b.id ?? bi} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle size={13} className="text-primary flex-shrink-0" />
                        {b.content}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all duration-200">
                  <Play size={14} className="fill-primary" />
                  {item.cta_label}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  </section>
);

export default DemoCapabilityCardSection;