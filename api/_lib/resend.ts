import { TO_EMAIL, FROM_EMAIL } from './config';

/** Envía por la API HTTP de Resend. Lanza Error si la API no responde 2xx. */
export async function sendEmail(opts: { subject: string; text: string; html: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY no configurada');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to: [TO_EMAIL], subject: opts.subject, text: opts.text, html: opts.html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
