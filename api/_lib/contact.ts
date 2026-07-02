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
  // Encabezado blanco (el logo es azul/amarillo sobre fondo transparente) con
  // franja amarilla corporativa. El dominio va como <a> con estilo propio para
  // que Gmail no lo pinte con su azul de enlace.
  const siteLink =
    `<a href="https://wintransfer.cl" style="color:#0039ae;font-weight:600;text-decoration:none">wintransfer.cl</a>`;
  return (
    `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#1c2434;max-width:560px;border:1px solid #dbe4f5;border-radius:12px;overflow:hidden">` +
    `<div style="background:#ffffff;padding:18px 20px 14px;border-bottom:4px solid #f3bf19;text-align:center">` +
    `<img src="https://wintransfer.cl/logo.png" alt="Win Transfer" height="52" style="display:inline-block;height:52px;border:0" />` +
    `</div>` +
    `<div style="background:#ffffff;padding:8px 20px 16px">` +
    blocks.join('') +
    `<p style="color:#667085;font-size:12px;margin:16px 0 0;border-top:1px solid #eef2fa;padding-top:12px">` +
    `Enviado automáticamente desde el formulario de ${siteLink}</p>` +
    `</div></div>`
  );
};
