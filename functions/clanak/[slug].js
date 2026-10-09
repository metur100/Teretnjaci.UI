/**
 * Cloudflare Pages Function for /clanak/:slug.
 *
 * The site is a single-page app, so article titles, descriptions and images are normally only set by
 * JavaScript. Link previews (Facebook, WhatsApp, Viber, Telegram, LinkedIn, …) and some crawlers do
 * not run JavaScript, so for them we inject the article's metadata and NewsArticle structured data
 * into the HTML. Regular visitors get the unchanged app (no extra API call, no extra view count).
 */
const API = "https://api.teretnjaci.ba/api";
const SITE = "https://teretnjaci.ba";
const FALLBACK_IMAGE = `${SITE}/og-image.jpg`;
const BOTS =
  /(bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|whatsapp|viber|telegram|slack|discord|linkedin|pinterest|embedly|skype|vkshare|quora|redditbot|applebot|google|bing|yandex|duckduck|baidu|petal|ahrefs|semrush)/i;

function summarize(html, max = 160) {
  const text = String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${space > 80 ? cut.slice(0, space) : cut}…`;
}

function absolute(url) {
  if (!url) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://api.teretnjaci.ba${url.startsWith("/") ? "" : "/"}${url}`;
}

async function loadArticle(slug, context) {
  const cache = caches.default;
  const key = new Request(`${SITE}/__seo/article/${encodeURIComponent(slug)}`);
  const cached = await cache.match(key);
  if (cached) return cached.json();
  const res = await fetch(`${API}/articles/slug/${encodeURIComponent(slug)}`, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const body = await res.json();
  const data = body.Data || body.data;
  if (!data) return null;
  // Cache for 10 minutes so crawlers do not hit the API (or the view counter) on every request.
  context.waitUntil(cache.put(key, new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Cache-Control": "max-age=600" } })));
  return data;
}

const setContent = (value) => ({
  element(el) {
    el.setAttribute("content", value);
  },
});

export async function onRequest(context) {
  const response = await context.next();
  const userAgent = context.request.headers.get("user-agent") || "";
  if (!BOTS.test(userAgent) || !(response.headers.get("content-type") || "").includes("text/html")) return response;

  let article = null;
  try {
    article = await loadArticle(context.params.slug, context);
  } catch {
    return response;
  }
  if (!article) return response;

  const title = article.Title || "Teretnjaci.ba";
  const fullTitle = `${title} | Teretnjaci.ba`;
  const description = summarize(article.Content) || "Teretnjaci.ba – vijesti, saobraćaj i pomoć za vozače kamiona.";
  const images = article.Images || [];
  const image = absolute((images.find((i) => i.IsPrimary) || images[0] || {}).Url);
  const url = `${SITE}/clanak/${encodeURIComponent(article.Slug || context.params.slug)}`;
  const published = article.PublishedAt ? new Date(article.PublishedAt).toISOString() : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    image: [image],
    datePublished: published || undefined,
    author: article.AuthorName ? { "@type": "Person", name: article.AuthorName } : { "@type": "Organization", name: "Teretnjaci.ba" },
    publisher: { "@id": `${SITE}/#organization` },
    mainEntityOfPage: url,
    articleSection: article.CategoryName || undefined,
    inLanguage: "bs",
  };
  const extraHead = [
    `<meta property="article:published_time" content="${published || ""}" />`,
    article.CategoryName ? `<meta property="article:section" content="${String(article.CategoryName).replace(/"/g, "&quot;")}" />` : "",
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`,
  ].join("");

  return new HTMLRewriter()
    .on("title", { element: (el) => el.setInnerContent(fullTitle) })
    .on('meta[name="description"]', setContent(description))
    .on('link[rel="canonical"]', { element: (el) => el.setAttribute("href", url) })
    .on('meta[property="og:type"]', setContent("article"))
    .on('meta[property="og:url"]', setContent(url))
    .on('meta[property="og:title"]', setContent(title))
    .on('meta[property="og:description"]', setContent(description))
    .on('meta[property="og:image"]', setContent(image))
    .on('meta[name="twitter:title"]', setContent(title))
    .on('meta[name="twitter:description"]', setContent(description))
    .on('meta[name="twitter:image"]', setContent(image))
    .on("head", { element: (el) => el.append(extraHead, { html: true }) })
    .transform(response);
}
