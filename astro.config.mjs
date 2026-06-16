// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// URL canónica del sitio. En Vercel usamos automáticamente el dominio de
// producción (mientras no se compre wintransfer.cl será wintransfer-black.vercel.app;
// al asignar el dominio en Vercel pasará a wintransfer.cl sin tocar código).
// En local cae al dominio final. Así og:image / canonical siempre resuelven.
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://wintransfer.cl';

export default defineConfig({
  site,
  i18n: {
    // Para sumar portugués en fase 2: agregar 'pt' aquí y crear src/i18n/pt.json
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
  integrations: [
    // Genera /sitemap-index.xml + /sitemap-0.xml en cada build.
    // Detecta la config i18n y añade enlaces hreflang ES/EN por URL.
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-CL', en: 'en-US' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
