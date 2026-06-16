import { siteConfig } from "./seo.config";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  images?: { loc: string; caption?: string; title?: string }[];
}

const staticPages: SitemapUrl[] = [
  { loc: "", priority: 1.0, changefreq: "daily" },
  { loc: "/products", priority: 0.9, changefreq: "daily" },
  { loc: "/about", priority: 0.7, changefreq: "monthly" },
  { loc: "/contact", priority: 0.7, changefreq: "monthly" },
  { loc: "/cart", priority: 0.4, changefreq: "weekly" },
  { loc: "/login", priority: 0.3, changefreq: "monthly" },
  { loc: "/signup", priority: 0.3, changefreq: "monthly" },
];

const adminPages: SitemapUrl[] = [
  { loc: "/admin/login", priority: 0.1, changefreq: "monthly" },
];

/**
 * Generate a complete sitemap XML string.
 * @param dynamicUrls Additional URLs to include (e.g., product pages fetched from DB)
 * @returns XML sitemap string
 */
export function generateSitemap(dynamicUrls: SitemapUrl[] = []): string {
  const today = new Date().toISOString().split("T")[0];
  const allUrls = [...staticPages, ...adminPages, ...dynamicUrls];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`;
  xml += ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const page of allUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${siteConfig.url}${page.loc}</loc>\n`;
    xml += `    <lastmod>${page.lastmod || today}</lastmod>\n`;
    if (page.changefreq) {
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    }
    if (page.priority !== undefined) {
      xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
    }
    if (page.images && page.images.length > 0) {
      for (const img of page.images) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${img.loc}</image:loc>\n`;
        if (img.caption) xml += `      <image:caption><![CDATA[${img.caption}]]></image:caption>\n`;
        if (img.title) xml += `      <image:title><![CDATA[${img.title}]]></image:title>\n`;
        xml += `    </image:image>\n`;
      }
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Returns a sitemap index XML string.
 */
export function generateSitemapIndex(sitemaps: string[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const today = new Date().toISOString();
  for (const sitemap of sitemaps) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${sitemap}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += `</sitemapindex>`;
  return xml;
}