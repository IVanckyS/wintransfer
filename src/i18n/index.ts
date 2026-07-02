import es from './es.json';
import en from './en.json';
import pt from './pt.json';

export const languages = {
  es: 'ES',
  en: 'EN',
  pt: 'PT',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'es';

const translations = { es, en, pt } as const;

/**
 * Metadatos por idioma para el selector: nombre escrito en su propio idioma
 * y locale para SEO (hreflang / og:locale). El orden de las claves define el
 * orden en el desplegable.
 */
export const languageMeta: Record<Lang, { native: string; locale: string }> = {
  es: { native: 'Español', locale: 'es-CL' },
  en: { native: 'English', locale: 'en-US' },
  pt: { native: 'Português', locale: 'pt-BR' },
};

/** Slugs de página (compartidos entre idiomas). */
export const routes = {
  home: '',
  about: 'quienes-somos',
  services: 'servicios',
  fares: 'tarifas',
  agreement: 'convenio',
  coverage: 'cobertura',
  contact: 'contacto',
  confirmation: 'confirmacion',
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
