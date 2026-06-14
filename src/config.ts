/**
 * Configuración central del sitio.
 * Cambiar aquí el número de WhatsApp actualiza el sitio completo
 * (header, botón flotante, footer, CTAs y formulario inteligente).
 */

// Números oficiales de WhatsApp que reciben consultas y formularios.
// Formato internacional sin "+", sin espacios.
export const WHATSAPP_NUMBER = '56996326930';
export const WHATSAPP_NUMBER_2 = '56920085893';

export const CONTACT_EMAIL = 'reservaswin@gmail.com';

export const CONTACT_PHONE_DISPLAY = '+56 9 9632 6930';
export const CONTACT_PHONE_2_DISPLAY = '+56 9 2008 5893';

export const INSTAGRAM_HANDLE = '@wintransfer.chile';
export const INSTAGRAM_URL = 'https://www.instagram.com/wintransfer.chile';

// Aeropuerto que se prellena en las pestañas "Hacia/Desde aeropuerto" del
// formulario de reserva. Debe coincidir con una entrada de src/data/locations.ts
export const BOOKING_AIRPORT = 'Aeropuerto Carriel Sur (CCP)';

export const SITE_NAME = 'Win Transfer';
export const SITE_URL = 'https://wintransfer.cl';

export const waLink = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
