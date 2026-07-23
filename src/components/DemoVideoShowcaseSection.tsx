import { Play } from "lucide-react";
import { mediaUrl, type StrapiMediaAsset } from "@/lib/strapi";

interface DemoVideoShowcaseSectionProps {
  video_title?: string;
  video_subtitle?: string;
  video_url?: string;
  thumbnail?: StrapiMediaAsset | null;
  duration_label?: string;
}

const DemoVideoShowcaseSection = ({ video_title, video_subtitle, video_url, thumbnail, duration_label }: DemoVideoShowcaseSectionProps) => {
  // mediaUrl() is required here — raw Strapi paths without the STRAPI_URL
  // prefix will 404 silently, same issue as the Lightwarp image bug
  const thumbSrc = thumbnail?.url ? mediaUrl(thumbnail.url) : undefined;

  const caption = [duration_label, video_subtitle].filter(Boolean).join(" - ");

  const card = (
    <div
      className="relative rounded-2xl bg-surface-elevated border border-border overflow-hidden shadow-card-hover"
      style={
        thumbSrc
          ? { backgroundImage: `url(${thumbSrc})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      <div className="flex flex-col items-center justify-center gap-4 py-24 bg-background/40">
        <span className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Play size={22} className="fill-primary text-primary ml-1" />
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