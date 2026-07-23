import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { blocksToText } from "@/lib/strapi";

interface FaqItem {
  id?: number;
  question?: string;
  answer?: any;
}

interface FaqGroup {
  id?: number;
  group_title?: string;
  faq?: FaqItem[];
}

interface FaqListSectionProps {
  section_title?: string;
  groups?: FaqGroup[];
}

const AccordionItem = ({ question, answer }: { question?: string; answer?: any }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-lg font-medium text-foreground">{question}</span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 mt-0.5 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-5 text-base text-muted-foreground leading-relaxed">
          {blocksToText(answer)}
        </div>
      )}
    </div>
  );
};

const FaqListSection = ({ section_title, groups }: FaqListSectionProps) => (
  <section className="py-12 lg:py-16 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {section_title && (
          <h2 className="text-3xl font-bold text-foreground text-center">{section_title}</h2>
        )}
        {groups?.map((group, gi) => (
          <div key={group.id ?? gi}>
            <h2 className="text-2xl font-bold text-foreground mb-6 pb-4 border-b border-border">
              {group.group_title}
            </h2>
            <div className="bg-surface-elevated rounded-2xl border border-border px-6 divide-y divide-border">
              {(group.faq ?? []).map((item, fi) => (
                <AccordionItem key={item.id ?? fi} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FaqListSection;