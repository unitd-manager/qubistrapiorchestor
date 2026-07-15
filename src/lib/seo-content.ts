const ALLOWED_TAGS = new Set([
  "a",
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "ul",
  "ol",
  "li",
  "hr",
  "img",
  "code",
  "pre",
  "span",
  "div",
]);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeUrl = (value: string) => {
  const cleaned = value.trim();
  if (!cleaned || /^javascript:/i.test(cleaned)) return "";
  return cleaned;
};

const sanitizeTagAttributes = (tag: string, rawAttributes: string) => {
  const attrs = Array.from(rawAttributes.matchAll(/([a-zA-Z0-9:-]+)(?:\s*=\s*(".*?"|'.*?'|[^\s"'=<>`]+))?/g));
  const safeAttributes: string[] = [];

  for (const match of attrs) {
    const name = match[1]?.toLowerCase() ?? "";
    const rawValue = match[2] ?? "";
    const unquotedValue = rawValue.replace(/^['"]|['"]$/g, "");

    if (!name || name.startsWith("on") || name === "style") continue;

    if (tag === "a") {
      if (name !== "href" && name !== "target" && name !== "rel") continue;
      if (name === "href") {
        const safeHref = sanitizeUrl(unquotedValue);
        if (!safeHref) continue;
        safeAttributes.push(`href="${escapeHtml(safeHref)}"`);
        continue;
      }
      if (name === "target") {
        const safeTarget = unquotedValue === "_blank" ? "_blank" : "";
        if (!safeTarget) continue;
        safeAttributes.push(`target="${safeTarget}"`);
        continue;
      }
      if (name === "rel") {
        const safeRel = unquotedValue || "noopener noreferrer";
        safeAttributes.push(`rel="${escapeHtml(safeRel)}"`);
        continue;
      }
    } else if (tag === "img") {
      if (name !== "src" && name !== "alt" && name !== "title") continue;
      if (name === "src") {
        const safeSrc = sanitizeUrl(unquotedValue);
        if (!safeSrc) continue;
        safeAttributes.push(`src="${escapeHtml(safeSrc)}"`);
        continue;
      }
      safeAttributes.push(`${name}="${escapeHtml(unquotedValue)}"`);
    } else if (name === "class") {
      safeAttributes.push(`class="${escapeHtml(unquotedValue)}"`);
    }
  }

  if (tag === "a" && !safeAttributes.some((attr) => attr.startsWith("rel="))) {
    safeAttributes.push('rel="noopener noreferrer"');
  }

  return safeAttributes.length > 0 ? ` ${safeAttributes.join(" ")}` : "";
};

export const sanitizeSeoContentHtml = (html?: string | null) => {
  if (!html) return "";

  const withoutDangerousBlocks = html.replace(
    /<(script|style|iframe|object|embed|link|meta)([\s\S]*?)>([\s\S]*?)<\/\1>/gi,
    "",
  );

  return withoutDangerousBlocks.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (fullMatch, rawTagName, rawAttributes) => {
    const tag = String(rawTagName).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";

    const isClosingTag = fullMatch.startsWith("</");
    if (isClosingTag) {
      return `</${tag}>`;
    }

    if (fullMatch.endsWith("/>") || tag === "br" || tag === "hr") {
      return `<${tag}${sanitizeTagAttributes(tag, String(rawAttributes ?? ""))}>`;
    }

    return `<${tag}${sanitizeTagAttributes(tag, String(rawAttributes ?? ""))}>`;
  });
};

export const HOME_SEO_SOURCE_SECTION_ID = "qubi-home-seo-source";

export const buildHomeSeoContentMarkup = (contentHtml: string) =>
  `<section id="${HOME_SEO_SOURCE_SECTION_ID}" data-static-home-seo-content="true" class="border-t border-border bg-background">
  <div class="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
    <div class="mx-auto max-w-4xl">
      <div class="blog-content text-base sm:text-lg text-foreground">${contentHtml}</div>
    </div>
  </div>
</section>`;
