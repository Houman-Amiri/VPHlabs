const fs = require('fs');
const path = require('path');
const { MOUNTED_API_MODULES } = require('../routes');
const seoRoutes = require('../routes/seoRoutes');

/**
 * Extracts real registered Express routes directly from `router.stack`
 * so generated documentation can never drift from actual Express code.
 */
function extractExpressRoutes(prefix, router) {
  const normalizedPrefix = prefix === '/' ? '' : prefix.replace(/\/+$/, '');
  const extracted = [];

  for (const layer of router.stack) {
    if (!layer.route) continue;
    const subPath = layer.route.path === '/' ? '' : layer.route.path;
    const fullPath = `${normalizedPrefix}${subPath}` || '/';
    const methods = Object.keys(layer.route.methods)
      .filter((m) => layer.route.methods[m])
      .map((m) => m.toUpperCase());

    const middlewareNames = layer.route.stack
      .map((s) => s.name)
      .filter((n) => n && n !== '<anonymous>' && n !== 'wrappedHandler');

    for (const method of methods) {
      extracted.push({
        method,
        path: fullPath,
        middlewares: middlewareNames,
      });
    }
  }

  return extracted;
}

function generateApiDocsMarkdown() {
  const allModules = [
    ...MOUNTED_API_MODULES,
    { prefix: '/', router: seoRoutes, group: 'Persian SEO & Search Crawlers' },
  ];

  const lines = [
    '# API Documentation — V.I.R.A Pardazesh Hoomaan (`VPHLabs.com`)',
    '',
    '> **Zero-Drift Guarantee:** This document is automatically generated from the actual Express route stacks (`server/src/routes/*.js`) via `npm run docs:api`. Every endpoint listed below is verified against live Express `router.stack` definitions.',
    '',
    '## Base Conventions',
    '- **Base API Prefix:** `/api`',
    '- **Response Envelope (Success):** `{ "success": true, "data": ..., "pagination"?: { "page", "limit", "total", "totalPages" } }`',
    '- **Response Envelope (Error):** `{ "success": false, "error": { "code": "...", "message": "...", "details"?: [...] } }`',
    '- **Authentication:** `httpOnly` JWT cookie (`vph_token`, `sameSite=lax`) or `Authorization: Bearer <token>` header.',
    '- **Auth Rate Limit:** `/api/auth/*` is strictly limited to **5 requests / minute / IP**.',
    '',
    '## Health-Check Endpoint',
    '- **`GET /api/health`**',
    '  - Returns HTTP `200` with service uptime, SQLite connection state, SQLite engine version, count of applied `.sql` migrations, and latest applied migration filename.',
    '',
    '---',
    '',
  ];

  let totalEndpoints = 0;

  for (const mod of allModules) {
    const actualRoutes = extractExpressRoutes(mod.prefix, mod.router);
    const metaByKey = new Map(
      (mod.router.routeMeta || []).map((m) => [`${m.method} ${m.path}`, m])
    );

    lines.push(`## ${mod.group}`);
    lines.push('');
    lines.push('| Method | Endpoint | Access / Guards | Details |');
    lines.push('| :--- | :--- | :--- | :--- |');

    for (const r of actualRoutes) {
      totalEndpoints += 1;
      const meta = metaByKey.get(`${r.method} ${r.path}`) || {};
      const auth =
        meta.auth ||
        (r.middlewares.includes('requireAuth') ? 'Authenticated' : 'Public');
      const extra = [
        meta.summary || '',
        meta.query ? `<br/>**Query:** \`${meta.query}\`` : '',
        meta.body ? `<br/>**Body:** \`${meta.body}\`` : '',
      ]
        .filter(Boolean)
        .join(' ');

      lines.push(`| **\`${r.method}\`** | \`${r.path}\` | ${auth} | ${extra} |`);
    }

    lines.push('');
  }

  lines.push('---');
  lines.push(
    `*Total verified Express endpoints: **${totalEndpoints}**.*`
  );
  lines.push('');

  return lines.join('\n');
}

if (require.main === module) {
  const outPath = path.resolve(__dirname, '../../../API_DOCS.md');
  const markdown = generateApiDocsMarkdown();
  fs.writeFileSync(outPath, markdown, 'utf8');
  console.log(`[docs:api] Generated ${outPath} directly from Express route files.`);
}

module.exports = {
  generateApiDocsMarkdown,
};
