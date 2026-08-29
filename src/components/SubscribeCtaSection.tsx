import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { stripHtml } from "@/lib/strapi";

interface MenuItem {
  label?: string;
  url?: string;
  targetBlank?: boolean;
  Publish?: boolean;
}

interface SubscribeCtaSectionProps {
  main_title?: string;
  description?: string;
  button?: MenuItem;
}

/** Centered heading, supporting text, and one action button on a tinted band. */
const SubscribeCtaSection = ({ main_title, description, button }: SubscribeCtaSectionProps) => {
  const isButtonPublished = button?.Publish !== false;

  return (
    <section className="py-16 bg-surface-elevated border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">{main_title}</h2>
        {description && <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">{stripHtml(description)}</p>}
        {isButtonPublished && button?.label &&
          (button.url ? (
            <Button asChild variant="hero" size="lg" className="mt-6 gap-2">
              
                <a href={button.url}
                target={button.targetBlank ? "_blank" : undefined}
                rel={button.targetBlank ? "noopener noreferrer" : undefined}
              >
                {button.label} <ArrowRight size={16} />
              </a>
            </Button>
          ) : (
            <Button variant="hero" size="lg" className="mt-6 gap-2">
              {button.label} <ArrowRight size={16} />
            </Button>
          ))}
      </div>
    </section>
  );
};

export default SubscribeCtaSection;