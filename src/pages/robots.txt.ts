import type { APIRoute } from "astro";
import { isIndexable } from "../lib/indexing";

export const GET: APIRoute = ({ site }) => {
  const rule = isIndexable(site) ? "Allow: /" : "Disallow: /";
  const sitemap = new URL("/sitemap.xml", site).href;
  const body = `User-agent: *\n${rule}\n\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
