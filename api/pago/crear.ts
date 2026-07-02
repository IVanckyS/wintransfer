import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TARIFAS, TARIFA_PAX_MAX } from '../../src/data/tarifas';
import { webpayTransaction } from '../_lib/webpay';
import { sendEmail } from '../_lib/resend';
import { renderEmailHtml } from '../_lib/contact';
import { rateLimitOk } from '../_lib/ratelimit';
import { SITE_URL } from '../_lib/config';

const LANGS = new Set(['es', 'en', 'pt']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });

  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimitOk(ip)) return res.status(429).json({ ok: false, error: 'rate' });

  const b = (req.body ?? {}) as Record<string, unknown>;
  const tarifa = TARIFAS.find((t) => t.id === b.tarifaId);
  if (!tarifa) return res.status(400).json({ ok: false, error: 'tarifa' });

  const passengers = Number(b.passengers);
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > TARIFA_PAX_MAX)
    return res.status(400).json({ ok: false, error: 'passengers' });

  const roundTrip = b.roundTrip === true;
  const lang = typeof b.lang === 'string' && LANGS.has(b.lang) ? b.lang : 'es';
  const message = typeof b.message === 'string' ? b.message.trim().slice(0, 4000) : '';

  // El monto SIEMPRE se calcula aquí, nunca se acepta del navegador.
  const amount = tarifa.original * (roundTrip ? 2 : 1);

  // Máx. 26 caracteres para buyOrder según Transbank.
  const buyOrder = `WT${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.slice(0, 26);
  const sessionId = `S${Math.random().toString(36).slice(2, 12)}`;
  const returnUrl = `${SITE_URL}/api/pago/confirmar?lang=${lang}`;

  // Correo de reserva ANTES de redirigir a pagar: aunque el pago se abandone,
  // el negocio ya recibió el lead. Best effort: no bloquea el pago si falla.
  try {
    const text = `Reserva con intención de pago online\nOrden: ${buyOrder}\nRuta: ${tarifa.label}${roundTrip ? ' (ida y vuelta)' : ''}\nMonto a cobrar: $${amount.toLocaleString('es-CL')}\n\n${message}`;
    await sendEmail({
      subject: `Reserva con pago iniciado — ${tarifa.label} (${buyOrder})`,
      text,
      html: renderEmailHtml(text),
    });
  } catch (err) {
    console.error('crear/email:', err);
  }

  try {
    const tx = await webpayTransaction().create(buyOrder, sessionId, amount, returnUrl);
    return res.status(200).json({ url: tx.url, token: tx.token });
  } catch (err) {
    console.error('crear/webpay:', err);
    return res.status(502).json({ ok: false, error: 'webpay' });
  }
}
