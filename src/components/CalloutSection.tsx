import { DynamicIcon } from "@/components/DynamicIcon";
import { stripHtml } from "@/lib/strapi";

interface CalloutSectionProps {
  icon?: string;
  main_title?: string;
  description?: string;
}

/** Slim highlight band: icon, bold statement, supporting text. */
const CalloutSection = ({ icon, main_title, description }: CalloutSectionProps) => (
  <section className="py-10 bg-surface-elevated border-y border-border">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        {icon && (
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary flex-shrink-0">
            <DynamicIcon name={icon} size={28} />
          </div>
        )}
        <div>
          <p className="text-xl sm:text-2xl font-semibold text-foreground">{main_title}</p>
          {description && <p className="text-muted-foreground mt-2">{stripHtml(description)}</p>}
        </div>
      </div>
    </div>
  </section>
);

export default CalloutSection;
