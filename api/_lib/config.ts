/** Config de las funciones serverless. Los defaults permiten operar sin envs opcionales. */
export const TO_EMAIL = process.env.RESERVAS_EMAIL ?? 'reservaswin@gmail.com';
export const FROM_EMAIL = process.env.RESEND_FROM ?? 'Win Transfer <onboarding@resend.dev>';
export const SITE_URL = 'https://wintransfer.cl';
