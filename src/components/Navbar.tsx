import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import qubiLogo from "@/assets/qubi-logo.png";
import { Menu, X, ChevronDown } from "lucide-react";
import { getHeaderData, mediaUrl, type HeaderNavLink, type HeaderNavChild, type HeaderData } from "@/lib/strapi";

/** Fallback shown only if /api/header can't be reached or hasn't been published yet. */
const FALLBACK_MENU: HeaderNavLink[] = [
  { label: "Home", url: "/" },
  { label: "Customers", url: "/customers" },
  { label: "Pricing", url: "/pricing" },
  {
    label: "Resources",
    children: [
      { label: "Blog", url: "/resources/blog" },
      { label: "Product Demo", url: "/resources/demo" },
      { label: "FAQs", url: "/resources/faqs" },
    ],
  },
  {
    label: "Solutions",
    children: [
      { label: "Use Cases", url: "/solutions/use-cases" },
      { label: "Industries", url: "/solutions/industries" },
    ],
  },
];

const FALLBACK_CTA = { cta_label: "Book a Demo", cta_url: "https://meetings.hubspot.com/maheshv" };

const isPathActive = (pathname: string, url: string) => {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(`${url}/`);
};

/** Desktop dropdown for links that have children. */
const DropdownMenu = ({ label, items }: { label: string; items: HeaderNavChild[] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const visibleItems = items.filter((item) => item.publish !== false);
  const isActive = visibleItems.some((item) => isPathActive(pathname, item.url));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (visibleItems.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        className={`flex items-center gap-1 text-[18px] font-semibold tracking-[-0.2px] transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
        }`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${label} menu`}
        type="button"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-44 bg-background border border-border rounded-xl shadow-lg py-1 z-50">
          {visibleItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={`block px-4 py-2.5 text-sm transition-colors hover:bg-surface-elevated ${
                isPathActive(pathname, item.url) ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [navLinks, setNavLinks] = useState<HeaderNavLink[]>([]);
  const [cta, setCta] = useState(FALLBACK_CTA);
  const [logoSrc, setLogoSrc] = useState<string>(qubiLogo);
  const [logoAlt, setLogoAlt] = useState<string>("Qubi Flow Orchestrator");
  const [logoLink, setLogoLink] = useState<string>("/");
  const [open, setOpen] = useState(false);
  const [mobileOpenSections, setMobileOpenSections] = useState<Set<number>>(new Set());
  const { pathname } = useLocation();

  useEffect(() => {
    let cancelled = false;

    const fetchHeader = async () => {
      try {
        const header: HeaderData = await getHeaderData();
        if (cancelled) return;

        const links = (header.nav_links ?? []).filter((l) => l.publish !== false);
        setNavLinks(links.length ? links : FALLBACK_MENU);

        setCta({
          cta_label: header.cta_label || FALLBACK_CTA.cta_label,
          cta_url: header.cta_url || FALLBACK_CTA.cta_url,
        });

        if (header.logo?.url) {
          setLogoSrc(mediaUrl(header.logo.url));
          setLogoAlt(header.logo.alternativeText || "Logo");
        }
        setLogoLink(header.logo_link || "/");
      } catch (error) {
        console.error("Failed to fetch header data from /api/header:", error);
        if (!cancelled) setNavLinks(FALLBACK_MENU);
      }
    };

    fetchHeader();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggleMobileSection = (index: number) => {
    setMobileOpenSections((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) updated.delete(index);
      else updated.add(index);
      return updated;
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/90 backdrop-blur-xl border-b border-border">
      {/* ── Fixed header row ── */}
      <div className="container mx-auto h-[76px] flex items-center px-4 lg:px-8">

        {/* ── Mobile row: hamburger | logo | spacer ── */}
        <div className="md:hidden relative flex items-center justify-between w-full">
          <button
            aria-label="Toggle menu"
            className="h-9 w-9 inline-flex items-center justify-center flex-shrink-0 text-primary"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>

          <Link to={logoLink} className="absolute left-1/2 -translate-x-1/2" aria-label="Home">
            <img src={logoSrc} alt={logoAlt} width="120" height="100" className="h-12 w-auto object-contain" draggable={false} />
          </Link>

          <div className="w-9 h-9 flex-shrink-0" />
        </div>

        {/* ── Desktop row: logo | links | CTA ── */}
        <nav className="hidden md:flex w-full items-center justify-between relative">
          <Link to={logoLink} className="z-10 flex-shrink-0" aria-label="Home">
            <img src={logoSrc} alt={logoAlt} width="120" height="100" className="h-14 lg:h-16 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const visibleChildren = (link.children ?? []).filter((c) => c.publish !== false);
              if (visibleChildren.length === 0) {
                if (!link.url) return null;
                const active = isPathActive(pathname, link.url);
                return (
                  <Link
                    key={link.label}
                    to={link.url}
                    className={`text-[18px] font-semibold tracking-[-0.2px] transition-colors ${
                      active ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              }
              return <DropdownMenu key={link.label} label={link.label} items={visibleChildren} />;
            })}
          </div>

          <Button asChild variant="hero" size="lg">
            <a href={cta.cta_url} target="_blank" rel="noopener noreferrer">
              {cta.cta_label}
            </a>
          </Button>
        </nav>
      </div>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden w-full bg-background border-t border-border"
          >
            <ul className="flex flex-col items-center py-4 gap-1" id="mobile-navigation">
              {navLinks.map((link, index) => {
                const visibleChildren = (link.children ?? []).filter((c) => c.publish !== false);
                if (visibleChildren.length === 0) {
                  if (!link.url) return null;
                  const active = isPathActive(pathname, link.url);
                  return (
                    <li key={link.label} className="w-full text-center">
                      <Link
                        to={link.url}
                        className={`block py-3 text-lg font-semibold transition-colors ${
                          active ? "text-primary" : "text-muted-foreground hover:text-primary"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                }
                const sectionActive = visibleChildren.some((c) => isPathActive(pathname, c.url));
                return (
                  <li key={link.label} className="w-full text-center">
                    <button
                      className={`flex items-center justify-center gap-1 w-full py-3 text-lg font-semibold transition-colors ${
                        sectionActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                      }`}
                      onClick={() => toggleMobileSection(index)}
                      aria-expanded={mobileOpenSections.has(index)}
                      aria-label={`${link.label} menu`}
                      type="button"
                    >
                      {link.label}
                      <ChevronDown size={16} className={`transition-transform duration-200 ${mobileOpenSections.has(index) ? "rotate-180" : ""}`} />
                    </button>
                    {mobileOpenSections.has(index) && (
                      <div className="pb-1">
                        {visibleChildren.map((child) => (
                          <Link
                            key={child.url}
                            to={child.url}
                            className={`block py-2 text-base transition-colors ${
                              isPathActive(pathname, child.url) ? "text-primary" : "text-muted-foreground hover:text-primary"
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="px-6 pb-6">
              <Button asChild variant="hero" size="lg" className="w-full">
                <a href={cta.cta_url} target="_blank" rel="noopener noreferrer" className="block w-full text-center">
                  {cta.cta_label}
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;