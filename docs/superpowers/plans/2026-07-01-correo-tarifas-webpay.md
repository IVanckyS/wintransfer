# Correo (Resend) + Calculadora de tarifas + Webpay — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que cada formulario enviado llegue por correo a `reservaswin@gmail.com`, que el formulario de reserva muestre la tarifa oficial calculada (tabla de 21 rutas desde Carriel Sur) y que se pueda pagar con Webpay Plus (ambiente de integración hasta recibir credenciales de producción).

**Architecture:** El sitio sigue siendo Astro SSG intacto. Se agregan funciones serverless de Vercel en `/api/` (carpeta raíz, TypeScript, runtime Node) que Vercel detecta automáticamente sin adapter: `api/contacto.ts` (correo vía Resend), `api/pago/crear.ts` (crea transacción Webpay y envía correo de reserva), `api/pago/confirmar.ts` (commit del pago, correo de confirmación, redirect a `/{lang}/confirmacion/`). La lógica pura (tarifas, validación, armado de correos) vive en módulos testeables con vitest.

**Tech Stack:** Astro 5 (SSG) + Tailwind v4 · Vercel Serverless Functions (`@vercel/node`) · Resend (vía `fetch`, sin SDK) · `transbank-sdk` (Webpay Plus REST) · vitest.

## Global Constraints

- **NO tocar:** diseño, colores, tipografía, estructura de páginas, chatbot (`HelpChat`), promociones (`PromoPanel`), idiomas existentes.
- **Nunca** incrustar texto en plantillas: todo string visible va en `src/i18n/es.json`, `en.json` y `pt.json` (los tres siempre).
- **Secretos** (`RESEND_API_KEY`, `TRANSBANK_COMMERCE_CODE`, `TRANSBANK_API_KEY`) solo en variables de entorno de Vercel / `.env` local gitignored. Jamás en el repo ni con prefijo `PUBLIC_`.
- **El servidor recalcula siempre el monto** desde `src/data/tarifas.ts`. El navegador manda `tarifaId`, nunca un monto.
- **WhatsApp no se reemplaza:** el correo se suma al submit existente.
- Tarifas válidas para **1–2 pasajeros**; con 3+ se muestra "tarifa a cotizar" y se deriva a WhatsApp.
- **Precio online = valor original.** El −30% Banco de Chile es solo nota informativa (pendiente validación del cliente).
- Ida y vuelta = valor × 2, etiquetado "(2 tramos)". **Supuesto por confirmar con el cliente.**
- Correos al negocio en español (van a `reservaswin@gmail.com`), UI en los 3 idiomas.
- Remitente: `Win Transfer <onboarding@resend.dev>` (funciona sin verificar dominio porque el destinatario es el dueño de la cuenta Resend). Cambiar después vía env `RESEND_FROM`.
- Botón "Pagar con Webpay" visible solo si `PUBLIC_WEBPAY=on` (activar en Preview; en Production solo cuando haya credenciales reales).
- Node 24 (fetch global disponible). Comandos en PowerShell/Git Bash sobre Windows.

## Variables de entorno (referencia)

| Variable | Dónde | Valor |
|---|---|---|
| `RESEND_API_KEY` | Vercel (Prod+Preview) y `.env` local | ⚠️ **Regenerar** la key filtrada `re_86HLD9RK…` en resend.com → API Keys antes de usar |
| `RESEND_FROM` | opcional | default `Win Transfer <onboarding@resend.dev>` |
| `RESERVAS_EMAIL` | opcional | default `reservaswin@gmail.com` |
| `TRANSBANK_COMMERCE_CODE` / `TRANSBANK_API_KEY` | Vercel Production, cuando el cliente los entregue | si faltan, el código usa el ambiente de **integración** automáticamente |
| `PUBLIC_WEBPAY` | Vercel Preview = `on`; Production = sin definir hasta tener credenciales | muestra/oculta el botón de pago |

---

### Task 1: Rama + higiene de secretos (`.gitignore`, `.env.example`)

**Files:**
- Modify: `.gitignore`
- Modify: `.env.example`

**Interfaces:**
- Produces: rama `feature/correo-tarifas-webpay`; garantía de que ningún `.env` se commitea.

- [ ] **Step 1: Crear rama**

```bash
git checkout -b feature/correo-tarifas-webpay
```

- [ ] **Step 2: Agregar `.env*` al `.gitignore`**

Añadir al final de `.gitignore`:

```gitignore
# Secretos locales (las claves reales van en Vercel > Environment Variables)
.env
.env.*
!.env.example

# Vercel CLI
.vercel/
```

- [ ] **Step 3: Documentar las nuevas variables en `.env.example`**

Añadir al final de `.env.example`:

```bash
# --- Resend (envío de formularios a reservaswin@gmail.com) ---
# Crear key en https://resend.com/api-keys (cuenta reservaswin@gmail.com).
# RESEND_API_KEY=re_xxxxxxxxxxxx
# Opcionales (tienen default en el código):
# RESEND_FROM="Win Transfer <onboarding@resend.dev>"
# RESERVAS_EMAIL=reservaswin@gmail.com

# --- Transbank Webpay Plus (pagos online) ---
# SIN estas variables el código usa el ambiente de INTEGRACIÓN de Transbank
# (tarjetas de prueba, no cobra dinero real). Poner las de producción solo
# cuando el cliente entregue el Código de Comercio y API Key REST de Webpay Plus.
# TRANSBANK_COMMERCE_CODE=
# TRANSBANK_API_KEY=

# --- Feature flag del botón "Pagar con Webpay" ---
# "on" para mostrar el botón (usar en local y en Vercel Preview).
# PUBLIC_WEBPAY=on
```

- [ ] **Step 4: Verificar que git ignora `.env`**

```bash
touch .env && git check-ignore .env && rm .env
```

Expected: imprime `.env` (está ignorado).

- [ ] **Step 5: Commit**

```bash
git add .gitignore .env.example
git commit -m "chore: ignorar .env y documentar variables de Resend/Transbank"
```

---

### Task 2: Setup de vitest

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: comando `npm test` (vitest run) para todas las tareas siguientes.

- [ ] **Step 1: Instalar dependencias**

```bash
npm install --save-dev vitest @vercel/node
npm install transbank-sdk
```

(`@vercel/node` aporta los tipos `VercelRequest/VercelResponse`; `transbank-sdk` se usa en la Fase 3 pero se instala de una vez.)

- [ ] **Step 2: Agregar script de test en `package.json`**

En `"scripts"` añadir:

```json
"test": "vitest run"
```

- [ ] **Step 3: Verificar**

```bash
npm test
```

Expected: `No test files found` (exit code puede ser 1 — correcto, aún no hay tests). Y `npm run build` sigue pasando.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: vitest + tipos de vercel + transbank-sdk"
```

---

### Task 3: Canonical fijo a wintransfer.cl + hreflang de /pt

**Files:**
- Modify: `astro.config.mjs:10-12`
- Modify: `src/layouts/BaseLayout.astro:33`

**Interfaces:**
- Produces: todas las URLs canónicas/hreflang/og apuntan a `https://wintransfer.cl`.

- [ ] **Step 1: Fijar `site` en `astro.config.mjs`**

Reemplazar el bloque `const site = ...` (líneas 6–12, incluido su comentario) por:

```js
// URL canónica del sitio: SIEMPRE el dominio final, aunque el deploy corra en
// *.vercel.app. Así canonical/hreflang/og:image no dependen del entorno.
const site = 'https://wintransfer.cl';
```

- [ ] **Step 2: Corregir hreflang para /pt en `BaseLayout.astro`**

Línea 33, reemplazar:

```js
const pathNoLang = path.replace(/^\/(es|en)/, '') || '/';
```

por:

```js
const pathNoLang = path.replace(/^\/(es|en|pt)/, '') || '/';
```

- [ ] **Step 3: Verificar en el build**

```bash
npm run build && grep -o '<link rel="canonical" href="[^"]*"' dist/pt/index.html && grep -o 'hreflang="es" href="[^"]*"' dist/pt/index.html
```

Expected: `canonical` = `https://wintransfer.cl/pt/` y hreflang es = `https://wintransfer.cl/es/` (antes salía `/es/pt/`).

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs src/layouts/BaseLayout.astro
git commit -m "fix: canonical fijo a wintransfer.cl y hreflang correcto para /pt"
```

---

### Task 4: Helpers del correo (validación + armado) con TDD

**Files:**
- Create: `api/_lib/config.ts`
- Create: `api/_lib/contact.ts`
- Create: `api/_lib/resend.ts`
- Create: `api/_lib/ratelimit.ts`
- Test: `tests/contact.test.ts`

Los archivos bajo `api/_lib/` (prefijo `_`) NO se exponen como endpoints; Vercel solo publica los `.ts` de primer nivel con handler.

**Interfaces:**
- Produces:
  - `validateContact(body: unknown): { ok: true; data: ContactPayload } | { ok: false; error: string }` con `ContactPayload = { type: 'booking'|'agreement'|'jobs'; message: string; lang: string }`
  - `contactSubject(type: ContactPayload['type']): string`
  - `renderEmailHtml(message: string): string` (escapa HTML)
  - `sendEmail(opts: { subject: string; text: string; html: string }): Promise<void>` (lanza si falla)
  - `rateLimitOk(ip: string): boolean` (máx. 5 requests por IP cada 10 min, en memoria)

- [ ] **Step 1: Escribir los tests que fallan** — `tests/contact.test.ts`:

```ts
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
    const html = renderEmailHtml('<script>alert(1)</script> & "x"');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
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
```

- [ ] **Step 2: Correr y ver que falla**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../api/_lib/contact'`.

- [ ] **Step 3: Implementar** —

`api/_lib/config.ts`:

```ts
/** Config de las funciones serverless. Los defaults permiten operar sin envs opcionales. */
export const TO_EMAIL = process.env.RESERVAS_EMAIL ?? 'reservaswin@gmail.com';
export const FROM_EMAIL = process.env.RESEND_FROM ?? 'Win Transfer <onboarding@resend.dev>';
export const SITE_URL = 'https://wintransfer.cl';
```

`api/_lib/contact.ts`:

```ts
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
```

`api/_lib/resend.ts`:

```ts
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
```

`api/_lib/ratelimit.ts`:

```ts
/**
 * Límite de envíos por IP en memoria (por instancia de lambda). No es perfecto
 * —cada instancia tiene su propio contador— pero corta el spam básico sin DB.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

export function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}
```

- [ ] **Step 4: Correr tests**

```bash
npm test
```

Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib tests/contact.test.ts
git commit -m "feat: helpers de correo (validacion, resend, rate limit) con tests"
```

---

### Task 5: Endpoint `api/contacto.ts`

**Files:**
- Create: `api/contacto.ts`

**Interfaces:**
- Consumes: `validateContact`, `contactSubject`, `renderEmailHtml` (`./_lib/contact`), `sendEmail` (`./_lib/resend`), `rateLimitOk` (`./_lib/ratelimit`).
- Produces: `POST /api/contacto` con body `{ type, message, lang, website? }` → `200 {ok:true}` | `400/405/429/502 {ok:false,error}`.

- [ ] **Step 1: Implementar** — `api/contacto.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateContact, contactSubject, renderEmailHtml } from './_lib/contact';
import { sendEmail } from './_lib/resend';
import { rateLimitOk } from './_lib/ratelimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });

  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimitOk(ip)) return res.status(429).json({ ok: false, error: 'rate' });

  const result = validateContact(req.body);
  if (!result.ok) return res.status(400).json({ ok: false, error: result.error });

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
```

- [ ] **Step 2: Verificar que el build de Astro no se rompe**

```bash
npm run build
```

Expected: build OK (la carpeta `api/` es invisible para Astro).

- [ ] **Step 3: Prueba manual local (requiere `.env` con `RESEND_API_KEY`)**

```bash
npx vercel dev --listen 3000
# en otra terminal:
curl -s -X POST http://localhost:3000/api/contacto -H "Content-Type: application/json" -d '{"type":"booking","message":"Prueba de reserva desde el plan","lang":"es"}'
```

Expected: `{"ok":true}` y el correo llega a `reservaswin@gmail.com`. Si no puedes usar `vercel dev` (login), esta verificación se hace en el deploy Preview al final (Task 12).

También probar el rechazo: `curl -s -X POST http://localhost:3000/api/contacto -H "Content-Type: application/json" -d '{"type":"hack","message":"x"}'` → `{"ok":false,...}` con status 400.

- [ ] **Step 4: Commit**

```bash
git add api/contacto.ts
git commit -m "feat: endpoint /api/contacto que envia el formulario por Resend"
```

---

### Task 6: SmartForm envía el correo además de abrir WhatsApp

**Files:**
- Modify: `src/components/SmartForm.astro` (handler de submit, ~línea 422–456)

**Interfaces:**
- Consumes: `POST /api/contacto` (Task 5).
- Produces: cada submit del formulario dispara el correo (fire-and-forget) y luego abre WhatsApp igual que hoy.

- [ ] **Step 1: Modificar el handler de submit**

En `SmartForm.astro`, dentro de `form.addEventListener('submit', ...)`, localizar:

```ts
    const url = `https://wa.me/${form.dataset.waNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
```

y reemplazar por:

```ts
    const message = lines.join('\n');

    // Además de WhatsApp, dejar registro por correo en reservaswin@gmail.com.
    // fire-and-forget: si el correo falla, WhatsApp sigue siendo el canal principal.
    fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, message, lang: document.documentElement.lang }),
      keepalive: true,
    }).catch(() => {});

    const url = `https://wa.me/${form.dataset.waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: OK.

- [ ] **Step 3: Prueba manual**

Con `npx vercel dev` corriendo, abrir `http://localhost:3000/es/contacto/`, llenar la reserva y enviar. Expected: se abre WhatsApp (igual que antes) **y** llega el correo. En la pestaña Network se ve `POST /api/contacto → 200`.

- [ ] **Step 4: Commit**

```bash
git add src/components/SmartForm.astro
git commit -m "feat: el formulario tambien envia el mensaje por correo (Resend)"
```

---

### Task 7: `src/data/tarifas.ts` con la tabla oficial (TDD)

**Files:**
- Create: `src/data/tarifas.ts`
- Test: `tests/tarifas.test.ts`

**Interfaces:**
- Produces:
  - `interface Tarifa { id: string; label: string; original: number; bancoChile: number; aliases: string[] }`
  - `TARIFAS: Tarifa[]` (21 filas oficiales), `TARIFA_PAX_MAX = 2`
  - `normalizeLoc(text: string): string` (minúsculas sin tildes)
  - `isCarrielSur(text: string): boolean`
  - `findTarifa(text: string): Tarifa | undefined` (match exacto por alias normalizado)
  - `quoteTrip(origin: string, destination: string, passengers: number): Quote` con `Quote = { status: 'ok' | 'consult'; tarifa: Tarifa } | { status: 'none' }`

- [ ] **Step 1: Test que falla** — `tests/tarifas.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { TARIFAS, findTarifa, quoteTrip, isCarrielSur } from '../src/data/tarifas';

const AIRPORT = 'Aeropuerto Carriel Sur (CCP)';

describe('tabla', () => {
  it('tiene las 21 rutas oficiales', () => expect(TARIFAS).toHaveLength(21));
  it('todo bancoChile es el 70% del original', () => {
    for (const t of TARIFAS) expect(t.bancoChile).toBe(Math.round(t.original * 0.7));
  });
});

describe('findTarifa', () => {
  it('matchea sin tildes ni mayúsculas', () => {
    expect(findTarifa('CONCEPCIÓN')?.id).toBe('concepcion-centro');
    expect(findTarifa('quillon')?.original).toBe(120000);
  });
  it('matchea alias parciales de rutas compuestas', () => {
    expect(findTarifa('Lota')?.id).toBe('coronel-lota');
    expect(findTarifa('Pingueral')?.id).toBe('dichato-pingueral');
    expect(findTarifa('Lirquén')?.id).toBe('penco-lirquen');
  });
  it('devuelve undefined si no hay tarifa', () => {
    expect(findTarifa('Punta Arenas')).toBeUndefined();
  });
});

describe('quoteTrip', () => {
  it('cotiza aeropuerto → destino y destino → aeropuerto', () => {
    const a = quoteTrip(AIRPORT, 'Talcahuano', 2);
    const b = quoteTrip('Talcahuano', AIRPORT, 1);
    expect(a.status).toBe('ok');
    expect(b.status).toBe('ok');
    if (a.status === 'ok') expect(a.tarifa.original).toBe(30000);
  });
  it('3+ pasajeros → consult (hay tarifa pero se cotiza)', () => {
    expect(quoteTrip(AIRPORT, 'Santiago', 3).status).toBe('consult');
  });
  it('sin Carriel Sur en un extremo → none', () => {
    expect(quoteTrip('Concepción', 'Santiago', 1).status).toBe('none');
  });
  it('destino sin tarifa → none', () => {
    expect(quoteTrip(AIRPORT, 'Pucón', 1).status).toBe('none');
  });
});

describe('isCarrielSur', () => {
  it('reconoce variantes', () => {
    expect(isCarrielSur(AIRPORT)).toBe(true);
    expect(isCarrielSur('aeropuerto carriel sur')).toBe(true);
    expect(isCarrielSur('Aeropuerto Arturo Merino Benítez (SCL)')).toBe(false);
  });
});
```

- [ ] **Step 2: Correr y ver que falla**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../src/data/tarifas'`.

- [ ] **Step 3: Implementar** — `src/data/tarifas.ts`:

```ts
/**
 * Tarifario oficial entregado por el cliente el 2026-06-30 (correo).
 * Todas las rutas parten/llegan al Aeropuerto Carriel Sur y valen para 1–2
 * pasajeros (con 3+ se cotiza por WhatsApp). `bancoChile` es el valor con
 * −30% pagando con tarjetas Banco de Chile (solo informativo en la web:
 * online se cobra `original` porque Webpay no permite verificar el banco).
 * Editar valores aquí actualiza calculadora y cobro (el servidor importa
 * este mismo archivo — nunca confía en montos del navegador).
 */

export interface Tarifa {
  id: string;
  /** Nombre para mostrar en la UI y en correos */
  label: string;
  /** Valor por tramo en CLP */
  original: number;
  /** Valor por tramo con −30% tarjetas Banco de Chile */
  bancoChile: number;
  /** Textos (normalizados con normalizeLoc) que matchean el campo origen/destino */
  aliases: string[];
}

/** Las tarifas publicadas cubren hasta este número de pasajeros. */
export const TARIFA_PAX_MAX = 2;

// Tildes/diacríticos como rango unicode explícito (igual que en SmartForm).
const COMBINING = new RegExp('[\\u0300-\\u036f]', 'g');
export const normalizeLoc = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(COMBINING, '').trim();

export const TARIFAS: Tarifa[] = [
  { id: 'concepcion-centro', label: 'Concepción Centro', original: 15000, bancoChile: 10500, aliases: ['concepcion', 'concepcion centro'] },
  { id: 'hoteles-concepcion', label: 'Hoteles Holiday Inn / Wyndham Pettra / Diego de Almagro', original: 10000, bancoChile: 7000, aliases: ['hoteles holiday inn / wyndham pettra / diego de almagro', 'hotel holiday inn', 'hotel wyndham pettra', 'hotel diego de almagro'] },
  { id: 'terminal-collao', label: 'Terminal de Buses Collao', original: 15000, bancoChile: 10500, aliases: ['terminal de buses collao', 'terminal collao'] },
  { id: 'talcahuano', label: 'Talcahuano', original: 30000, bancoChile: 21000, aliases: ['talcahuano'] },
  { id: 'hualpen', label: 'Hualpén', original: 25000, bancoChile: 17500, aliases: ['hualpen'] },
  { id: 'san-pedro', label: 'San Pedro de la Paz', original: 25000, bancoChile: 17500, aliases: ['san pedro de la paz'] },
  { id: 'chiguayante', label: 'Chiguayante', original: 35000, bancoChile: 24500, aliases: ['chiguayante'] },
  { id: 'penco-lirquen', label: 'Penco-Lirquén', original: 35000, bancoChile: 24500, aliases: ['penco', 'lirquen', 'penco-lirquen'] },
  { id: 'coronel-lota', label: 'Coronel-Lota', original: 35000, bancoChile: 24500, aliases: ['coronel', 'lota', 'coronel-lota'] },
  { id: 'venado-idahue', label: 'El Venado-Idahue', original: 30000, bancoChile: 21000, aliases: ['el venado', 'idahue', 'el venado-idahue'] },
  { id: 'tome', label: 'Tomé', original: 45000, bancoChile: 31500, aliases: ['tome'] },
  { id: 'dichato-pingueral', label: 'Dichato-Pingueral', original: 50000, bancoChile: 35000, aliases: ['dichato', 'pingueral', 'dichato-pingueral'] },
  { id: 'florida', label: 'Florida', original: 110000, bancoChile: 77000, aliases: ['florida'] },
  { id: 'quillon', label: 'Quillón', original: 120000, bancoChile: 84000, aliases: ['quillon'] },
  { id: 'chillan', label: 'Chillán', original: 150000, bancoChile: 105000, aliases: ['chillan'] },
  { id: 'los-angeles', label: 'Los Ángeles', original: 150000, bancoChile: 105000, aliases: ['los angeles'] },
  { id: 'talca', label: 'Talca', original: 200000, bancoChile: 140000, aliases: ['talca'] },
  { id: 'termas-chillan', label: 'Termas de Chillán', original: 250000, bancoChile: 175000, aliases: ['termas de chillan'] },
  { id: 'temuco', label: 'Temuco', original: 450000, bancoChile: 315000, aliases: ['temuco'] },
  { id: 'valdivia', label: 'Valdivia', original: 550000, bancoChile: 385000, aliases: ['valdivia'] },
  { id: 'santiago', label: 'Santiago', original: 580000, bancoChile: 406000, aliases: ['santiago'] },
];

export const isCarrielSur = (text: string) => normalizeLoc(text).includes('carriel sur');

export function findTarifa(text: string): Tarifa | undefined {
  const q = normalizeLoc(text);
  return TARIFAS.find((t) => t.aliases.includes(q));
}

export type Quote = { status: 'ok' | 'consult'; tarifa: Tarifa } | { status: 'none' };

/** Cotiza un viaje: exige Carriel Sur en un extremo y tarifa conocida en el otro. */
export function quoteTrip(origin: string, destination: string, passengers: number): Quote {
  const other = isCarrielSur(origin) ? destination : isCarrielSur(destination) ? origin : null;
  if (other === null) return { status: 'none' };
  const tarifa = findTarifa(other);
  if (!tarifa) return { status: 'none' };
  return { status: passengers > TARIFA_PAX_MAX ? 'consult' : 'ok', tarifa };
}
```

Nota: "HOLLIDAY" del correo del cliente es el hotel **Holiday Inn** (typo del cliente, se escribe Holiday).

- [ ] **Step 4: Correr tests**

```bash
npm test
```

Expected: PASS todos.

- [ ] **Step 5: Commit**

```bash
git add src/data/tarifas.ts tests/tarifas.test.ts
git commit -m "feat: tarifario oficial (21 rutas Carriel Sur) con cotizador testeado"
```

---

### Task 8: Destinos del tarifario en el autocompletado + claves i18n

**Files:**
- Modify: `src/data/locations.ts` (bloque "Gran Concepción y Biobío" y "Ñuble")
- Modify: `src/i18n/es.json`, `src/i18n/en.json`, `src/i18n/pt.json` (dentro del objeto `form`, después de `"errLuggage"`)

**Interfaces:**
- Produces: claves `form.fare*` en 3 idiomas; entradas de LOCATIONS cuyos nombres normalizados coinciden con aliases de `TARIFAS`.

- [ ] **Step 1: Agregar ubicaciones faltantes a `LOCATIONS`**

En `src/data/locations.ts`, dentro del bloque `// ---- Gran Concepción y Biobío ----`, añadir después de la línea de `{ name: 'Concepción', ... }`:

```ts
  { name: 'Concepción Centro', region: 'Biobío', type: 'city' },
  { name: 'Terminal de Buses Collao', region: 'Concepción, Biobío', type: 'city' },
  { name: 'Hotel Holiday Inn', region: 'Concepción, Biobío', type: 'city' },
  { name: 'Hotel Wyndham Pettra', region: 'Concepción, Biobío', type: 'city' },
  { name: 'Hotel Diego de Almagro', region: 'Concepción, Biobío', type: 'city' },
  { name: 'Lirquén', region: 'Penco, Biobío', type: 'city' },
  { name: 'Dichato', region: 'Tomé, Biobío', type: 'city' },
  { name: 'Pingueral', region: 'Tomé, Biobío', type: 'city' },
  { name: 'El Venado', region: 'Biobío', type: 'city' },
  { name: 'Idahue', region: 'Biobío', type: 'city' },
```

Y en el bloque de Ñuble (buscar `// ---- Ñuble ----`), verificar que existan `Chillán`, `Quillón` y `Termas de Chillán`; agregar las que falten:

```ts
  { name: 'Quillón', region: 'Ñuble', type: 'city' },
  { name: 'Termas de Chillán', region: 'Ñuble', type: 'city' },
```

- [ ] **Step 2: Test de consistencia LOCATIONS ↔ TARIFAS** — añadir al final de `tests/tarifas.test.ts`:

```ts
import { LOCATIONS } from '../src/data/locations';

describe('consistencia con el autocompletado', () => {
  it('cada tarifa es alcanzable desde al menos una ubicación del autocompletado', () => {
    const names = LOCATIONS.map((l) => l.name);
    for (const t of TARIFAS) {
      const reachable = names.some((n) => findTarifa(n)?.id === t.id);
      expect(reachable, `tarifa sin ubicación: ${t.id}`).toBe(true);
    }
  });
});
```

- [ ] **Step 3: Correr tests (ajustar aliases/locations hasta pasar)**

```bash
npm test
```

Expected: PASS. Si falla, el mensaje dice qué tarifa quedó inalcanzable — corregir el alias o agregar la ubicación.

- [ ] **Step 4: Claves i18n** — en `src/i18n/es.json`, dentro del objeto `form`, después de `"errLuggage"`:

```json
"fareTitle": "Tarifa estimada",
"farePerLeg": "por tramo",
"fareRoundTrip": "ida y vuelta (2 tramos)",
"fareBdc": "Con tarjetas Banco de Chile: {price} (−30%). Coordínalo por WhatsApp.",
"fareConsult": "Para más de 2 pasajeros la tarifa se cotiza directamente. Escríbenos por WhatsApp.",
"farePay": "Pagar con Webpay",
"farePayNote": "Pago seguro con tarjeta de crédito o débito vía Transbank.",
"farePayError": "No pudimos iniciar el pago. Intenta de nuevo o reserva por WhatsApp.",
"fareWa": "Cotizar por WhatsApp",
```

En `en.json` (misma posición):

```json
"fareTitle": "Estimated fare",
"farePerLeg": "per leg",
"fareRoundTrip": "round trip (2 legs)",
"fareBdc": "With Banco de Chile cards: {price} (−30%). Arrange it via WhatsApp.",
"fareConsult": "For more than 2 passengers we quote directly. Message us on WhatsApp.",
"farePay": "Pay with Webpay",
"farePayNote": "Secure credit or debit card payment via Transbank.",
"farePayError": "We couldn't start the payment. Try again or book via WhatsApp.",
"fareWa": "Get a quote on WhatsApp",
```

En `pt.json` (misma posición):

```json
"fareTitle": "Tarifa estimada",
"farePerLeg": "por trecho",
"fareRoundTrip": "ida e volta (2 trechos)",
"fareBdc": "Com cartões Banco de Chile: {price} (−30%). Combine pelo WhatsApp.",
"fareConsult": "Para mais de 2 passageiros a tarifa é cotada diretamente. Fale conosco no WhatsApp.",
"farePay": "Pagar com Webpay",
"farePayNote": "Pagamento seguro com cartão de crédito ou débito via Transbank.",
"farePayError": "Não foi possível iniciar o pagamento. Tente novamente ou reserve pelo WhatsApp.",
"fareWa": "Cotar pelo WhatsApp",
```

- [ ] **Step 5: Build**

```bash
npm run build
```

Expected: OK (el build falla si un JSON quedó mal formado).

- [ ] **Step 6: Commit**

```bash
git add src/data/locations.ts src/i18n tests/tarifas.test.ts
git commit -m "feat: destinos del tarifario en autocompletado + textos i18n de tarifa"
```

---

### Task 9: Componente `PriceEstimate.astro` (calculadora en el formulario)

**Files:**
- Create: `src/components/PriceEstimate.astro`
- Modify: `src/components/SmartForm.astro` (importar + insertar tras el bloque de resumen, ~línea 168)

**Interfaces:**
- Consumes: `quoteTrip`, `TARIFA_PAX_MAX` de `../data/tarifas`; ids del DOM de SmartForm (`#smart-form`, `#f-origin`, `#f-destination`, `#f-passengers`, radios `trip-mode`); `waLink` de `../config`; claves `form.fare*`.
- Produces: caja `#fare-box` visible cuando hay cotización; botón `#fare-pay` (solo si `PUBLIC_WEBPAY==='on'`) que en Task 11 inicia el pago; expone `box.dataset.tarifaId` y `box.dataset.roundTrip` para el pago.

- [ ] **Step 1: Crear `src/components/PriceEstimate.astro`**

```astro
---
/**
 * Caja de tarifa estimada dentro del panel de reserva de SmartForm.
 * Lee origen/destino/pasajeros del propio formulario (por id) y cotiza con
 * src/data/tarifas.ts. El botón "Pagar con Webpay" solo se renderiza con
 * PUBLIC_WEBPAY=on (feature flag mientras no haya credenciales de producción).
 */
import { getLangFromUrl, useTranslations } from '../i18n';
import { waLink } from '../config';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const webpayOn = import.meta.env.PUBLIC_WEBPAY === 'on';
---

<div
  id="fare-box"
  hidden
  class="rounded-2xl border border-sun/50 bg-sun/10 p-4 sm:col-span-2"
  data-label-per-leg={t('form.farePerLeg')}
  data-label-round-trip={t('form.fareRoundTrip')}
  data-bdc-template={t('form.fareBdc')}
>
  <p class="font-display text-sm font-bold text-primary">{t('form.fareTitle')}</p>

  <div data-fare-ok>
    <p id="fare-amount" class="mt-1 font-display text-2xl font-extrabold text-primary"></p>
    <p id="fare-bdc" class="mt-1 text-xs text-ink/70"></p>
    {
      webpayOn && (
        <div class="mt-3">
          <button
            type="button"
            id="fare-pay"
            class="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 font-display text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {t('form.farePay')}
          </button>
          <p class="mt-2 text-xs text-ink/70">{t('form.farePayNote')}</p>
          <p id="fare-pay-error" hidden class="mt-1.5 text-xs font-semibold text-red-600">
            {t('form.farePayError')}
          </p>
        </div>
      )
    }
  </div>

  <div data-fare-consult hidden>
    <p class="mt-1 text-sm text-ink/80">{t('form.fareConsult')}</p>
    <a
      href={waLink()}
      target="_blank"
      rel="noopener"
      class="mt-2 inline-block rounded-full bg-wa px-5 py-2 font-display text-sm font-bold text-white"
    >
      {t('form.fareWa')}
    </a>
  </div>
</div>

<script>
  import { quoteTrip } from '../data/tarifas';

  const box = document.getElementById('fare-box')!;
  const form = document.getElementById('smart-form') as HTMLFormElement;
  const okBlock = box.querySelector<HTMLElement>('[data-fare-ok]')!;
  const consultBlock = box.querySelector<HTMLElement>('[data-fare-consult]')!;
  const amountEl = document.getElementById('fare-amount')!;
  const bdcEl = document.getElementById('fare-bdc')!;

  const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value;

  function refresh() {
    const passengers = Number(val('f-passengers')) || 1;
    const round = form.querySelector<HTMLInputElement>('input[name="trip-mode"]:checked')?.value === 'round-trip';
    const q = quoteTrip(val('f-origin'), val('f-destination'), passengers);

    if (q.status === 'none') {
      box.hidden = true;
      delete box.dataset.tarifaId;
      return;
    }
    box.hidden = false;
    okBlock.hidden = q.status !== 'ok';
    consultBlock.hidden = q.status !== 'consult';
    if (q.status !== 'ok') {
      delete box.dataset.tarifaId;
      return;
    }

    const factor = round ? 2 : 1;
    const suffix = round ? box.dataset.labelRoundTrip : box.dataset.labelPerLeg;
    amountEl.textContent = `${clp.format(q.tarifa.original * factor)} ${suffix}`;
    bdcEl.textContent = (box.dataset.bdcTemplate ?? '').replace('{price}', clp.format(q.tarifa.bancoChile * factor));
    box.dataset.tarifaId = q.tarifa.id;
    box.dataset.roundTrip = String(round);
  }

  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  refresh();
</script>
```

- [ ] **Step 2: Insertar en `SmartForm.astro`**

En el frontmatter, junto a los otros imports:

```ts
import PriceEstimate from './PriceEstimate.astro';
```

Y en el markup, inmediatamente DESPUÉS del bloque del resumen (el `<div>` que contiene `#booking-summary`, cierra en la línea `</div>` ~168) y ANTES de `</fieldset>`:

```astro
    <PriceEstimate />
```

- [ ] **Step 3: Build + prueba manual**

```bash
npm run build
npm run dev
```

En `http://localhost:4321/es/contacto/`: elegir "Hacia aeropuerto", origen `Talcahuano`, destino `Aeropuerto Carriel Sur (CCP)` → aparece la caja con `$30.000 por tramo` y la nota Banco de Chile `$21.000`. Subir pasajeros a 3 → cambia a "se cotiza directamente" con botón WhatsApp. Cambiar a ida y vuelta → `$60.000 ida y vuelta (2 tramos)`. Poner destino `Pucón` → la caja desaparece. Verificar también en `/en/contacto/` y `/pt/contacto/`.

- [ ] **Step 4: Commit**

```bash
git add src/components/PriceEstimate.astro src/components/SmartForm.astro
git commit -m "feat: calculadora de tarifa estimada en el formulario de reserva"
```

---

### Task 10: Endpoint `api/pago/crear.ts` (crear transacción Webpay)

**Files:**
- Create: `api/_lib/webpay.ts`
- Create: `api/pago/crear.ts`

**Interfaces:**
- Consumes: `TARIFAS`, `TARIFA_PAX_MAX` de `../../src/data/tarifas`; `sendEmail`, `renderEmailHtml`, `rateLimitOk`, `SITE_URL`.
- Produces:
  - `webpayTransaction()` → instancia `WebpayPlus.Transaction` (producción si hay envs `TRANSBANK_*`, integración si no).
  - `POST /api/pago/crear` body `{ tarifaId, roundTrip, passengers, lang, message }` → `200 { url, token }` | errores 4xx/502.

- [ ] **Step 1: Crear `api/_lib/webpay.ts`**

```ts
import pkg from 'transbank-sdk';
const { WebpayPlus, Options, Environment, IntegrationApiKeys, IntegrationCommerceCodes } = pkg;

/**
 * Con TRANSBANK_COMMERCE_CODE + TRANSBANK_API_KEY definidas → PRODUCCIÓN.
 * Sin ellas → ambiente de INTEGRACIÓN de Transbank (tarjetas de prueba,
 * no mueve dinero real). Así el mismo código sirve para desarrollo y para
 * activar producción solo agregando las variables en Vercel.
 */
export function webpayTransaction() {
  const cc = process.env.TRANSBANK_COMMERCE_CODE;
  const key = process.env.TRANSBANK_API_KEY;
  const options =
    cc && key
      ? new Options(cc, key, Environment.Production)
      : new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration);
  return new WebpayPlus.Transaction(options);
}
```

- [ ] **Step 2: Crear `api/pago/crear.ts`**

```ts
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
```

- [ ] **Step 3: Verificación local**

```bash
npm run build
npx vercel dev --listen 3000
curl -s -X POST http://localhost:3000/api/pago/crear -H "Content-Type: application/json" -d '{"tarifaId":"talcahuano","roundTrip":false,"passengers":2,"lang":"es","message":"prueba"}'
```

Expected: JSON con `url` (dominio `webpay3gint.transbank.cl`) y `token` de 64 hex. Con `tarifaId` inválido → 400. Con `passengers: 3` → 400.

- [ ] **Step 4: Commit**

```bash
git add api/_lib/webpay.ts api/pago/crear.ts
git commit -m "feat: endpoint que crea la transaccion Webpay y avisa la reserva por correo"
```

---

### Task 11: Endpoint `api/pago/confirmar.ts` + botón de pago en la calculadora

**Files:**
- Create: `api/pago/confirmar.ts`
- Modify: `src/components/PriceEstimate.astro` (agregar lógica del botón al final del `<script>`)
- Modify: `vercel.json` (CSP `form-action`)

**Interfaces:**
- Consumes: `webpayTransaction()`, `sendEmail`, `renderEmailHtml`; `box.dataset.tarifaId`/`roundTrip` de Task 9; `POST /api/pago/crear` de Task 10.
- Produces: `GET|POST /api/pago/confirmar?lang=xx` que hace commit y redirige 303 a `/{lang}/confirmacion/?status=ok|aborted|rejected|error&order=&amount=` (página creada en Task 12).

- [ ] **Step 1: Crear `api/pago/confirmar.ts`**

```ts
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
```

- [ ] **Step 2: Botón de pago en `PriceEstimate.astro`** — añadir al FINAL del `<script>` existente (después de `refresh();`):

```ts
  // ---- Pago con Webpay (solo existe el botón si PUBLIC_WEBPAY=on) ----
  const payBtn = document.getElementById('fare-pay') as HTMLButtonElement | null;
  const payError = document.getElementById('fare-pay-error');

  payBtn?.addEventListener('click', async () => {
    // Exigir el formulario válido (nombre, teléfono, fechas…) antes de cobrar.
    if (!form.reportValidity()) return;
    if (!box.dataset.tarifaId) return;

    // Mismo resumen que el mensaje de WhatsApp, para el correo del negocio.
    const lines: string[] = [];
    form
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-panel="booking"] [data-label]')
      .forEach((field) => {
        if (!field.disabled && field.value.trim()) lines.push(`• ${field.dataset.label}: ${field.value.trim()}`);
      });

    payBtn.disabled = true;
    payError?.setAttribute('hidden', '');
    try {
      const res = await fetch('/api/pago/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarifaId: box.dataset.tarifaId,
          roundTrip: box.dataset.roundTrip === 'true',
          passengers: Number(val('f-passengers')) || 1,
          lang: document.documentElement.lang,
          message: lines.join('\n'),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { url, token } = await res.json();

      // Redirección oficial a Webpay: POST con token_ws.
      const redirect = document.createElement('form');
      redirect.method = 'POST';
      redirect.action = url;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = token;
      redirect.appendChild(input);
      document.body.appendChild(redirect);
      redirect.submit();
    } catch {
      payError?.removeAttribute('hidden');
      payBtn.disabled = false;
    }
  });
```

- [ ] **Step 3: CSP — permitir el POST hacia Webpay** — en `vercel.json`, en el valor de `Content-Security-Policy`, reemplazar:

```
form-action 'self'
```

por:

```
form-action 'self' https://webpay3gint.transbank.cl https://webpay3g.transbank.cl
```

(`webpay3gint` = integración, `webpay3g` = producción.)

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: OK. (La prueba end-to-end del pago se hace en Task 12 con la página de confirmación ya creada.)

- [ ] **Step 5: Commit**

```bash
git add api/pago/confirmar.ts src/components/PriceEstimate.astro vercel.json
git commit -m "feat: confirmacion de pago Webpay + boton pagar en la calculadora"
```

---

### Task 12: Página `/{lang}/confirmacion/` + prueba end-to-end

**Files:**
- Modify: `src/i18n/index.ts` (routes), `src/i18n/es.json`, `en.json`, `pt.json` (nuevo objeto raíz `confirm`)
- Modify: `src/layouts/BaseLayout.astro` (prop opcional `noindex`)
- Create: `src/pages/[lang]/confirmacion.astro`

**Interfaces:**
- Consumes: redirect de `api/pago/confirmar.ts` con `?status=ok|aborted|rejected|error&order&amount`.
- Produces: página estática por idioma que muestra el resultado leyendo los query params en el cliente.

- [ ] **Step 1: Ruta en `src/i18n/index.ts`** — en el objeto `routes`, después de `contact: 'contacto',`:

```ts
  confirmation: 'confirmacion',
```

- [ ] **Step 2: Claves i18n** — nuevo objeto RAÍZ `confirm` (mismo nivel que `form`), en `es.json`:

```json
"confirm": {
  "title": "Confirmación de pago",
  "okTitle": "¡Pago confirmado!",
  "okText": "Recibimos tu pago y tu reserva quedó registrada. Nuestro equipo te contactará para coordinar los detalles del traslado.",
  "orderLabel": "Orden",
  "amountLabel": "Monto pagado",
  "abortedTitle": "Pago cancelado",
  "abortedText": "Cancelaste el pago en Webpay. No se realizó ningún cobro; puedes intentarlo de nuevo o reservar por WhatsApp.",
  "rejectedTitle": "Pago rechazado",
  "rejectedText": "Tu medio de pago rechazó la transacción. Puedes intentar con otra tarjeta o coordinar tu reserva por WhatsApp.",
  "errorTitle": "No pudimos verificar el pago",
  "errorText": "Ocurrió un problema al confirmar la transacción. Si el cobro aparece en tu tarjeta, escríbenos por WhatsApp y lo resolvemos.",
  "back": "Volver al inicio",
  "wa": "Hablar por WhatsApp"
}
```

En `en.json`:

```json
"confirm": {
  "title": "Payment confirmation",
  "okTitle": "Payment confirmed!",
  "okText": "We received your payment and your booking is registered. Our team will contact you to coordinate the details of your transfer.",
  "orderLabel": "Order",
  "amountLabel": "Amount paid",
  "abortedTitle": "Payment cancelled",
  "abortedText": "You cancelled the payment at Webpay. Nothing was charged; you can try again or book via WhatsApp.",
  "rejectedTitle": "Payment declined",
  "rejectedText": "Your payment method declined the transaction. Try another card or arrange your booking via WhatsApp.",
  "errorTitle": "We couldn't verify the payment",
  "errorText": "There was a problem confirming the transaction. If the charge appears on your card, message us on WhatsApp and we'll sort it out.",
  "back": "Back to home",
  "wa": "Chat on WhatsApp"
}
```

En `pt.json`:

```json
"confirm": {
  "title": "Confirmação de pagamento",
  "okTitle": "Pagamento confirmado!",
  "okText": "Recebemos seu pagamento e sua reserva foi registrada. Nossa equipe entrará em contato para coordenar os detalhes do traslado.",
  "orderLabel": "Pedido",
  "amountLabel": "Valor pago",
  "abortedTitle": "Pagamento cancelado",
  "abortedText": "Você cancelou o pagamento no Webpay. Nada foi cobrado; você pode tentar novamente ou reservar pelo WhatsApp.",
  "rejectedTitle": "Pagamento recusado",
  "rejectedText": "Seu meio de pagamento recusou a transação. Tente outro cartão ou combine sua reserva pelo WhatsApp.",
  "errorTitle": "Não foi possível verificar o pagamento",
  "errorText": "Ocorreu um problema ao confirmar a transação. Se a cobrança aparecer no seu cartão, fale conosco pelo WhatsApp.",
  "back": "Voltar ao início",
  "wa": "Falar no WhatsApp"
}
```

- [ ] **Step 3: Prop `noindex` en `BaseLayout.astro`**

En la `interface Props` añadir:

```ts
  /** true en páginas que no deben indexarse (p. ej. confirmación de pago). */
  noindex?: boolean;
```

En el destructuring: `image = '/og-image.jpg', noindex = false`. Y en el `<head>`, tras `<link rel="canonical" ...>`:

```astro
    {noindex && <meta name="robots" content="noindex, nofollow" />}
```

- [ ] **Step 4: Crear `src/pages/[lang]/confirmacion.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { useTranslations, localePath, type Lang } from '../../i18n';
import { waLink } from '../../config';

export function getStaticPaths() {
  return [{ params: { lang: 'es' } }, { params: { lang: 'en' } }, { params: { lang: 'pt' } }];
}

const lang = Astro.params.lang as Lang;
const t = useTranslations(lang);

const states = [
  { id: 'ok', title: t('confirm.okTitle'), text: t('confirm.okText') },
  { id: 'aborted', title: t('confirm.abortedTitle'), text: t('confirm.abortedText') },
  { id: 'rejected', title: t('confirm.rejectedTitle'), text: t('confirm.rejectedText') },
  { id: 'error', title: t('confirm.errorTitle'), text: t('confirm.errorText') },
];
---

<BaseLayout title={t('confirm.title')} noindex>
  <section class="bg-mist py-16 md:py-24">
    <div class="mx-auto max-w-2xl px-4 md:px-6">
      {
        states.map((s) => (
          <div data-status={s.id} hidden class="rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-sm">
            <h1 class="font-display text-3xl font-extrabold text-primary">{s.title}</h1>
            <p class="mt-4 text-ink/80">{s.text}</p>
            {s.id === 'ok' && (
              <dl class="mx-auto mt-6 max-w-xs rounded-2xl bg-mist p-4 text-sm">
                <div class="flex justify-between">
                  <dt class="font-bold text-ink">{t('confirm.orderLabel')}</dt>
                  <dd data-order class="text-ink/80" />
                </div>
                <div class="mt-2 flex justify-between">
                  <dt class="font-bold text-ink">{t('confirm.amountLabel')}</dt>
                  <dd data-amount class="text-ink/80" />
                </div>
              </dl>
            )}
            <div class="mt-8 flex flex-wrap justify-center gap-3">
              <a href={waLink()} target="_blank" rel="noopener" class="rounded-full bg-wa px-6 py-3 font-display text-sm font-bold text-white">
                {t('confirm.wa')}
              </a>
              <a href={localePath(lang, 'home')} class="rounded-full border border-primary/20 px-6 py-3 font-display text-sm font-bold text-primary">
                {t('confirm.back')}
              </a>
            </div>
          </div>
        ))
      }
    </div>
  </section>
</BaseLayout>

<script>
  // La página es estática; el resultado viene en los query params del redirect
  // de /api/pago/confirmar (?status=ok|aborted|rejected|error&order=&amount=).
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status') ?? 'error';
  const block =
    document.querySelector<HTMLElement>(`[data-status="${status}"]`) ??
    document.querySelector<HTMLElement>('[data-status="error"]')!;
  block.hidden = false;

  const order = params.get('order');
  const amount = Number(params.get('amount'));
  const orderEl = block.querySelector('[data-order]');
  const amountEl = block.querySelector('[data-amount]');
  if (orderEl && order) orderEl.textContent = order;
  if (amountEl && amount)
    amountEl.textContent = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
</script>
```

- [ ] **Step 5: Build + tests**

```bash
npm run build && npm test
```

Expected: build OK (genera `dist/es/confirmacion/index.html`, `en`, `pt`), tests PASS.

- [ ] **Step 6: Prueba end-to-end en integración (local)**

Con `.env` que tenga `RESEND_API_KEY` y `PUBLIC_WEBPAY=on`:

```bash
npx vercel dev --listen 3000
```

1. Abrir `http://localhost:3000/es/contacto/`, llenar reserva con origen `Talcahuano` → destino `Aeropuerto Carriel Sur (CCP)`, 2 pasajeros, nombre y teléfono válidos.
2. Click "Pagar con Webpay" → redirige a `webpay3gint.transbank.cl`.
3. Pagar con la tarjeta de prueba VISA `4051 8856 0044 6623`, CVV `123`, cualquier fecha futura; en el banco simulado usar RUT `11.111.111-1` y clave `123`.
4. Expected: vuelve a `/es/confirmacion/?status=ok&order=WT…&amount=30000` mostrando orden y monto, y llegan DOS correos: "Reserva con pago iniciado…" y "✅ Pago confirmado…".
5. Repetir anulando el pago en Webpay → `status=aborted` con su mensaje.

Nota: el `returnUrl` usa `SITE_URL` (producción), así que en local el retorno llegará a `https://wintransfer.cl/api/...`. Para probar el ciclo completo en local, cambiar temporalmente `SITE_URL` en `api/_lib/config.ts` a `http://localhost:3000` (¡revertir antes del commit!) o hacer la prueba directamente en el deploy Preview (Task 13).

- [ ] **Step 7: Commit**

```bash
git add src/i18n src/layouts/BaseLayout.astro src/pages/[lang]/confirmacion.astro
git commit -m "feat: pagina de confirmacion de pago por idioma"
```

---

### Task 13: Deploy Preview + variables en Vercel + verificación final

**Files:** ninguno (operaciones).

- [ ] **Step 1: Configurar variables en Vercel** (dashboard → wintransfer → Settings → Environment Variables):
  - `RESEND_API_KEY` = key **nueva** (regenerada) → Production + Preview + Development.
  - `PUBLIC_WEBPAY` = `on` → **solo Preview** (en Production se activará cuando el cliente entregue credenciales Webpay Plus y se agreguen `TRANSBANK_COMMERCE_CODE`/`TRANSBANK_API_KEY`).

- [ ] **Step 2: Push de la rama y abrir PR**

```bash
git push -u origin feature/correo-tarifas-webpay
gh pr create --title "Correo Resend + calculadora de tarifas + Webpay (integracion)" --body "$(cat <<'EOF'
## Qué incluye
- Envío de cada formulario por correo a reservaswin@gmail.com (Resend) además de WhatsApp
- Calculadora de tarifa estimada con el tarifario oficial (21 rutas Carriel Sur, 1–2 pax, −30% BdC informativo)
- Pago Webpay Plus end-to-end en ambiente de integración, detrás del flag PUBLIC_WEBPAY
- Página /{lang}/confirmacion/ + CSP para Webpay + canonical fijo a wintransfer.cl + fix hreflang /pt

## Pendiente del cliente para producción
- Credenciales Webpay Plus (Commerce Code + API Key REST)
- Confirmar: −30% solo informativo online · tarifas bidireccionales · ida y vuelta = ×2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Verificación en el deploy Preview**
  1. Formulario de contacto → enviar → llega correo + abre WhatsApp. ✅
  2. Calculadora: Talcahuano ↔ Carriel Sur muestra `$30.000 por tramo`; 3 pax deriva a WhatsApp. ✅
  3. Pago completo con tarjeta de prueba (`4051 8856 0044 6623`) → confirmación `status=ok` + 2 correos. ✅
  4. Pago anulado → `status=aborted`. ✅
  5. `curl -s -X POST <preview>/api/contacto -d '{}' -H "Content-Type: application/json"` → 400. ✅
  6. En las 3 lenguas: `/es/contacto/`, `/en/contacto/`, `/pt/contacto/` renderizan la caja de tarifa. ✅

- [ ] **Step 4: Merge a `main`** (deploy automático a producción; el botón Webpay queda oculto en producción hasta tener credenciales — el resto queda vivo).

---

## Al recibir lo pendiente del cliente (referencia futura, sin tareas)

1. **Credenciales Webpay Plus** → agregar `TRANSBANK_COMMERCE_CODE` y `TRANSBANK_API_KEY` en Vercel Production, más `PUBLIC_WEBPAY=on` en Production → redeploy. Sin cambios de código.
2. **Dominio verificado en Resend** (opcional) → verificar wintransfer.cl en Resend y setear `RESEND_FROM="Reservas Win Transfer <reservas@wintransfer.cl>"`.
3. **Si el cliente cambia tarifas** → editar solo `src/data/tarifas.ts`.
