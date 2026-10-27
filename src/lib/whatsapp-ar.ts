/**
 * Normaliza un número argentino al formato que exige wa.me: 549 + área + número.
 * Quita espacios/símbolos, el prefijo internacional, el 0 inicial y el 15 tras el área.
 */
export function normalizarWhatsappAR(valor: string | null | undefined): string {
  let d = (valor ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("54")) {
    d = d.slice(2);
    if (d.startsWith("9")) d = d.slice(1);
  }
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length === 12) {
    for (const area of [4, 3, 2]) {
      if (d.slice(area, area + 2) === "15") {
        d = d.slice(0, area) + d.slice(area + 2);
        break;
      }
    }
  }
  return `549${d}`;
}

export const NOTA_FISICO =
  "(Si elegiste presentación física, recordá que la preparación requiere 48 hs de anticipación).";

export const VARIABLES_PLANTILLA = [
  "{nombre}",
  "{link_pago}",
  "{link_formulario}",
  "{nota_fisico}",
  "{agasajado}",
  "{remitente}",
  "{link_regalo}",
] as const;

/** Reemplaza {variable} por su valor; las desconocidas quedan tal cual. */
export function armarMensaje(plantilla: string, vars: Record<string, string>): string {
  return plantilla
    .replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] ?? m))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function linkWhatsapp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
