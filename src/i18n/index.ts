import es from './es.json';
import en from './en.json';

/**
 * Para agregar portugués (fase 2):
 * 1. Crear src/i18n/pt.json (misma estructura de claves).
 * 2. Importarlo aquí y agregarlo a `translations` y `languages`.
 * 3. Agregar 'pt' a `locales` en astro.config.mjs.
 */
export const languages = {
  es: 'ES',
  en: 'EN',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'es';

const translations = { es, en } as const;

/** Slugs de página (compartidos entre idiomas). */
export const routes = {
  home: '',
  about: 'quienes-somos',
  services: 'servicios',
  agreement: 'convenio',
  fleet: 'flota',
  contact: 'contacto',
  terms: 'terminos',
} as const;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in translations) return lang as Lang;
  return defaultLang;
}

/**
 * Devuelve un traductor por clave anidada: t('home.heroSub'),
 * t('regions') (arrays y objetos se devuelven tal cual).
 */
export function useTranslations(lang: Lang) {
  return function t<T = string>(key: string): T {
    const value = key
      .split('.')
      .reduce<unknown>(
        (obj, part) =>
          obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[part] : undefined,
        translations[lang],
      );
    if (value === undefined) {
      throw new Error(`Clave i18n no encontrada: "${key}" (${lang})`);
    }
    return value as T;
  };
}

/** Construye la URL de una página en un idioma dado. */
export function localePath(lang: Lang, route: keyof typeof routes): string {
  const slug = routes[route];
  return slug ? `/${lang}/${slug}/` : `/${lang}/`;
}

/** Misma página en otro idioma (para el selector ES/EN). */
export function switchLangPath(url: URL, target: Lang): string {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] && parts[0] in translations) parts.shift();
  return `/${[target, ...parts].join('/')}/`.replace(/\/+$/, '/');
}
