import { Play } from "lucide-react";

interface DemoVideoShowcaseSectionProps {
  video_title?: string;
  video_subtitle?: string;
  video_url?: string;
  duration_label?: string;
}

const DemoVideoShowcaseSection = ({ video_title, video_subtitle, video_url, duration_label }: DemoVideoShowcaseSectionProps) => {
  const caption = [duration_label, video_subtitle].filter(Boolean).join(" - ");

  const card = (
    <div
      className="relative rounded-2xl bg-background border border-border overflow-hidden shadow-card-hover group"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 45%, hsl(24 100% 50% / 0.06), transparent 75%)",
      }}
    >
      <div className="flex flex-col items-center justify-center gap-4 py-44">
        <span className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden transition-colors duration-700 ease-in-out group-hover:bg-primary/30 group-hover:border-primary/50">
          <Play size={32} className="text-primary ml-1" strokeWidth={2} />
        </span>
        {(video_title || caption) && (
          <div className="text-center">
            {video_title && <p className="font-semibold text-foreground">{video_title}</p>}
            {caption && <p className="text-sm text-muted-foreground mt-1">{caption}</p>}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {video_url ? (
            <a href={video_url} target="_blank" rel="noopener noreferrer" className="block">
              {card}
            </a>
          ) : (
            card
          )}
        </div>
      </div>
    </section>
  );
};

export default DemoVideoShowcaseSection;