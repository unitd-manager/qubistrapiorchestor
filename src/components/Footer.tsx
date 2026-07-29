import { useQuery } from "@tanstack/react-query";
import { getFooter } from "@/lib/strapi";
import qubiLogo from "@/assets/qubi-logo.png";

interface FooterBlockProps {
  copyright_text?: string;
}

const Footer = (props: FooterBlockProps = {}) => {
  const hasBlock = Boolean(props.copyright_text);
  const { data, isLoading } = useQuery({
    queryKey: ["footer"],
    queryFn: () => getFooter(),
    staleTime: 10 * 60 * 1000,
    enabled: !hasBlock,
  });
  const rawCopyright = props.copyright_text ?? data?.copyright_text ?? "";
  const copyright = rawCopyright.replace(/\{year\}/g, String(new Date().getFullYear()));

  if (!hasBlock && isLoading) return null;

  return (
    <footer className="py-10 bg-background border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-start gap-4">
          {/*<img
            src={qubiLogo}
            alt="Qubi Flow Orchestrator"
            className="h-8 w-auto object-contain flex-shrink-0"
          />*/}
          <p className="text-sm text-muted-foreground">{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;