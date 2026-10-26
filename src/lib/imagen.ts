/**
 * Fotos del bucket privado: pasan por el endpoint de render del almacenamiento,
 * que las entrega comprimidas en WebP/AVIF según el navegador (sin tocar el link firmado).
 * El ancho no se puede pedir por URL: el token firmado no incluye transformaciones.
 */
export function optimizarImagen<T extends string | null | undefined>(url: T): T {
  if (!url || !url.includes("/storage/v1/object/sign/")) return url;
  return url.replace("/storage/v1/object/sign/", "/storage/v1/render/image/sign/") + "&quality=78" as T;
}

/**
 * Imagen de tarjeta inmersiva (800×1000, recorte centrado): convierte el link firmado
 * en la URL pública de render con transformaciones. Requiere el bucket "medios" público;
 * si no lo está, la tarjeta cae al fallback firmado de optimizarImagen.
 */
export function imagenTarjeta<T extends string | null | undefined>(url: T): T {
  if (!url || !url.includes("/storage/v1/object/sign/")) return url;
  const u = new URL(url);
  u.pathname = u.pathname.replace("/storage/v1/object/sign/", "/storage/v1/render/image/public/");
  u.search = "";
  u.searchParams.set("width", "800");
  u.searchParams.set("height", "1000");
  u.searchParams.set("resize", "cover");
  u.searchParams.set("quality", "75");
  return u.toString() as T;
}
