/**
 * Cloudflare Pages Function: https://teretnjaci.ba/sitemap.xml
 * Built from the public API (categories + all published articles) and cached for an hour.
 */
const API = "https://api.teretnjaci.ba/api";
const SITE = "https://teretnjaci.ba";
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

const escapeXml = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const isoDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
};

async function getJson(path) {
  const res = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

async function buildSitemap() {
  const urls = [
    { loc: `${SITE}/`, changefreq: "hourly", priority: "1.0" },
    { loc: `${SITE}/politika-privatnosti`, changefreq: "yearly", priority: "0.2" },
    { loc: `${SITE}/uslovi-koristenja`, changefreq: "yearly", priority: "0.2" },
  ];

  const categories = await getJson("/categories").catch(() => ({ Data: [] }));
  for (const category of categories.Data || categories.data || []) {
    const slug = category.Slug || category.slug;
    if (slug) urls.push({ loc: `${SITE}/kategorija/${encodeURIComponent(slug)}`, changefreq: "daily", priority: "0.7" });
  }

  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = await getJson(`/articles?page=${page}&pageSize=${PAGE_SIZE}`);
    const articles = body.data || body.Data || [];
    for (const article of articles) {
      if (!article.Slug) continue;
      urls.push({
        loc: `${SITE}/clanak/${encodeURIComponent(article.Slug)}`,
        lastmod: isoDate(article.UpdatedAt) || isoDate(article.PublishedAt),
        changefreq: "weekly",
        priority: "0.8",
      });
    }
    const totalPages = body.pagination?.totalPages ?? 1;
    if (page >= totalPages || articles.length === 0) break;
  }

  const body = urls
    .map((u) =>
      [
        "  <url>",
        `    <loc>${escapeXml(u.loc)}</loc>`,
        u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : "",
        `    <changefreq>${u.changefreq}</changefreq>`,
        `    <priority>${u.priority}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export async function onRequest(context) {
  const cache = caches.default;
  const key = new Request(`${SITE}/__seo/sitemap.xml`);
  const cached = await cache.match(key);
  if (cached) return cached;
  let xml;
  try {
    xml = await buildSitemap();
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Retry-After": "600" } });
  }
  const response = new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
  context.waitUntil(cache.put(key, response.clone()));
  return response;
}
