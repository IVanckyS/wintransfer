/**
 * Foto real por servicio. Las claves coinciden con el `id` de cada servicio
 * en services.items (src/i18n/*.json) y se usan tanto en la portada
 * (resumen de servicios) como en la página /servicios.
 *
 * Los archivos webp se generan con scripts/optimize-photos.mjs a partir de
 * los originales en media/fotos. Para cambiar una foto, edita ese script y
 * vuelve a ejecutarlo (o reemplaza el .webp en public/images).
 */
export const serviceImages: Record<string, string> = {
  personal: '/images/servicio-personal.webp',
  ejecutivo: '/images/servicio-especiales.webp',
  eventos: '/images/servicio-eventos.webp',
  aeropuerto: '/images/icecar.webp',
  giras: '/images/servicio-giras.webp',
  especiales: '/images/servicio-especiales.webp',
};
