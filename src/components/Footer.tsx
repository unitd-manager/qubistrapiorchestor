const STATIC_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Qubi", href: "#" },
];

const COMPANY_NAME = "qubi by Qbotica";

/**
 * Static footer. Previously fetched from a "sections" content-type that
 * doesn't exist in this Strapi project (getHomeSectionWithItems("footer",
 * "footer_link") was hitting a non-existent /api/sections endpoint, causing
 * a 404 on every page load). Using the static values directly removes that
 * dead API call. If footer links need to be editable later, they should be
 * added to Strapi as a Page entry (e.g. slug "footer") using the same
 * pageBuilder pattern as the rest of the site, rather than the old
 * sections/categories system.
 */
const Footer = () => {
  return (
    <footer className="py-10 bg-background border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            {STATIC_LINKS.map((link) => (
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