const env = require('../config/env');
const productRepository = require('../repositories/productRepository');
const articleRepository = require('../repositories/articleRepository');
const { asyncHandler } = require('../middlewares/errorHandler');

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const seoController = {
  sitemapXml: asyncHandler(async (_req, res) => {
    const base = env.siteUrl;
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/products', priority: '0.9', changefreq: 'weekly' },
      { loc: '/services', priority: '0.8', changefreq: 'monthly' },
      { loc: '/articles', priority: '0.9', changefreq: 'daily' },
      { loc: '/about', priority: '0.7', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.8', changefreq: 'monthly' },
    ];

    const products = productRepository.findAllPublishedSlugs();
    const articles = articleRepository.findAllPublishedSlugs();

    const urls = [
      ...staticPages.map(
        (p) => `  <url>
    <loc>${escapeXml(base + p.loc)}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
      ),
      ...products.map(
        (prod) => `  <url>
    <loc>${escapeXml(`${base}/products/${prod.slug}`)}</loc>
    <lastmod>${new Date(prod.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`
      ),
      ...articles.map(
        (art) => `  <url>
    <loc>${escapeXml(`${base}/articles/${art.slug}`)}</loc>
    <lastmod>${new Date(art.updated_at || art.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xml);
  }),

  robotsTxt: asyncHandler(async (_req, res) => {
    const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/auth

Sitemap: ${env.siteUrl}/sitemap.xml
`;
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(txt);
  }),
};

module.exports = seoController;
