# Win Transfer — Contexto para Claude Code

Sitio web estático trilingüe (ES/EN/PT) para Win Transfer, empresa chilena de transporte de pasajeros con 20 años de experiencia.

## Stack

- **Framework:** Astro (SSG) + **funciones serverless de Vercel en `/api/`** (correo y pagos; sin base de datos)
- **Tests:** vitest (`npm test`) — cubren `src/data/tarifas.ts` y `api/_lib/contact.ts`
- **CSS:** Tailwind CSS v4 con design tokens en `src/styles/global.css` via `@theme`
- **Idiomas:** ES (default) + EN + PT (brasileño) — strings en `src/i18n/es.json`, `en.json` y `pt.json`. Para sumar un idioma: crear el JSON, registrarlo en `src/i18n/index.ts` (`translations`, `languages`, `languageMeta`), añadir el locale en `astro.config.mjs`, sumar el `params` en los `getStaticPaths` de `[lang]/*` y en el swap de `404.astro`.
- **Deploy:** Vercel (conectado al repo GitHub `IVanckyS/wintransfer`)
- **Repo:** https://github.com/IVanckyS/wintransfer

## Colores corporativos

```css
--color-primary: #0039ae   /* azul corporativo oficial */
--color-sun:     #f3bf19   /* amarillo corporativo oficial */
```

## Contacto del cliente

- WhatsApp principal: `+56 9 9632 6930` → constante `WHATSAPP_NUMBER` en `src/config.ts`
- WhatsApp secundario: `+56 9 2008 5893` → `WHATSAPP_NUMBER_2`
- Correo: `reservaswin@gmail.com`
- Instagram: `@wintransfer.chile`
- **NO publicar:** RUT, dirección física, boleta de honorarios, fechas de pago
- **Tarifas: SÍ se publican** desde 2026-06-30 (el cliente entregó el tarifario oficial — ver sección Tarifas). Se pueden usar en anuncios ("precios desde $15.000"), calculadora del formulario, etc.

## Tarifas (oficiales, entregadas por el cliente 2026-06-30)

**La fuente de verdad en código es `src/data/tarifas.ts`** (21 rutas + `quoteTrip()`; testeado valor por valor en `tests/tarifas.test.ts`). La calculadora del formulario y el cobro Webpay leen de ahí — cambiar una tarifa = editar solo ese archivo. La tabla de abajo es la referencia del cliente.

**Reglas del tarifario:**

- Válidas para **1–2 pasajeros**. Con **3+ pasajeros NO hay tarifa pública** → derivar a WhatsApp ("tarifa a cotizar").
- El **valor final (−30%) aplica SOLO pagando con tarjetas Banco de Chile**. Online/Webpay no se puede verificar el banco → cobrar el valor original y mostrar el descuento como nota informativa que deriva a WhatsApp (pendiente validar con el cliente).
- Win Transfer ofrece **solo servicio exclusivo** (no existe compartido; no poner selector de tipo de servicio).
- Origen de todas las rutas: **Aeropuerto Carriel Sur** (se asume mismo valor en ambos sentidos, por confirmar).

| Destino | Valor original | −30% Banco de Chile |
|---|---|---|
| Concepción Centro | $15.000 | $10.500 |
| Hoteles Holliday / Wyndham Pettra / Diego de Almagro | $10.000 | $7.000 |
| Terminal de Buses Collao | $15.000 | $10.500 |
| Talcahuano | $30.000 | $21.000 |
| Hualpén | $25.000 | $17.500 |
| San Pedro de la Paz | $25.000 | $17.500 |
| Chiguayante | $35.000 | $24.500 |
| Penco-Lirquén | $35.000 | $24.500 |
| Coronel-Lota | $35.000 | $24.500 |
| El Venado-Idahue | $30.000 | $21.000 |
| Tomé | $45.000 | $31.500 |
| Dichato-Pingueral | $50.000 | $35.000 |
| Florida | $110.000 | $77.000 |
| Quillón | $120.000 | $84.000 |
| Chillán | $150.000 | $105.000 |
| Los Ángeles | $150.000 | $105.000 |
| Talca | $200.000 | $140.000 |
| Termas de Chillán | $250.000 | $175.000 |
| Temuco | $450.000 | $315.000 |
| Valdivia | $550.000 | $385.000 |
| Santiago | $580.000 | $406.000 |

## Estructura de páginas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/es/` | `pages/[lang]/index.astro` | Inicio con MiniBookingForm |
| `/es/quienes-somos/` | `pages/[lang]/quienes-somos.astro` | Historia, misión, atributos, CTA a cobertura |
| `/es/servicios/` | `pages/[lang]/servicios.astro` | 6 servicios |
| `/es/convenio/` | `pages/[lang]/convenio.astro` | Convenio corporativo y formas de pago |
| `/es/cobertura/` | `pages/[lang]/cobertura.astro` | Mapa interactivo de Chile + destinos turísticos |
| `/es/contacto/` | `pages/[lang]/contacto.astro` | SmartForm (reserva / convenio / trabaja con nosotros) |
| `/es/terminos/` | `pages/[lang]/terminos.astro` | Términos (pendiente texto legal) |
| `/es/confirmacion/` | `pages/[lang]/confirmacion.astro` | Resultado del pago Webpay (`?status=ok\|aborted\|rejected\|error`), noindex, WhatsApp con orden pre-escrita |

> La página `/flota/` fue eliminada. Desde 2026-06-15 hay **fotos de sesión fotográfica profesional** integradas en hero (video + banners), servicios, conductores, aeropuerto, historia y quiénes somos.

## Fotos / imágenes

- **Originales** del cliente en `media/fotos/` (raíz, **gitignored**, no se despliegan).
- **Optimizadas** (webp) en `public/images/`, generadas con `scripts/optimize-photos.mjs` (sharp). Para cambiar/añadir fotos: editar el array `JOBS` del script y `node scripts/optimize-photos.mjs`.
- **Hero del inicio**: video en loop (`/images/herovideo.mp4`) con poster/fallback `hero-van.webp`. Se pausa si `prefers-reduced-motion`. `HeroSlideshow.astro` existe pero ya no se usa en el inicio.
- **Servicios**: `src/data/serviceImages.ts` mapea `id`→`/images/servicio-*.webp`; lo usan la portada y `/servicios`.
- **Quiénes somos**: banner + foto en Historia (alt en `about.bannerAlt` / `about.historyAlt`).
- ⚠️ Los vehículos llevan marca **"transferwin.cl" / logo "WIN"** (≠ "Win Transfer" / wintransfer.cl). No usar de forma protagónica la foto donde se lee grande "TRANSFERWIN.CL".

## Componentes clave

- **`MiniBookingForm.astro`** — Widget hero del inicio: 3 tabs de tipo de viaje + botón "Continuar reserva". Al hacer submit redirige a `/contacto/?trip=...` para que SmartForm preseleccione el tipo.
- **`SmartForm.astro`** — Formulario completo en `/contacto/`. Tipos: Reserva / Convenio / Trabaja con nosotros. Al enviar abre WhatsApp con el mensaje armado **y además lo manda por correo vía `POST /api/contacto`** (fire-and-forget; si el correo falla, WhatsApp sigue). Lee URL params (`?trip=`, `?origin=`, etc.) para pre-rellenarse. Con «Hacia/Desde aeropuerto» el campo respectivo entra en *modo aeropuerto* (`data-filter="airport"`): el autocompletado muestra solo aeropuertos y se valida que el valor sea uno de la lista (ya no se bloquea a un único aeropuerto). Incluye validación de formato y límites (pasajeros 1–15, maletas 0–20, nombre solo letras, teléfono por país) con mensajes propios en `form.err*`.
- **`PhoneField.astro`** — Campo de teléfono con selector de país (bandera + prefijo, por defecto Chile +56). Prefijos en `src/data/countryCodes.ts`. Usado dos veces dentro de SmartForm (reserva y trabajo); su lógica de apertura/validación vive en el script de SmartForm.
- **`PriceEstimate.astro`** — Caja "Tarifa estimada" dentro del panel de reserva de SmartForm. Cotiza con `quoteTrip()` (Carriel Sur en un extremo + destino con tarifa): 1–2 pax muestra precio CLP (+nota −30% BdC); 3+ deriva a WhatsApp; ida y vuelta ×2. El botón "Pagar con Webpay" solo se renderiza con `PUBLIC_WEBPAY=on`.
- **`TripTypeTabs.astro`** — Tabs de tipo de viaje con iconos Lucide. Compartido entre MiniBookingForm y SmartForm.
- **`CoverageMap.astro`** — Mapa SVG interactivo de Chile (16 regiones). Hover/click en región la ilumina en el mapa y muestra foto + destinos turísticos desde Wikimedia Commons. Datos en `src/data/regionPhotos.ts` y en `regionPlaces` del JSON de i18n.
- **`Header.astro`** / **`Footer.astro`** — Con segundo número de WhatsApp e Instagram.
- **`LanguageSwitcher.astro`** — Selector de idioma del header: título "Idioma" + desplegable con bandera y el nombre del idioma en su propio idioma (Español/English/Português). Orden y nombres en `languageMeta` (i18n). Usa `FlagIcon`.
- **`FlagIcon.astro`** — Banderas SVG inline (es→Chile, en→EE. UU., pt→Brasil). SVG y no emoji 🇨🇱 porque en Windows de escritorio los emoji de bandera muestran el código de país ("CL") en vez de la bandera.
- **`FloatingActions.astro`** — Botones flotantes apilados abajo a la derecha: Instagram (degradado de marca) + WhatsApp. Reemplazó al antiguo `WhatsAppFloat`.
- **`HelpChat.astro`** — Chat de ayuda "¿Tienes dudas?" (FAQ por opciones, 100% estático, sin backend). Lanzador-píldora abajo a la izquierda + panel. Contenido en la clave `chat` de los JSON i18n; cada FAQ tiene un `id` mapeado a su destino (página o WhatsApp) en el frontmatter. La de "precios" hoy deriva a WhatsApp; con el tarifario oficial (2026-06-30) puede pasar a mostrar precios o enlazar a la calculadora.
- **`PromoPanel.astro`** — Panel flotante de promociones (Banco de Chile -30%, Viaje de Regreso -50%). Botón amarillo sobre HelpChat; cada card tiene CTA a WhatsApp. Contenido en clave `promos` de los JSON i18n.
- **`PageBanner.astro`** — Banner de cabecera con gradiente transparente para todas las páginas interiores. Cada página tiene su propia foto de fondo.
- **`ExperiencePanels.astro`** — Paneles de experiencia en la home: conductor solo, van en esplendor, grupo coordinado.
- **`PlaceholderMedia.astro`** — Placeholder con label para reemplazar por imágenes reales cuando lleguen.

## i18n

```typescript
// Obtener traductor en cualquier página/componente:
const lang = getLangFromUrl(Astro.url);     // o Astro.params.lang as Lang
const t = useTranslations(lang);
t('nav.about')                               // string
t<string[]>('regions')                       // array
t<MyInterface[]>('services.items')           // array de objetos
```

Todas las rutas usan el slug `routes` de `src/i18n/index.ts`:
```typescript
localePath(lang, 'coverage')   // → '/es/cobertura/'
localePath(lang, 'contact')    // → '/es/contacto/'
```

**Nunca incrustar texto directamente en plantillas.** Siempre usar claves en los JSON.

## Reglas del proyecto

- Sitio SSG sin base de datos. El backend permitido son **funciones serverless de Vercel** (`/api/`) para correo (Resend) y pagos (Transbank Webpay) — en desarrollo, ver Pendientes.
- **Pagos en línea: SÍ** (cambio 2026-06-30): Webpay Plus vía API. Secretos (`RESEND_API_KEY`, `TRANSBANK_*`) SOLO en variables de entorno de Vercel, nunca en el repo ni con prefijo `PUBLIC_`. El servidor recalcula siempre el monto desde la tabla de tarifas (nunca confiar en el monto que manda el navegador).
- No inventar tarifas fuera del tarifario oficial, ni datos o textos no entregados por el cliente
- No usar imágenes genéricas de stock para la flota (solo fotos reales cuando lleguen)
- Mobile-first
- El formulario envía por WhatsApp (`wa.me/...?text=...`); se sumará envío por correo a `reservaswin@gmail.com` vía Resend (el WhatsApp no se reemplaza)
- El logo actual se mantiene tal como está

## Pendientes del cliente

- **Credenciales Transbank para pagos online** — ⚠️ el cliente habla de una "máquina física" con un "ID" (suena a POS presencial). Para el sitio se necesita **Webpay Plus (venta online)**: Commerce Code + API Key REST de producción. Aclarar con el cliente. Mientras tanto, desarrollar contra el ambiente de integración de Transbank.
- **Descuento −30% Banco de Chile en Webpay** — no se puede verificar el banco de la tarjeta online; confirmar con el cliente que online se cobra el valor original y el descuento queda informativo/por WhatsApp.
- **Tarifa 3+ pasajeros** — no hay valor público; la calculadora deriva a WhatsApp.
- **Textos institucionales** — historia, misión, descripciones finales de servicios. Vienen de presentación corporativa.
- **Términos y condiciones** — en revisión por abogado. No publicar hasta aprobación.
- **Logos de partners** — uso autorizado pero sin archivos aún. Los nombres ya están en `partners[]` en los JSON.
- **Dominio `wintransfer.cl`** — configurado en Vercel/Cloudflare desde 2026-06-19, pero el **pago en NIC Chile sigue pendiente**; el cliente dijo (2026-06-30) que cierra antes del viernes 2026-07-03. (Ojo: el nombre de marca es **Win Transfer**, dos palabras, pero el dominio es **wintransfer** todo junto.)

## Backend serverless (`/api/`, funciones de Vercel — el build de Astro sigue siendo SSG)

- **`api/contacto.ts`** — `POST {type, message, lang}` → correo a `reservaswin@gmail.com` (Resend). Validación + honeypot `website` + rate limit 5/IP/10min.
- **`api/pago/crear.ts`** — `POST {tarifaId, roundTrip, passengers, lang, message}` → recalcula el monto en el servidor desde `tarifas.ts` (nunca confía en el navegador), manda correo "pago iniciado" (el lead no se pierde aunque abandonen) y crea la transacción Webpay → `{url, token}`.
- **`api/pago/confirmar.ts`** — return de Webpay: commit + correo "✅ pago confirmado" + redirect 303 a `/{lang}/confirmacion/?status=...`.
- **`api/_lib/`** — helpers compartidos (no son endpoints): `contact.ts` (validación + template HTML del correo con logo/tabla), `resend.ts`, `ratelimit.ts`, `webpay.ts`, `config.ts`.
- ⚠️ Imports relativos en `/api` **con extensión `.js`** (el checker de Vercel usa resolución node16; sin extensión → error TS2835).
- **Ambientes Transbank:** sin `TRANSBANK_*` en el entorno → **integración** (tarjeta de prueba VISA `4051 8856 0044 6623`, CVV 123, RUT `11.111.111-1`, clave `123`); con `TRANSBANK_COMMERCE_CODE` + `TRANSBANK_API_KEY` → producción. En Preview el `returnUrl` usa la URL del deploy (`VERCEL_ENV`/`VERCEL_URL`).
- **Variables de entorno:** `RESEND_API_KEY` (Prod+Preview), `PUBLIC_WEBPAY=on` (solo Preview hasta tener credenciales), `TRANSBANK_*` (cuando lleguen), opcionales `RESEND_FROM`/`RESERVAS_EMAIL`. Ver `.env.example`. Secretos NUNCA en el repo ni con prefijo `PUBLIC_`.
- **Activar cobros reales** (cuando el cliente entregue Webpay Plus): agregar `TRANSBANK_COMMERCE_CODE`, `TRANSBANK_API_KEY` y `PUBLIC_WEBPAY=on` en Production → redeploy. Sin tocar código.

## Estado (2026-07-02)

- **PR #1 abierto**: rama `feature/correo-tarifas-webpay` (correo + calculadora + Webpay integración). Review completo hecho; **falta solo el Merge** (decisión del dueño del repo).
- **E2E verificado en Preview**: pago aprobado (orden real, correos con logo/tabla llegando) y pago rechazado (página correcta, sin correo de confirmación). Falta probar el caso "anular" (opcional).
- **Próxima ronda (sin empezar, en brainstorming)**: 1) tarifas visibles en más partes del sitio ("precios desde…", usando `tarifas.ts` como fuente única); 2) banners nuevos para páginas interiores (hay fotos que se ven mal); 3) info útil al cliente en más secciones; 4) actualizar FAQ del HelpChat y dejar explícito que **las ofertas/promos solo se gestionan por WhatsApp**. Pregunta abierta al dueño: dónde exactamente mostrar tarifas (portada / página tarifas / cards de servicios / chat) y qué fotos cambiar.

## Cómo hacer deploy

Cualquier `git push` a `main` dispara un redeploy automático en Vercel.

```bash
git add src/
git commit -m "descripción"
git push
```

### Vercel

- **URL de producción:** https://wintransfer.cl/es/
- **URL Vercel (backup):** https://wintransfer-black.vercel.app/es/
- **Project ID:** `prj_Ou3LB8hssTe2d2SsYq1f3fSYfaf3`
- **Team:** `suryadev-s-projects2` (`team_Ihx1AWw0Z0fYc2D6MOSUagi8`)
- **Inspector:** https://vercel.com/suryadev-s-projects2/wintransfer
- **Node:** 24.x
