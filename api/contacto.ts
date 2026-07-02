import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateContact, contactSubject, renderEmailHtml } from './_lib/contact.js';
import { sendEmail } from './_lib/resend.js';
import { rateLimitOk } from './_lib/ratelimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });

  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimitOk(ip)) return res.status(429).json({ ok: false, error: 'rate' });

  const result = validateContact(req.body);
  if (!result.ok) {
    const errResult = result as { ok: false; error: string };
    return res.status(400).json({ ok: false, error: errResult.error });
  }

  try {
    await sendEmail({
      subject: contactSubject(result.data.type),
      text: result.data.message,
      html: renderEmailHtml(result.data.message),
    });
  } catch (err) {
    console.error('contacto:', err);
    return res.status(502).json({ ok: false, error: 'send' });
  }
  return res.status(200).json({ ok: true });
}
