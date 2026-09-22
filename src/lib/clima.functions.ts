import { createServerFn } from "@tanstack/react-start";

/** Centro de lectura del clima para todo el partido: Santa Teresita. */
export const CLIMA_LAT = -36.5416;
export const CLIMA_LNG = -56.6906;

const TTL_MS = 20 * 60 * 1000;

export type ClimaCosta = {
  condicion: string;
  nubosidad: number;
  tempC: number;
  malClima: boolean;
};

const CLIMA_NEUTRO: ClimaCosta = { condicion: "Desconocido", nubosidad: 0, tempC: 20, malClima: false };

/** Caché en memoria del worker: evita consultar OpenWeatherMap en cada visita. */
const cache: { valor: ClimaCosta | null; hasta: number } = { valor: null, hasta: 0 };

export function esMalClima(condicion: string, nubosidad: number, tempC: number): boolean {
  const lluvia = ["Rain", "Drizzle", "Thunderstorm", "Snow"].includes(condicion);
  return lluvia || nubosidad >= 85 || tempC < 14;
}

export const getClimaCosta = createServerFn({ method: "GET" }).handler(async (): Promise<ClimaCosta> => {
  const ahora = Date.now();
  if (cache.valor && cache.hasta > ahora) return cache.valor;

  const apiKey = process.env["OPENWEATHER_API_KEY"];
  if (!apiKey) return CLIMA_NEUTRO;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${CLIMA_LAT}&lon=${CLIMA_LNG}&units=metric&appid=${apiKey}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) return cache.valor ?? CLIMA_NEUTRO;
    const json = (await respuesta.json()) as {
      weather?: { main?: string }[];
      clouds?: { all?: number };
      main?: { temp?: number };
    };
    const condicion = json.weather?.[0]?.main ?? "Desconocido";
    const nubosidad = json.clouds?.all ?? 0;
    const tempC = json.main?.temp ?? 20;
    const valor: ClimaCosta = { condicion, nubosidad, tempC, malClima: esMalClima(condicion, nubosidad, tempC) };
    cache.valor = valor;
    cache.hasta = ahora + TTL_MS;
    return valor;
  } catch {
    // Si la API falla, seguimos con la regla horaria y el Home nunca se rompe.
    return cache.valor ?? CLIMA_NEUTRO;
  }
});
