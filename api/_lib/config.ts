/** Config de las funciones serverless. Los defaults permiten operar sin envs opcionales. */
export const TO_EMAIL = process.env.RESERVAS_EMAIL ?? 'reservaswin@gmail.com';
export const FROM_EMAIL = process.env.RESEND_FROM ?? 'Win Transfer <onboarding@resend.dev>';
// En deploys que no son producción (Preview) el returnUrl de Webpay debe volver
// al propio deploy para poder probar el ciclo completo. VERCEL_ENV/VERCEL_URL
// los define Vercel (no vienen del request), así que no hay open-redirect.
export const SITE_URL =
  process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production' && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://wintransfer.cl';
