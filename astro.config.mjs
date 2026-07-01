// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// URL canónica del sitio: SIEMPRE el dominio final, aunque el deploy corra en
// *.vercel.app. Así canonical/hreflang/og:image no dependen del entorno.
const site = 'https://wintransfer.cl';

export default defineConfig({
  site,
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'pt'],
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
        locales: { es: 'es-CL', en: 'en-US', pt: 'pt-BR' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
