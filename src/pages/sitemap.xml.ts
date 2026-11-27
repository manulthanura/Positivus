import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const STATIC_PATHS = [
  '/',
  '/about',
  '/services',
  '/services/seo',
  '/pricing',
  '/articles',
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site, url }) => {
  const origin = (site ?? new URL(url.origin)).toString().replace(/\/+$/, '');
  const posts = await getCollection('blog');

  const staticUrls = STATIC_PATHS.map(
    (path) => `  <url>\n    <loc>${escapeXml(`${origin}${path}`)}</loc>\n  </url>`
  );

  const postUrls = posts
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => {
      const loc = escapeXml(`${origin}/articles/${post.slug}`);
      const lastmod = post.data.pubDate.toISOString().split('T')[0];
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticUrls,
    ...postUrls,
  ].join('\n')}\n</urlset>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
