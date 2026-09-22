/** Orden dinámico de las filas temáticas del Home según clima y hora local. */

/** Orden original de las 12 colecciones (fallback para las no priorizadas). */
export const ORDEN_BASE = [
  "Almuerzos y tapeos",
  "Tardes y antojos",
  "Cenas y tragos",
  "Delivery y take away",
  "Playa y Aire Libre",
  "Juegos y Entretenimiento",
  "Ropa y accesorios",
  "Relax y Belleza",
  "Estadías",
  "Eventos",
  "Mercados y kioscos",
  "Servicios",
];

export const PRIORIDAD_MAL_CLIMA = [
  "Delivery y take away",
  "Juegos y Entretenimiento",
  "Tardes y antojos",
  "Ropa y accesorios",
  "Relax y Belleza",
];

/** Colección que se manda al final cuando hay mal clima. */
export const AL_FINAL_MAL_CLIMA = "Playa y Aire Libre";

export function prioridadPorHora(minutosDelDia: number): string[] {
  if (minutosDelDia >= 6 * 60 && minutosDelDia < 11 * 60 + 30) {
    return ["Tardes y antojos", "Playa y Aire Libre", "Almuerzos y tapeos", "Mercados y kioscos"];
  }
  if (minutosDelDia >= 11 * 60 + 30 && minutosDelDia < 15 * 60) {
    return ["Almuerzos y tapeos", "Playa y Aire Libre", "Delivery y take away", "Mercados y kioscos"];
  }
  if (minutosDelDia >= 15 * 60 && minutosDelDia < 19 * 60 + 30) {
    return ["Tardes y antojos", "Playa y Aire Libre", "Relax y Belleza"];
  }
  return ["Cenas y tragos", "Eventos", "Delivery y take away", "Juegos y Entretenimiento"];
}

/** Minutos desde medianoche en hora de Argentina, sin depender del reloj del visitante. */
export function minutosArgentina(fecha = new Date()): number {
  const partes = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(fecha);
  const hora = Number(partes.find((p) => p.type === "hour")?.value ?? "0");
  const minuto = Number(partes.find((p) => p.type === "minute")?.value ?? "0");
  return (hora % 24) * 60 + minuto;
}

export type ColeccionOrdenable = { id: string; nombre: string };

/**
 * Devuelve las colecciones ordenadas: primero las priorizadas por clima u hora,
 * después el resto en el orden original, y con "Playa y Aire Libre" al final si hay mal clima.
 */
export function ordenarColecciones<T extends ColeccionOrdenable>(
  colecciones: T[],
  opciones: { malClima: boolean; minutosDelDia: number },
): T[] {
  const prioridad = opciones.malClima ? PRIORIDAD_MAL_CLIMA : prioridadPorHora(opciones.minutosDelDia);
  const peso = (nombre: string) => {
    if (opciones.malClima && nombre === AL_FINAL_MAL_CLIMA) return 10_000;
    const indice = prioridad.indexOf(nombre);
    if (indice >= 0) return indice;
    const base = ORDEN_BASE.indexOf(nombre);
    return 1_000 + (base >= 0 ? base : ORDEN_BASE.length);
  };
  return colecciones
    .map((coleccion, indice) => ({ coleccion, indice }))
    .sort((a, b) => {
      const diff = peso(a.coleccion.nombre) - peso(b.coleccion.nombre);
      return diff !== 0 ? diff : a.indice - b.indice;
    })
    .map(({ coleccion }) => coleccion);
}
