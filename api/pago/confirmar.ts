import type { VercelRequest, VercelResponse } from '@vercel/node';
import { webpayTransaction } from '../_lib/webpay.js';
import { sendEmail } from '../_lib/resend.js';
import { renderEmailHtml } from '../_lib/contact.js';

const LANGS = new Set(['es', 'en', 'pt']);

/** Fecha/hora en formato y zona horaria de Chile para los correos del negocio. */
const fmtChile = (iso?: string) =>
  `${new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Santiago',
  }).format(iso ? new Date(iso) : new Date())} (hora de Chile)`;

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
    const tbkOrder = param(req, 'TBK_ORDEN_COMPRA');
    if (param(req, 'TBK_TOKEN') || tbkOrder) {
      // Constancia para el negocio (best effort): el cliente anuló antes de pagar.
      try {
        const text = `Pago ANULADO por el cliente antes de completarlo (Webpay).${tbkOrder ? `\nOrden: ${tbkOrder}` : ''}\nFecha: ${fmtChile()}\n\nNo se realizó ningún cobro. La reserva quedó registrada en el correo "pago iniciado" de la misma orden.`;
        await sendEmail({
          subject: `⚠️ Pago anulado por el cliente${tbkOrder ? ` — orden ${tbkOrder}` : ''}`,
          text,
          html: renderEmailHtml(text),
        });
      } catch (err) {
        console.error('confirmar/email-anulado:', err);
      }
      return done('status=aborted');
    }
    return done('status=error');
  }

  try {
    const r = await webpayTransaction().commit(token);
    const authorized = r.status === 'AUTHORIZED' && r.response_code === 0;
    if (!authorized) {
      // Constancia para el negocio (best effort): el medio de pago rechazó el cobro.
      try {
        const text = `Pago RECHAZADO por el medio de pago (Webpay).\nOrden: ${r.buy_order ?? ''}\nMonto intentado: $${Number(r.amount ?? 0).toLocaleString('es-CL')}\nFecha: ${fmtChile(r.transaction_date)}\n\nNo se realizó el cobro. La reserva quedó registrada en el correo "pago iniciado" de la misma orden.`;
        await sendEmail({
          subject: `❌ Pago rechazado — orden ${r.buy_order ?? 'sin orden'}`,
          text,
          html: renderEmailHtml(text),
        });
      } catch (err) {
        console.error('confirmar/email-rechazo:', err);
      }
      return done(`status=rejected&order=${encodeURIComponent(r.buy_order ?? '')}`);
    }

    // Correo de confirmación (best effort: el pago YA está cobrado igual).
    try {
      const text = `Pago CONFIRMADO en wintransfer.cl\nOrden: ${r.buy_order}\nMonto: $${Number(r.amount).toLocaleString('es-CL')}\nAutorización: ${r.authorization_code}\nTarjeta: **** ${r.card_detail?.card_number ?? ''}\nFecha: ${fmtChile(r.transaction_date)}`;
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
