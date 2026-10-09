import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://teretnjaci.ba";
export const SITE_NAME = "Teretnjaci.ba";
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
export const DEFAULT_DESCRIPTION =
  "Teretnjaci.ba – vijesti, stanje na putevima, granični prelazi i pomoć za vozače kamiona i prevoznike u BiH i regiji.";

/** Plain-text summary of HTML content for meta descriptions (max ~160 characters). */
export function summarize(html, max = 160) {
  const text = String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

/**
 * Page metadata: title, description, canonical URL, Open Graph and Twitter tags, optional JSON-LD.
 * Crawlers that do not run JavaScript get article tags from the Cloudflare function in /functions.
 */
export default function Seo({ title, description = DEFAULT_DESCRIPTION, path = "/", image = DEFAULT_IMAGE, type = "website", noindex = false, jsonLd, children }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Vijesti, saobraćaj i pomoć za vozače kamiona`;
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title || fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
      {children}
    </Helmet>
  );
}
