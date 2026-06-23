# Win Transfer — Contexto para Claude Code

Sitio web estático trilingüe (ES/EN/PT) para Win Transfer, empresa chilena de transporte de pasajeros con 20 años de experiencia.

## Stack

- **Framework:** Astro (SSG, sin backend ni base de datos)
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
- **NO publicar:** RUT, dirección física, tarifas, boleta de honorarios, fechas de pago

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
- **`SmartForm.astro`** — Formulario completo en `/contacto/`. Tipos: Reserva / Convenio / Trabaja con nosotros. Al enviar abre WhatsApp con el mensaje armado. Lee URL params (`?trip=`, `?origin=`, etc.) para pre-rellenarse. Con «Hacia/Desde aeropuerto» el campo respectivo entra en *modo aeropuerto* (`data-filter="airport"`): el autocompletado muestra solo aeropuertos y se valida que el valor sea uno de la lista (ya no se bloquea a un único aeropuerto). Incluye validación de formato y límites (pasajeros 1–15, maletas 0–20, nombre solo letras, teléfono por país) con mensajes propios en `form.err*`.
- **`PhoneField.astro`** — Campo de teléfono con selector de país (bandera + prefijo, por defecto Chile +56). Prefijos en `src/data/countryCodes.ts`. Usado dos veces dentro de SmartForm (reserva y trabajo); su lógica de apertura/validación vive en el script de SmartForm.
- **`TripTypeTabs.astro`** — Tabs de tipo de viaje con iconos Lucide. Compartido entre MiniBookingForm y SmartForm.
- **`CoverageMap.astro`** — Mapa SVG interactivo de Chile (16 regiones). Hover/click en región la ilumina en el mapa y muestra foto + destinos turísticos desde Wikimedia Commons. Datos en `src/data/regionPhotos.ts` y en `regionPlaces` del JSON de i18n.
- **`Header.astro`** / **`Footer.astro`** — Con segundo número de WhatsApp e Instagram.
- **`LanguageSwitcher.astro`** — Selector de idioma del header: título "Idioma" + desplegable con bandera y el nombre del idioma en su propio idioma (Español/English/Português). Orden y nombres en `languageMeta` (i18n). Usa `FlagIcon`.
- **`FlagIcon.astro`** — Banderas SVG inline (es→Chile, en→EE. UU., pt→Brasil). SVG y no emoji 🇨🇱 porque en Windows de escritorio los emoji de bandera muestran el código de país ("CL") en vez de la bandera.
- **`FloatingActions.astro`** — Botones flotantes apilados abajo a la derecha: Instagram (degradado de marca) + WhatsApp. Reemplazó al antiguo `WhatsAppFloat`.
- **`HelpChat.astro`** — Chat de ayuda "¿Tienes dudas?" (FAQ por opciones, 100% estático, sin backend). Lanzador-píldora abajo a la izquierda + panel. Contenido en la clave `chat` de los JSON i18n; cada FAQ tiene un `id` mapeado a su destino (página o WhatsApp) en el frontmatter. La de "precios" deriva a WhatsApp (no se publican tarifas).
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

- Sin backend, sin base de datos, sin pagos en línea
- No inventar tarifas, datos ni textos no entregados por el cliente
- No usar imágenes genéricas de stock para la flota (solo fotos reales cuando lleguen)
- Mobile-first
- El formulario envía por WhatsApp (`wa.me/...?text=...`), no por email (pendiente definir con el cliente)
- El logo actual se mantiene tal como está

## Pendientes del cliente

- **Textos institucionales** — historia, misión, descripciones finales de servicios. Vienen de presentación corporativa.
- **Términos y condiciones** — en revisión por abogado. No publicar hasta aprobación.
- **Logos de partners** — uso autorizado pero sin archivos aún. Los nombres ya están en `partners[]` en los JSON.
- ~~**Dominio `wintransfer.cl`**~~ — ✅ **YA CONFIGURADO** en Vercel (2026-06-19). El sitio responde en `https://wintransfer.cl/`. (Ojo: el nombre de marca es **Win Transfer**, dos palabras, pero el dominio es **wintransfer** todo junto.)

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
