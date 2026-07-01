const TYPES = ['booking', 'agreement', 'jobs'] as const;
export type ContactType = (typeof TYPES)[number];

export interface ContactPayload {
  type: ContactType;
  message: string;
  lang: string;
}

const LANGS = new Set(['es', 'en', 'pt']);

export function validateContact(
  body: unknown,
): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'bad body' };
  const b = body as Record<string, unknown>;
  // Honeypot: los humanos no ven el campo "website"; si viene lleno es un bot.
  if (typeof b.website === 'string' && b.website.trim() !== '') return { ok: false, error: 'bot' };
  if (typeof b.type !== 'string' || !TYPES.includes(b.type as ContactType))
    return { ok: false, error: 'bad type' };
  if (typeof b.message !== 'string') return { ok: false, error: 'bad message' };
  const message = b.message.trim();
  if (message.length < 5 || message.length > 4000) return { ok: false, error: 'bad message length' };
  const lang = typeof b.lang === 'string' && LANGS.has(b.lang) ? b.lang : 'es';
  return { ok: true, data: { type: b.type as ContactType, message, lang } };
}

const SUBJECTS: Record<ContactType, string> = {
  booking: 'Nueva reserva desde wintransfer.cl',
  agreement: 'Nueva solicitud de convenio desde wintransfer.cl',
  jobs: 'Trabaja con nosotros — postulación desde wintransfer.cl',
};

export const contactSubject = (type: ContactType) => SUBJECTS[type];

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const renderEmailHtml = (message: string) =>
  `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#111">` +
  `<pre style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</pre>` +
  `<p style="color:#666;font-size:12px;margin-top:16px">Enviado automáticamente desde el formulario de wintransfer.cl</p></div>`;
