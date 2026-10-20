/**
 * Fotos del bucket privado: pasan por el endpoint de render del almacenamiento,
 * que las entrega comprimidas en WebP/AVIF según el navegador (sin tocar el link firmado).
 * El ancho no se puede pedir por URL: el token firmado no incluye transformaciones.
 */
export function optimizarImagen<T extends string | null | undefined>(url: T): T {
  if (!url || !url.includes("/storage/v1/object/sign/")) return url;
  return url.replace("/storage/v1/object/sign/", "/storage/v1/render/image/sign/") + "&quality=78" as T;
}
