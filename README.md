# Win Transfer — Sitio web

Sitio estático bilingüe (ES/EN) para Win Transfer, empresa chilena de transporte de pasajeros.
Construido con **Astro 5 + Tailwind CSS 4**. Sin backend ni base de datos.

## Cómo correr el proyecto

```bash
npm install
npm run dev      # http://localhost:4321 (redirige a /es/)
npm run build    # genera el sitio estático en dist/
npm run preview  # sirve dist/ localmente
```

## Estructura

- `src/config.ts` — **número de WhatsApp** y datos de contacto (una sola constante para todo el sitio).
- `src/i18n/es.json` / `en.json` — todos los textos del sitio (nunca incrustados en páginas).
- `src/i18n/index.ts` — utilidades i18n y slugs de rutas. Instrucciones para agregar portugués (fase 2) en el comentario inicial.
- `src/pages/[lang]/` — las 7 vistas (un archivo genera ES y EN): inicio, quienes-somos, servicios, convenio, flota, contacto, terminos.
- `src/components/` — Header, Footer, botón flotante de WhatsApp, formulario inteligente, placeholder de medios.
- `src/styles/global.css` — tokens de color de la paleta y tipografías (Sora / Plus Jakarta Sans).

## Formulario inteligente

Presente en el **hero del inicio** y en `/es/contacto/`: selector Reserva / Convenio /
Trabaja con nosotros. Al enviar, arma el mensaje con los campos y abre WhatsApp (`wa.me`)
hacia `WHATSAPP_NUMBER` de `src/config.ts`.

El modo Reserva tiene flujo tipo Transvip: pestañas Hacia/Desde aeropuerto (prellenan
`BOOKING_AIRPORT` de `src/config.ts`), solo ida / ida y vuelta, steppers de pasajeros y
maletas, y resumen del viaje en vivo. La cotización y el pago siguen siendo por WhatsApp
(sin precios ni cobro en línea en esta fase).

Los campos origen/destino tienen **autocompletado de ubicaciones** (aeropuertos y
ciudades de Chile) con dataset local en `src/data/locations.ts` — sin APIs de pago.

## Pendientes

Ver **[ASSETS_PENDIENTES.md](ASSETS_PENDIENTES.md)**: lista completa de imágenes, textos y
datos por confirmar, con la ubicación exacta donde se reemplaza cada uno.
