import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const home = new URL("/", site).href;
  const lastModified = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${home}</loc>
    <lastmod>${lastModified}</lastmod>
  </url>
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
