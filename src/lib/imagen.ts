/**
 * Fotos del bucket privado: pasan por el endpoint de render del almacenamiento,
 * que las entrega comprimidas en WebP/AVIF según el navegador (sin tocar el link firmado).
 * El ancho no se puede pedir por URL: el token firmado no incluye transformaciones.
 */
export function optimizarImagen<T extends string | null | undefined>(url: T): T {
  if (!url || !url.includes("/storage/v1/object/sign/")) return url;
  return (url.replace("/storage/v1/object/sign/", "/storage/v1/render/image/sign/") +
    "&quality=78") as T;
}

/**
 * Imagen de tarjeta inmersiva (800×1000, recorte centrado): convierte el link firmado
 * en la URL pública de render con transformaciones. Requiere el bucket "medios" público;
 * si no lo está, la tarjeta cae al fallback firmado de optimizarImagen.
 * La ficha compacta (celular, filas de Inicio) pide 480×600.
 */
export function imagenTarjeta<T extends string | null | undefined>(url: T, compacta = false): T {
  if (!url || !url.includes("/storage/v1/object/sign/")) return url;
  // Ficha compacta (celular, filas de Inicio): ≈152 px de ancho; 480×600 cubre densidad 3 (≈456 px).
  const chica = compacta && typeof window !== "undefined" && window.innerWidth < 640;
  const u = new URL(url);
  u.pathname = u.pathname.replace("/storage/v1/object/sign/", "/storage/v1/render/image/public/");
  u.search = "";
  u.searchParams.set("width", chica ? "480" : "800");
  u.searchParams.set("height", chica ? "600" : "1000");
  u.searchParams.set("resize", "cover");
  u.searchParams.set("quality", "75");
  return u.toString() as T;
}

/** Valida un punto de enfoque guardado como "X% Y%" (0–100). */
export function posicionValida(valor: string | null | undefined): valor is string {
  if (!valor) return false;
  const m = /^(\d{1,3})% (\d{1,3})%$/.exec(valor);
  return m !== null && Number(m[1]) <= 100 && Number(m[2]) <= 100;
}
