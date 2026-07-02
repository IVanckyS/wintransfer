import type { VercelRequest, VercelResponse } from '@vercel/node';
import { webpayTransaction } from '../_lib/webpay';
import { sendEmail } from '../_lib/resend';
import { renderEmailHtml } from '../_lib/contact';

const LANGS = new Set(['es', 'en', 'pt']);

/** Webpay vuelve por GET o POST según el caso; los datos pueden venir en query o body. */
const param = (req: VercelRequest, name: string): string | undefined => {
  const q = req.query[name];
  if (typeof q === 'string' && q) return q;
  const b = (req.body ?? {}) as Record<string, unknown>;
  return typeof b[name] === 'string' && b[name] ? (b[name] as string) : undefined;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const langRaw = param(req, 'lang');
  const lang = langRaw && LANGS.has(langRaw) ? langRaw : 'es';
  const done = (qs: string) => res.redirect(303, `/${lang}/confirmacion/?${qs}`);

  const token = param(req, 'token_ws');
  // TBK_TOKEN (o ausencia de token_ws con TBK_ORDEN_COMPRA) = usuario anuló o expiró.
  if (!token) {
    return done(param(req, 'TBK_TOKEN') || param(req, 'TBK_ORDEN_COMPRA') ? 'status=aborted' : 'status=error');
  }

  try {
    const r = await webpayTransaction().commit(token);
    const authorized = r.status === 'AUTHORIZED' && r.response_code === 0;
    if (!authorized) return done(`status=rejected&order=${encodeURIComponent(r.buy_order ?? '')}`);

    // Correo de confirmación (best effort: el pago YA está cobrado igual).
    try {
      const text = `Pago CONFIRMADO en wintransfer.cl\nOrden: ${r.buy_order}\nMonto: $${Number(r.amount).toLocaleString('es-CL')}\nAutorización: ${r.authorization_code}\nTarjeta: **** ${r.card_detail?.card_number ?? ''}\nFecha: ${r.transaction_date}`;
      await sendEmail({ subject: `✅ Pago confirmado — orden ${r.buy_order}`, text, html: renderEmailHtml(text) });
    } catch (err) {
      console.error('confirmar/email:', err);
    }

    return done(`status=ok&order=${encodeURIComponent(r.buy_order)}&amount=${encodeURIComponent(String(r.amount))}`);
  } catch (err) {
    console.error('confirmar/commit:', err);
    return done('status=error');
  }
}
