interface StatItem {
  value?: string;
  label?: string;
}

interface StatsSectionProps {
  stats?: StatItem[];
}

/** Horizontal bar of big stat numbers with labels. */
const StatsSection = ({ stats }: StatsSectionProps) => {
  const items = (stats ?? []).filter((s) => s.value || s.label);
  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-surface-elevated border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-gradient">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
