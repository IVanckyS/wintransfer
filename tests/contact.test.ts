import { describe, it, expect } from 'vitest';
import { validateContact, contactSubject, renderEmailHtml } from '../api/_lib/contact';
import { rateLimitOk } from '../api/_lib/ratelimit';

describe('validateContact', () => {
  const valid = { type: 'booking', message: 'Hola, quiero reservar un traslado\n• Origen: Aeropuerto', lang: 'es' };

  it('acepta un payload válido', () => {
    const r = validateContact(valid);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.type).toBe('booking');
  });

  it('rechaza tipo desconocido', () => {
    expect(validateContact({ ...valid, type: 'hack' }).ok).toBe(false);
  });

  it('rechaza mensaje vacío, no-string o gigante', () => {
    expect(validateContact({ ...valid, message: '' }).ok).toBe(false);
    expect(validateContact({ ...valid, message: 42 }).ok).toBe(false);
    expect(validateContact({ ...valid, message: 'x'.repeat(4001) }).ok).toBe(false);
  });

  it('rechaza si el honeypot viene lleno (bot)', () => {
    expect(validateContact({ ...valid, website: 'spam.com' }).ok).toBe(false);
  });

  it('rechaza body no-objeto y normaliza lang inválido a es', () => {
    expect(validateContact(null).ok).toBe(false);
    const r = validateContact({ ...valid, lang: 'xx-verylong' });
    if (r.ok) expect(r.data.lang).toBe('es');
  });
});

describe('contactSubject', () => {
  it('asunto por tipo', () => {
    expect(contactSubject('booking')).toContain('reserva');
    expect(contactSubject('agreement')).toContain('convenio');
    expect(contactSubject('jobs')).toContain('Trabaja');
  });
});

describe('renderEmailHtml', () => {
  it('escapa HTML del mensaje', () => {
    const html = renderEmailHtml('<script>alert(1)</script> & "x" \'y\'');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&#39;y&#39;');
  });
});

describe('rateLimitOk', () => {
  it('permite 5 y bloquea la sexta por IP', () => {
    const ip = 'test-' + Math.random();
    for (let i = 0; i < 5; i++) expect(rateLimitOk(ip)).toBe(true);
    expect(rateLimitOk(ip)).toBe(false);
    expect(rateLimitOk('otra-ip-' + Math.random())).toBe(true);
  });
});
