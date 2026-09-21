// Coordenadas aproximadas del centro de cada localidad del Partido de la Costa.
// Se usan solo para preseleccionar la localidad más cercana por GPS.
export const LOCALIDAD_COORDS: Record<string, { lat: number; lng: number }> = {
  "San Clemente": { lat: -36.3569, lng: -56.7222 },
  "Las Toninas": { lat: -36.4833, lng: -56.6917 },
  "Costa Chica": { lat: -36.5069, lng: -56.6931 },
  "Santa Teresita": { lat: -36.5439, lng: -56.6906 },
  "Mar del Tuyú": { lat: -36.5228, lng: -56.6906 },
  "Costa del Este": { lat: -36.6167, lng: -56.6667 },
  "Aguas Verdes": { lat: -36.6431, lng: -56.6764 },
  "La Lucila del Mar": { lat: -36.6597, lng: -56.6764 },
  "San Bernardo": { lat: -36.6889, lng: -56.6764 },
  "Mar de Ajó": { lat: -36.7167, lng: -56.6833 },
  "Nueva Atlantis": { lat: -36.7472, lng: -56.6931 },
  "Punta Médanos": { lat: -36.8333, lng: -56.6833 },
};

export function normalizeLocalidadName(nombre: string) {
  return nombre.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const BY_NORMALIZED = new Map(
  Object.entries(LOCALIDAD_COORDS).map(([nombre, coords]) => [normalizeLocalidadName(nombre), coords]),
);

export function coordsForLocalidad(nombre: string) {
  return BY_NORMALIZED.get(normalizeLocalidadName(nombre)) ?? null;
}
