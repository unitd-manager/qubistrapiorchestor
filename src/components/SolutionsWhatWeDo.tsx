import { stripHtml } from "@/lib/strapi";
import { filterPublished } from "@/lib/publish";

interface VerbItem {
  verb?: string;
  detail?: string;
  Publish?: boolean;
}

interface CardItem {
  icon?: string;
  title?: string;
  description?: string;
  Publish?: boolean;
}

interface SolutionsWhatWeDoProps {
  eyebrowLabel?: string;
  heading?: string;
  highlightedHeading?: string;
  description?: string;
  tagline?: string;
  verbs?: VerbItem[];
  cards?: CardItem[];
}

/** "What qBotica actually does" two-column block, used on the Industries page. */
const SolutionsWhatWeDo = ({
  eyebrowLabel,
  heading,
  highlightedHeading,
  description,
  tagline,
  verbs,
  cards,
}: SolutionsWhatWeDoProps) => {
  const verbItems = filterPublished(verbs);
  const cardItems = filterPublished(cards);
  if (verbItems.length === 0 && cardItems.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {eyebrowLabel && (
              <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                {eyebrowLabel}
              </span>
            )}
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {heading} <span className="text-gradient">{highlightedHeading}</span>
            </h2>
            {description && <p className="mt-4 text-muted-foreground">{stripHtml(description)}</p>}
            <div className="mt-8 space-y-4">
              {verbItems.map((item, i) => (
                <div key={`${item.verb ?? "verb"}-${i}`} className="flex items-baseline gap-3">
                  <span className="text-primary font-bold text-lg min-w-[110px]">{item.verb}</span>
                  <span className="text-muted-foreground">{item.detail}</span>
                </div>
              ))}
            </div>
            {tagline && (
              <p className="mt-8 text-sm font-semibold text-foreground border-l-2 border-primary pl-4">
                {tagline}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {cardItems.map((card, i) => (
              <div
                key={`${card.title ?? "card"}-${i}`}
                className="p-6 rounded-2xl bg-surface-elevated border border-border hover:border-primary/30 transition-all duration-300"
              >
                {card.icon && <div className="text-3xl mb-3">{card.icon}</div>}
                {card.title && <div className="font-semibold text-foreground mb-1">{card.title}</div>}
                {card.description && (
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {stripHtml(card.description)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsWhatWeDo;