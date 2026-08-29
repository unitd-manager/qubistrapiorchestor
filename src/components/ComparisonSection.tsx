import { filterPublished } from "@/lib/publish";

interface ComparisonRow {
  aspect?: string;
  them?: string;
  us?: string;
  Publish?: boolean;
}

interface ComparisonSectionProps {
  eyebrow?: string;
  main_title?: string;
  them_label?: string;
  us_label?: string;
  rows?: ComparisonRow[];
}

/** Comparison table: aspect vs. competitor column vs. qubi column. */
const ComparisonSection = ({ eyebrow, main_title, them_label, us_label, rows }: ComparisonSectionProps) => {
  const items = filterPublished(rows);

  return (
    <section className="py-12 lg:py-16 bg-surface-elevated border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {eyebrow && <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>}
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {main_title}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 pr-8 font-semibold text-foreground">Aspect</th>
                <th className="text-center py-4 px-4 font-semibold text-muted-foreground">{them_label ?? "Others"}</th>
                <th className="text-center py-4 px-4 font-semibold text-primary">{us_label ?? "qubi"}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr key={row.aspect || i} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                  <td className="py-4 pr-8 font-medium text-foreground">{row.aspect}</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">{row.them}</td>
                  <td className="py-4 px-4 text-center text-primary font-medium">{row.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;