import { supabase } from "@/integrations/supabase/client";

export type EstadoCupon = {
  permitido: boolean;
  motivo?: string;
  cooldown_dias?: number;
  dias_restantes?: number;
  disponible_desde?: string;
  redencion_id?: string;
};

const CACHE_KEY = "ola_cupones_cache";

type CacheEntry = { disponibleDesde: string | null; cooldownDias: number };

function readCache(): Record<string, CacheEntry> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "{}") as Record<string, CacheEntry>;
  } catch {
    return {};
  }
}

/**
 * Caché local SOLO para evitar consultas repetidas y mostrar feedback inmediato.
 * Nunca decide el bloqueo: la fuente de verdad es siempre Supabase.
 */
export function getCachedEstado(deviceId: string, cuponId: string): CacheEntry | null {
  return readCache()[`${deviceId}:${cuponId}`] ?? null;
}

export function setCachedEstado(deviceId: string, cuponId: string, entry: CacheEntry) {
  if (typeof window === "undefined") return;
  try {
    const cache = readCache();
    cache[`${deviceId}:${cuponId}`] = entry;
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* almacenamiento no disponible: seguimos igual, el servidor manda */
  }
}

export async function consultarEstadoCupon(cuponId: string, deviceId: string): Promise<EstadoCupon> {
  const { data, error } = await supabase.rpc("estado_cupon_device", {
    p_cupon_id: cuponId,
    p_device_id: deviceId,
  });
  if (error) throw error;
  return data as unknown as EstadoCupon;
}

export async function activarCuponPresencial(
  cuponId: string,
  deviceId: string,
  qrCodigo: string,
): Promise<EstadoCupon> {
  const { data, error } = await supabase.rpc("activar_cupon_presencial", {
    p_cupon_id: cuponId,
    p_device_id: deviceId,
    p_qr_codigo: qrCodigo,
  });
  if (error) throw error;
  return data as unknown as EstadoCupon;
}

export async function registrarClickWhatsapp(cuponId: string, comercioId: string, deviceId: string) {
  // Métrica sin bloqueo: no escribe en `redenciones`, así no dispara ningún cooldown.
  await supabase.from("clicks_whatsapp").insert({
    cupon_id: cuponId,
    comercio_id: comercioId,
    device_id: deviceId,
  });
}

export function mensajeMotivo(estado: EstadoCupon): string {
  switch (estado.motivo) {
    case "COOLDOWN_ACTIVO":
      return `Ya usaste este cupón. Vas a poder activarlo de nuevo en ${estado.dias_restantes ?? estado.cooldown_dias ?? 0} días.`;
    case "QR_INVALIDO":
      return "Ese QR no corresponde a esta promoción. Pedile al local el código correcto.";
    case "CUPON_NO_VIGENTE":
      return "Esta promoción ya no está vigente.";
    case "MODALIDAD_INVALIDA":
      return "Esta promoción no se activa con QR.";
    case "CUPON_INEXISTENTE":
      return "No encontramos esta promoción.";
    default:
      return "No pudimos activar el cupón. Probá de nuevo en un momento.";
  }
}
