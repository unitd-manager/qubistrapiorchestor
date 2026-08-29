import { TrendingDown } from "lucide-react";
import { stripHtml } from "@/lib/strapi";
import { filterPublished } from "@/lib/publish";

interface CaseMetric {
  label?: string;
  metric_type?: "before_after" | "reduction" | "value";
  primary_value?: string;
  secondary_value?: string;
  Publish?: boolean;
}

interface CaseStudy {
  industry?: string;
  title?: string;
  challenge?: string;
  solution?: string;
  quote?: string;
  quote_role?: string;
  metrics?: CaseMetric[];
  Publish?: boolean;
}

interface CaseStudiesSectionProps {
  eyebrow?: string;
  main_title?: string;
  case_studies?: CaseStudy[];
}

/** Section heading plus large case-study cards with challenge, solution, quote, and result metrics. */
const CaseStudiesSection = ({ eyebrow, main_title, case_studies }: CaseStudiesSectionProps) => {
  const studies = filterPublished(case_studies);

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {eyebrow && (
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
          )}
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {main_title}
          </h2>
        </div>

        <div className="space-y-12">
          {studies.map((cs, csIndex) => (
            <div key={cs.title || csIndex} className="rounded-2xl bg-surface-elevated border border-border overflow-hidden">
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Left panel */}
                <div className="lg:col-span-2 p-8 bg-primary/5 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
                  <div>
                    <span className="text-sm font-semibold text-primary uppercase tracking-widest">{cs.industry}</span>
                    <h3 className="text-2xl font-bold text-foreground mt-2">{cs.title}</h3>
                    {cs.challenge && (
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-foreground mb-2">Challenge</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{stripHtml(cs.challenge)}</p>
                      </div>
                    )}
                    {cs.solution && (
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-foreground mb-2">Solution</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{stripHtml(cs.solution)}</p>
                      </div>
                    )}
                  </div>
                  {cs.quote && (
                    <blockquote className="mt-8 border-l-2 border-primary pl-4">
                      <p className="text-sm text-foreground italic">"{cs.quote}"</p>
                      {cs.quote_role && (
                        <footer className="mt-2 text-xs text-muted-foreground">— {cs.quote_role}</footer>
                      )}
                    </blockquote>
                  )}
                </div>

                {/* Right panel - metrics */}
                <div className="lg:col-span-3 p-8 flex flex-col justify-center">
                  <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-6">Results</p>
                  <div className="grid sm:grid-cols-3 gap-6">
                    {filterPublished(cs.metrics).map((metric, mIndex) => (
                      <div key={metric.label || mIndex} className="p-6 rounded-xl bg-background border border-border text-center">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <TrendingDown size={16} className="text-green-500" />
                        </div>
                        {metric.metric_type === "before_after" ? (
                          <div>
                            <div className="text-sm text-muted-foreground line-through">{metric.secondary_value}</div>
                            <div className="text-2xl font-bold text-gradient mt-1">{metric.primary_value}</div>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-gradient">{metric.primary_value}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;