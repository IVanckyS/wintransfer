# Win Transfer — Contexto para Claude Code

Sitio web estático bilingüe (ES/EN) para Win Transfer, empresa chilena de transporte de pasajeros con 20 años de experiencia.

## Stack

- **Framework:** Astro (SSG, sin backend ni base de datos)
- **CSS:** Tailwind CSS v4 con design tokens en `src/styles/global.css` via `@theme`
- **Idiomas:** ES (default) + EN — strings en `src/i18n/es.json` y `src/i18n/en.json`
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

> La página `/flota/` fue eliminada. Las fotos de flota se agregarán cuando el cliente las entregue (~2026-06-15).

## Componentes clave

- **`MiniBookingForm.astro`** — Widget hero del inicio: 3 tabs de tipo de viaje + botón "Continuar reserva". Al hacer submit redirige a `/contacto/?trip=...` para que SmartForm preseleccione el tipo.
- **`SmartForm.astro`** — Formulario completo en `/contacto/`. Tipos: Reserva / Convenio / Trabaja con nosotros. Al enviar abre WhatsApp con el mensaje armado. Lee URL params (`?trip=`, `?origin=`, etc.) para pre-rellenarse.
- **`TripTypeTabs.astro`** — Tabs de tipo de viaje con iconos Lucide. Compartido entre MiniBookingForm y SmartForm.
- **`CoverageMap.astro`** — Mapa SVG interactivo de Chile (16 regiones). Hover/click en región la ilumina en el mapa y muestra foto + destinos turísticos desde Wikimedia Commons. Datos en `src/data/regionPhotos.ts` y en `regionPlaces` del JSON de i18n.
- **`Header.astro`** / **`Footer.astro`** — Con segundo número de WhatsApp e Instagram.
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

- **Fotos de flota** — sesión fotográfica estimada ~2026-06-15. Reemplazar `PlaceholderMedia` en `flota.astro` (cuando se restaure) con `<img src="/images/vehiculo-X.jpg" />`.
- **Textos institucionales** — historia, misión, descripciones finales de servicios. Vienen de presentación corporativa.
- **Términos y condiciones** — en revisión por abogado. No publicar hasta aprobación.
- **Logos de partners** — uso autorizado pero sin archivos aún. Los nombres ya están en `partners[]` en los JSON.
- **Dominio `wintransfer.cl`** — comprar en NIC Chile, luego agregar en Vercel > Domains. (Ojo: el nombre de marca es **Win Transfer**, dos palabras, pero el dominio es **wintransfer** todo junto.)

## Cómo hacer deploy

Cualquier `git push` a `main` dispara un redeploy automático en Vercel.

```bash
git add src/
git commit -m "descripción"
git push
```

URL actual: https://wintransfer-black.vercel.app/es/
