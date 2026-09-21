/** Radio de cercanía usado por el Hero y por el orden de las filas del Home. */
export const RADIO_CERCANIA_KM = 10;

export type Coords = { lat: number; lng: number };

/** Distancia real sobre la superficie terrestre, en kilómetros (fórmula de Haversine). */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const rad = (value: number) => (value * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distancia al comercio, o null si no tenemos ubicación del usuario o coordenadas del comercio. */
export function distanciaAComercio(
  usuario: Coords | null,
  comercio: { lat: number | null; lng: number | null },
): number | null {
  if (!usuario || comercio.lat == null || comercio.lng == null) return null;
  return haversineKm(usuario, { lat: comercio.lat, lng: comercio.lng });
}

export function estaCerca(
  usuario: Coords | null,
  comercio: { lat: number | null; lng: number | null },
  radioKm = RADIO_CERCANIA_KM,
): boolean {
  const distancia = distanciaAComercio(usuario, comercio);
  return distancia !== null && distancia <= radioKm;
}
