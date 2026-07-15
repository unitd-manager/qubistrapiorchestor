import { useQuery } from "@tanstack/react-query";
import { getHomeSectionWithItems } from "@/lib/strapi";

const STATIC_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Qubi", href: "#" },
];

const Footer = () => {
  const { data } = useQuery({
    queryKey: ["home-section-items", "footer", "footer_link"],
    queryFn: () => getHomeSectionWithItems("footer", "footer_link"),
    staleTime: 10 * 60 * 1000,
  });

  const companyName = data?.section?.attributes?.section_title ?? "qubi by Qbotica";

  const links =
    data?.items && data.items.length > 0
      ? data.items.map((item) => ({
          label: item.attributes.category_title,
          href: item.attributes.external_link ?? item.attributes.internal_link ?? "#",
        }))
      : STATIC_LINKS;

  return (
    <footer className="py-10 bg-background border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
