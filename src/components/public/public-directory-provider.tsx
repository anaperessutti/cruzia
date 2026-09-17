import { useQuery } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { coordsForLocalidad } from "@/lib/localidad-coords";
import { publicDirectoryOptions, type Comercio, type Cupon, type PublicDirectoryData } from "@/lib/public-data";

type Filters = {
  localidadIds: string[];
  rubroId: string;
  soloCupon: boolean;
};

export type GeoStatus = "idle" | "solicitando" | "detectada" | "denegada" | "no-disponible";

/** Una tarjeta de la grilla: o bien una promoción activa, o bien un comercio sin promociones. */
export type TarjetaGrilla = {
  key: string;
  comercio: Comercio;
  cupon: Cupon | null;
};

type PublicDirectoryContextValue = {
  data: PublicDirectoryData;
  filteredComercios: Comercio[];
  tarjetas: TarjetaGrilla[];
  filters: Filters;
  isLoading: boolean;
  geoStatus: GeoStatus;
  detectedLocalidadId: string | null;
  detectLocation: () => void;
  setLocalidadIds: (ids: string[]) => void;
  setRubroId: (id: string) => void;
  setSoloCupon: (value: boolean) => void;
};

const emptyData: PublicDirectoryData = {
  comercios: [],
  cupones: [],
  giftBoxVisible: false,
  localidades: [],
  planes: [],
  rubros: [],
};

const PublicDirectoryContext = createContext<PublicDirectoryContextValue | undefined>(undefined);

function distanceSquared(latA: number, lngA: number, latB: number, lngB: number) {
  return (latA - latB) ** 2 + (lngA - lngB) ** 2;
}

export function PublicDirectoryProvider({ children }: { children: ReactNode }) {
  const query = useQuery(publicDirectoryOptions);
  const data = query.data ?? emptyData;
  const [filters, setFilters] = useState<Filters>({ localidadIds: [], rubroId: "", soloCupon: false });
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [detectedLocalidadId, setDetectedLocalidadId] = useState<string | null>(null);
  // Si la usuaria ya eligió localidades a mano, el GPS nunca pisa esa selección.
  const manualSelectionRef = useRef(false);
  const requestedRef = useRef(false);

  const runGeolocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("no-disponible");
      return;
    }
    const candidates = data.localidades
      .map((localidad) => {
        const fromComercio = data.comercios.find(
          (item) => item.localidad_id === localidad.id && item.lat != null && item.lng != null,
        );
        const coords = fromComercio?.lat != null && fromComercio.lng != null
          ? { lat: fromComercio.lat, lng: fromComercio.lng }
          : coordsForLocalidad(localidad.nombre);
        return coords ? { id: localidad.id, ...coords } : null;
      })
      .filter((item): item is { id: string; lat: number; lng: number } => item !== null);

    if (candidates.length === 0) {
      setGeoStatus("no-disponible");
      return;
    }

    setGeoStatus("solicitando");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = candidates
          .slice()
          .sort(
            (a, b) =>
              distanceSquared(coords.latitude, coords.longitude, a.lat, a.lng) -
              distanceSquared(coords.latitude, coords.longitude, b.lat, b.lng),
          )[0];
        if (!nearest) {
          setGeoStatus("no-disponible");
          return;
        }
        setDetectedLocalidadId(nearest.id);
        setGeoStatus("detectada");
        setFilters((current) =>
          manualSelectionRef.current || current.localidadIds.length > 0
            ? current
            : { ...current, localidadIds: [nearest.id] },
        );
      },
      (error) => {
        // Permiso rechazado o error: seguimos con "Toda La Costa", sin romper nada.
        setGeoStatus(error.code === error.PERMISSION_DENIED ? "denegada" : "no-disponible");
      },
      { enableHighAccuracy: false, maximumAge: 600_000, timeout: 10_000 },
    );
  }, [data.comercios, data.localidades]);

  useEffect(() => {
    if (requestedRef.current || data.localidades.length === 0) return;
    requestedRef.current = true;
    runGeolocation();
  }, [data.localidades, runGeolocation]);

  const filteredComercios = useMemo(() => {
    const cuponCommerceIds = new Set(data.cupones.map((cupon) => cupon.comercio_id));
    const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
    const base = data.comercios
      .filter((item) => filters.localidadIds.length === 0 || (item.localidad_id && filters.localidadIds.includes(item.localidad_id)))
      .filter((item) => !filters.rubroId || item.rubro_id === filters.rubroId)
      .filter((item) => !filters.soloCupon || cuponCommerceIds.has(item.id))
      .filter((item) => planById.get(item.plan_id)?.aparece_en_grilla ?? false);

    // Con "Solo con Cupón" activo se respeta prioridad_orden de la tabla planes.
    // En la vista general los planes se mezclan: orden simple por fecha de alta.
    return filters.soloCupon
      ? base.slice().sort((a, b) => (planById.get(a.plan_id)?.prioridad_orden ?? 99) - (planById.get(b.plan_id)?.prioridad_orden ?? 99))
      : base.slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [data, filters]);

  // Una tarjeta por promoción activa; los comercios sin promociones aparecen una sola vez.
  const tarjetas = useMemo<TarjetaGrilla[]>(() => {
    const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
    const cuponesPorComercio = new Map<string, Cupon[]>();
    for (const cupon of data.cupones) {
      const lista = cuponesPorComercio.get(cupon.comercio_id);
      if (lista) lista.push(cupon);
      else cuponesPorComercio.set(cupon.comercio_id, [cupon]);
    }

    const items: TarjetaGrilla[] = [];
    for (const comercio of filteredComercios) {
      const cupones = cuponesPorComercio.get(comercio.id) ?? [];
      if (cupones.length === 0) {
        if (!filters.soloCupon) items.push({ key: comercio.id, comercio, cupon: null });
        continue;
      }
      for (const cupon of cupones) items.push({ key: cupon.id, comercio, cupon });
    }

    // Mezcla estable: nunca agrupamos a propósito por comercio_id.
    const barajado = (key: string) => {
      let h = 0;
      for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) % 100003;
      return h;
    };
    return items.sort((a, b) => {
      if (filters.soloCupon) {
        const diff =
          (planById.get(a.comercio.plan_id)?.prioridad_orden ?? 99) -
          (planById.get(b.comercio.plan_id)?.prioridad_orden ?? 99);
        if (diff !== 0) return diff;
      }
      return barajado(a.key) - barajado(b.key);
    });
  }, [data.cupones, data.planes, filteredComercios, filters.soloCupon]);

  const setLocalidadIds = useCallback((localidadIds: string[]) => {
    manualSelectionRef.current = true;
    setFilters((current) => ({ ...current, localidadIds }));
  }, []);
  const setRubroId = useCallback((rubroId: string) => setFilters((current) => ({ ...current, rubroId })), []);
  const setSoloCupon = useCallback((soloCupon: boolean) => setFilters((current) => current.soloCupon === soloCupon ? current : ({ ...current, soloCupon })), []);

  const detectLocation = useCallback(() => {
    manualSelectionRef.current = false;
    setFilters((current) => (current.localidadIds.length === 0 ? current : { ...current, localidadIds: [] }));
    runGeolocation();
  }, [runGeolocation]);

  const value = useMemo<PublicDirectoryContextValue>(() => ({
    data,
    filteredComercios,
    filters,
    isLoading: query.isLoading,
    geoStatus,
    detectedLocalidadId,
    detectLocation,
    setLocalidadIds,
    setRubroId,
    setSoloCupon,
  }), [data, filteredComercios, filters, query.isLoading, geoStatus, detectedLocalidadId, detectLocation, setLocalidadIds, setRubroId, setSoloCupon]);

  return <PublicDirectoryContext.Provider value={value}>{children}</PublicDirectoryContext.Provider>;
}

export function usePublicDirectory() {
  const context = useContext(PublicDirectoryContext);
  if (!context) throw new Error("usePublicDirectory must be used within PublicDirectoryProvider");
  return context;
}
