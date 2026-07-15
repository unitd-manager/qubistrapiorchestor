import { useLocation } from "react-router-dom";
import { getRouteBootstrapData } from "@/lib/bootstrap";

const HomeSeoContentSection = () => {
  const { pathname } = useLocation();
  const contentHtml =
    getRouteBootstrapData(pathname)?.home?.seoContentHtml ??
    getRouteBootstrapData("/home")?.home?.seoContentHtml ??
    getRouteBootstrapData("/")?.home?.seoContentHtml ??
    "";

  if (!contentHtml) return null;

  return (
    <section aria-label="Detailed platform content" className="border-t border-border bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div
            className="blog-content text-base sm:text-lg text-foreground"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    </section>
  );
};

export default HomeSeoContentSection;
