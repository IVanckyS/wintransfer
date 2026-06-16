import type { APIRoute } from 'astro';

// robots.txt dinámico: usa `site` (astro.config.mjs) para que la URL del
// sitemap apunte siempre al dominio real del deploy (vercel.app o wintransfer.cl)
// sin tener que tocar nada al comprar el dominio.
const body = (sitemap: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemap.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site);
  return new Response(body(sitemap), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
