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
 * Medidas de la foto de tarjeta según la pantalla: en celulares de densidad 2 o menos alcanzan 600×750
 * (≈45 % menos píxeles que decodificar y guardar en memoria); desde densidad 2,5 o en pantallas anchas, 800×1000.
 * Se evalúa en el cliente: la foto solo se pide después de montar, nunca durante el render del servidor.
 */
function medidasTarjeta() {
  const dpr = typeof window === "undefined" ? 3 : window.devicePixelRatio || 1;
  const ancha = typeof window !== "undefined" && window.innerWidth >= 1024;
  return dpr < 2.5 && !ancha ? { ancho: 600, alto: 750, calidad: 72 } : { ancho: 800, alto: 1000, calidad: 75 };
}

/**
 * Imagen de tarjeta inmersiva (800×1000 o 600×750 según la pantalla, recorte centrado): convierte el link firmado
 * en la URL pública de render con transformaciones. Requiere el bucket "medios" público;
 * si no lo está, la tarjeta cae al fallback firmado de optimizarImagen.
 */
export function imagenTarjeta<T extends string | null | undefined>(url: T): T {
  if (!url || !url.includes("/storage/v1/object/sign/")) return url;
  const { ancho, alto, calidad } = medidasTarjeta();
  const u = new URL(url);
  u.pathname = u.pathname.replace("/storage/v1/object/sign/", "/storage/v1/render/image/public/");
  u.search = "";
  u.searchParams.set("width", String(ancho));
  u.searchParams.set("height", String(alto));
  u.searchParams.set("resize", "cover");
  u.searchParams.set("quality", String(calidad));
  return u.toString() as T;
}
