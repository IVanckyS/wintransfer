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
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Convierte el mensaje plano en un correo HTML de marca: las líneas con
 * formato "Etiqueta: valor" (con o sin viñeta) se vuelven filas de tabla y
 * el resto queda como párrafos. Todo el contenido del usuario va escapado.
 */
export const renderEmailHtml = (message: string) => {
  const blocks: string[] = [];
  let rows: string[] = [];
  const flushRows = () => {
    if (!rows.length) return;
    blocks.push(`<table style="border-collapse:collapse;width:100%;margin:12px 0">${rows.join('')}</table>`);
    rows = [];
  };
  for (const raw of message.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(?:• )?([^:]{1,40}):\s+(.+)$/);
    if (m) {
      rows.push(
        `<tr><td style="padding:6px 12px;border:1px solid #dbe4f5;background:#f2f6ff;font-weight:600;color:#0039ae;white-space:nowrap">${escapeHtml(m[1])}</td>` +
          `<td style="padding:6px 12px;border:1px solid #dbe4f5;color:#111">${escapeHtml(m[2])}</td></tr>`,
      );
    } else {
      flushRows();
      blocks.push(`<p style="margin:12px 0;color:#111">${escapeHtml(line.replace(/^• /, ''))}</p>`);
    }
  }
  flushRows();
  return (
    `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#111;max-width:560px">` +
    `<div style="background:#0039ae;border-radius:10px 10px 0 0;padding:14px 18px">` +
    `<span style="color:#ffffff;font-weight:700;font-size:16px">Win Transfer</span>` +
    `<span style="color:#f3bf19;font-weight:700"> · wintransfer.cl</span></div>` +
    `<div style="border:1px solid #dbe4f5;border-top:0;border-radius:0 0 10px 10px;padding:6px 18px 14px">` +
    blocks.join('') +
    `<p style="color:#667085;font-size:12px;margin:14px 0 0">Enviado automáticamente desde el formulario de wintransfer.cl</p>` +
    `</div></div>`
  );
};
