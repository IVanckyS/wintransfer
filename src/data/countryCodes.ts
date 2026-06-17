/**
 * Prefijos telefónicos para el selector de teléfono del formulario.
 * Lista curada con los códigos más usados por los clientes de Win Transfer:
 * Chile (por defecto) + países de Latinoamérica + destinos frecuentes.
 *
 * - `dial`    prefijo internacional con "+".
 * - `flag`    emoji de bandera (en Windows de escritorio se ve como el código
 *             de país, p. ej. "CL"; en móvil sí muestra la bandera).
 * - `example` formato local de ejemplo (sin prefijo) para el placeholder.
 * - `len`     cantidad exacta de dígitos locales (solo si el país tiene número fijo).
 * - `startsWith` dígito con el que debe empezar el número local (móvil).
 *
 * Si falta `len`, se valida un rango genérico de 8 a 15 dígitos.
 */

export interface Country {
  code: string;
  dial: string;
  flag: string;
  nameEs: string;
  nameEn: string;
  namePt: string;
  example: string;
  len?: number;
  startsWith?: string;
}

export const COUNTRY_CODES: Country[] = [
  { code: 'CL', dial: '+56', flag: '🇨🇱', nameEs: 'Chile', nameEn: 'Chile', namePt: 'Chile', example: '9 1234 5678', len: 9, startsWith: '9' },
  { code: 'AR', dial: '+54', flag: '🇦🇷', nameEs: 'Argentina', nameEn: 'Argentina', namePt: 'Argentina', example: '11 1234 5678' },
  { code: 'PE', dial: '+51', flag: '🇵🇪', nameEs: 'Perú', nameEn: 'Peru', namePt: 'Peru', example: '912 345 678' },
  { code: 'BO', dial: '+591', flag: '🇧🇴', nameEs: 'Bolivia', nameEn: 'Bolivia', namePt: 'Bolívia', example: '7123 4567' },
  { code: 'BR', dial: '+55', flag: '🇧🇷', nameEs: 'Brasil', nameEn: 'Brazil', namePt: 'Brasil', example: '11 91234 5678' },
  { code: 'CO', dial: '+57', flag: '🇨🇴', nameEs: 'Colombia', nameEn: 'Colombia', namePt: 'Colômbia', example: '300 1234567' },
  { code: 'UY', dial: '+598', flag: '🇺🇾', nameEs: 'Uruguay', nameEn: 'Uruguay', namePt: 'Uruguai', example: '91 234 567' },
  { code: 'PY', dial: '+595', flag: '🇵🇾', nameEs: 'Paraguay', nameEn: 'Paraguay', namePt: 'Paraguai', example: '961 234567' },
  { code: 'EC', dial: '+593', flag: '🇪🇨', nameEs: 'Ecuador', nameEn: 'Ecuador', namePt: 'Equador', example: '99 123 4567' },
  { code: 'VE', dial: '+58', flag: '🇻🇪', nameEs: 'Venezuela', nameEn: 'Venezuela', namePt: 'Venezuela', example: '412 1234567' },
  { code: 'MX', dial: '+52', flag: '🇲🇽', nameEs: 'México', nameEn: 'Mexico', namePt: 'México', example: '55 1234 5678' },
  { code: 'US', dial: '+1', flag: '🇺🇸', nameEs: 'Estados Unidos', nameEn: 'United States', namePt: 'Estados Unidos', example: '201 555 0123' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', nameEs: 'España', nameEn: 'Spain', namePt: 'Espanha', example: '612 34 56 78' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', nameEs: 'Alemania', nameEn: 'Germany', namePt: 'Alemanha', example: '1512 3456789' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', nameEs: 'Francia', nameEn: 'France', namePt: 'França', example: '6 12 34 56 78' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', nameEs: 'Reino Unido', nameEn: 'United Kingdom', namePt: 'Reino Unido', example: '7400 123456' },
  { code: 'IT', dial: '+39', flag: '🇮🇹', nameEs: 'Italia', nameEn: 'Italy', namePt: 'Itália', example: '312 345 6789' },
  { code: 'CN', dial: '+86', flag: '🇨🇳', nameEs: 'China', nameEn: 'China', namePt: 'China', example: '131 2345 6789' },
];
