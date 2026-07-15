import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRouteBootstrapData } from "@/lib/bootstrap";
import { getHomeSection } from "@/lib/strapi";

interface DemoPreviewBlockProps {
  video_title?: string;
  video_duration?: string;
}

const DemoPreviewSection = (props: DemoPreviewBlockProps = {}) => {
  const hasBlock = Boolean(props.video_title);
  const bootstrappedDemo = getRouteBootstrapData("/")?.home?.demo;
  const { data: videoSection } = useQuery({
    queryKey: ["demo-video-section"],
    queryFn: () => getHomeSection("demo_video_section"),
    enabled: !hasBlock && !bootstrappedDemo,
    staleTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });

  const videoTitle = props.video_title ?? bootstrappedDemo?.videoTitle ?? videoSection?.attributes.section_title ?? "qubi Platform Full Demo";
  const videoDuration =
    props.video_duration ?? bootstrappedDemo?.videoDuration ?? videoSection?.attributes.description ?? "12 minutes End-to-end execution walkthrough";

  return (
    <section className="py-12 bg-surface-elevated border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl bg-background border border-border shadow-card-hover overflow-hidden aspect-video flex items-center justify-center group cursor-pointer hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-all duration-300">
                <Play size={32} className="text-primary ml-1" />
              </div>
              <p className="text-foreground font-semibold">{videoTitle}</p>
              <p className="text-muted-foreground text-sm mt-1">{videoDuration}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoPreviewSection;
