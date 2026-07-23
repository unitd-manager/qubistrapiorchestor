import { useQuery } from "@tanstack/react-query";
import { getFooter } from "@/lib/strapi";

const FALLBACK = {
  copyright_text: "© {year} qubi by Qbotica. All rights reserved.",
  links: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact Qubi", href: "#" },
  ],
};

const Footer = () => {
  const { data } = useQuery({
    queryKey: ["footer"],
    queryFn: () => getFooter(),
    staleTime: 10 * 60 * 1000,
  });

  // Everything comes from the admin. "{year}" is the only convenience token —
  // it lets the client keep an auto-updating year without hardcoding anything.
  const rawCopyright = data?.copyright_text || FALLBACK.copyright_text;
  const copyright = rawCopyright.replace(/\{year\}/g, String(new Date().getFullYear()));
  const links = data?.links && data.links.length > 0 ? data.links : FALLBACK.links;

  return (
    <footer className="py-10 bg-background border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">{copyright}</p>
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
