import { filterPublished } from "@/lib/publish";

interface FaqItem {
  question?: string;
  answer?: string;
  Publish?: boolean;
}

interface FaqSectionProps {
  eyebrow?: string;
  main_title?: string;
  items?: FaqItem[];
}

/** Section heading plus a stacked list of question/answer cards. */
const FaqSection = ({ eyebrow, main_title, items }: FaqSectionProps) => {
  const faqs = filterPublished(items);

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {eyebrow && <span className="text-primary text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>}
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {main_title}
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, i) => (
            <div key={faq.question || i} className="p-6 rounded-2xl bg-surface-elevated border border-border">
              <h3 className="text-base font-semibold text-foreground mb-2">{faq.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;