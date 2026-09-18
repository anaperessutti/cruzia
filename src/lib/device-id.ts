const STORAGE_KEY = "auna_device_id";
const LEGACY_STORAGE_KEY = "ola_device_id";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Identificador anónimo del dispositivo. Se genera una sola vez y vive en localStorage.
 * Sirve para identificar al visitante, NUNCA para decidir si un cupón está bloqueado:
 * esa validación es siempre server-side.
 */
export function getDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isUuid(stored)) return stored;
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy && isUuid(legacy)) {
      window.localStorage.setItem(STORAGE_KEY, legacy);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return legacy;
    }
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return null;
  }
}
