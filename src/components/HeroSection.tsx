import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHeroImageSrcSet, getRouteBootstrapData, type BootstrapHeroImage } from "@/lib/bootstrap";
import { getHomeSection, mediaUrl, stripHtml, type StrapiMediaAsset } from "@/lib/strapi";

const DEFAULT_HERO_ALT =
  "qubi platform orchestration diagram showing AI agents, workflows, integrations, and analytics";
const HERO_IMAGE_SIZES = "(min-width: 1024px) 50vw, (min-width: 640px) 90vw, 100vw";

const getOptimizedHeroImage = (image?: StrapiMediaAsset | null): BootstrapHeroImage | undefined => {
  if (!image?.url) {
    return undefined;
  }

  const variants = Object.values(image.formats ?? {})
    .filter((format): format is NonNullable<typeof format> => Boolean(format?.url && format?.width))
    .map((format) => ({
      src: mediaUrl(format.url),
      width: format.width as number,
    }))
    .sort((a, b) => a.width - b.width);

  const originalWidth = image.width ?? variants[variants.length - 1]?.width ?? 1024;
  const originalSource = {
    src: mediaUrl(image.url),
    width: originalWidth,
  };
  const sources = [...variants, originalSource].filter(
    (source, index, allSources) => allSources.findIndex((candidate) => candidate.width === source.width) === index,
  );
  const preferredSource =
    sources.find((source) => source.width >= 1000) ??
    sources.find((source) => source.width >= 750) ??
    sources[sources.length - 1];

  return {
    src: preferredSource?.src ?? originalSource.src,
    alt: image.alternativeText || DEFAULT_HERO_ALT,
    width: image.width ?? 1024,
    height: image.height ?? 576,
    sizes: HERO_IMAGE_SIZES,
    sources,
  };
};

interface HeroBlockProps {
  badge_text?: string;
  main_title?: string;
  description?: string;
  button?: { label?: string; url?: string } | null;
  hero_image?: StrapiMediaAsset | null;
}

const HeroSection = (props: HeroBlockProps = {}) => {
  const hasBlock = Boolean(props.main_title);
  const bootstrappedHero = getRouteBootstrapData("/")?.home?.hero;
  const { data: section } = useQuery({
    queryKey: ["home-section", "hero"],
    queryFn: () => getHomeSection("hero"),
    enabled: !hasBlock && !bootstrappedHero,
    staleTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });

  const a = section?.attributes;
  const blockHeroImage = getOptimizedHeroImage(props.hero_image);
  const liveHeroImage = getOptimizedHeroImage(a?.images?.[0]);
  const heroImage = blockHeroImage ?? bootstrappedHero?.image ?? liveHeroImage;
  const badge = props.badge_text ?? bootstrappedHero?.badge ?? a?.template ?? "Agentic Automation Platform";
  const heading = props.main_title ?? bootstrappedHero?.heading ?? a?.section_title ?? "Design and orchestrate enterprise workflows with qubi";
  const liveSubheading =
    stripHtml(a?.description) || "Connect AI agents, business systems, and human approvals in one enterprise orchestration layer.";
  const subheading =
    stripHtml(props.description) || bootstrappedHero?.subheading || liveSubheading;
  const ctaLabel = props.button?.label ?? bootstrappedHero?.ctaLabel ?? a?.display_type ?? "Book a Demo";
  const ctaUrl = props.button?.url ?? bootstrappedHero?.ctaUrl ?? a?.external_link ?? "https://meetings.hubspot.com/maheshv";
  const imageSrcSet = getHeroImageSrcSet(heroImage);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      {/* Subtle orange glow */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="max-w-2xl">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {badge}
              </span>
            </div>

            <h1 className="animate-fade-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
              {heading.includes("qubi") ? (
                <>
                  {heading.split("qubi")[0]}
                  <span className="text-gradient">qubi</span>
                  {heading.split("qubi")[1]}
                </>
              ) : (
                heading
              )}
            </h1>

            <p className="animate-fade-up-delay-2 mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              {subheading}
            </p>

            <div className="animate-fade-up-delay-3 flex flex-wrap gap-4 mt-10">
              <Button asChild variant="hero" size="lg" className="gap-2 px-8 h-12">
                <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                  {ctaLabel} <ArrowRight size={18} />
                </a>
              </Button>
            </div>
          </div>

          {/* Right illustration */}
          <div className="animate-fade-up-delay-2 relative">
            {heroImage?.src && (
              <div className="relative rounded-2xl overflow-hidden shadow-card-hover">
                <img
  src={heroImage.src}
  srcSet={imageSrcSet}
  sizes={heroImage.sizes}
  alt={heroImage.alt}
  width={heroImage.width}
  height={heroImage.height}
  className="w-full h-auto rounded-2xl"
  loading="eager"
  decoding="async"
  {...{ fetchpriority: "high" }}
/>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
