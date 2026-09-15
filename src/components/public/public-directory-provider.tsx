import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { publicDirectoryOptions, type Comercio, type PublicDirectoryData } from "@/lib/public-data";

type Filters = {
  localidadIds: string[];
  rubroId: string;
  soloCupon: boolean;
};

type PublicDirectoryContextValue = {
  data: PublicDirectoryData;
  filteredComercios: Comercio[];
  filters: Filters;
  isLoading: boolean;
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
  const [didLocate, setDidLocate] = useState(false);

  useEffect(() => {
    if (didLocate || data.comercios.length === 0 || typeof navigator === "undefined" || !navigator.geolocation) return;
    setDidLocate(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = data.comercios
          .filter((item) => item.lat != null && item.lng != null && item.localidad_id)
          .sort((a, b) =>
            distanceSquared(coords.latitude, coords.longitude, a.lat ?? 0, a.lng ?? 0) -
            distanceSquared(coords.latitude, coords.longitude, b.lat ?? 0, b.lng ?? 0),
          )[0];
        if (nearest?.localidad_id) {
          setFilters((current) => current.localidadIds.length > 0 ? current : { ...current, localidadIds: [nearest.localidad_id as string] });
        }
      },
      () => undefined,
      { enableHighAccuracy: false, maximumAge: 600_000, timeout: 8_000 },
    );
  }, [data.comercios, didLocate]);

  const filteredComercios = useMemo(() => {
    const cuponCommerceIds = new Set(data.cupones.map((cupon) => cupon.comercio_id));
    const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
    return data.comercios
      .filter((item) => filters.localidadIds.length === 0 || (item.localidad_id && filters.localidadIds.includes(item.localidad_id)))
      .filter((item) => !filters.rubroId || item.rubro_id === filters.rubroId)
      .filter((item) => !filters.soloCupon || cuponCommerceIds.has(item.id))
      .filter((item) => planById.get(item.plan_id)?.aparece_en_grilla ?? false)
      .sort((a, b) => (planById.get(a.plan_id)?.prioridad_orden ?? 99) - (planById.get(b.plan_id)?.prioridad_orden ?? 99));
  }, [data, filters]);

  const value = useMemo<PublicDirectoryContextValue>(() => ({
    data,
    filteredComercios,
    filters,
    isLoading: query.isLoading,
    setLocalidadIds: (localidadIds) => setFilters((current) => ({ ...current, localidadIds })),
    setRubroId: (rubroId) => setFilters((current) => ({ ...current, rubroId })),
    setSoloCupon: (soloCupon) => setFilters((current) => ({ ...current, soloCupon })),
  }), [data, filteredComercios, filters, query.isLoading]);

  return <PublicDirectoryContext.Provider value={value}>{children}</PublicDirectoryContext.Provider>;
}

export function usePublicDirectory() {
  const context = useContext(PublicDirectoryContext);
  if (!context) throw new Error("usePublicDirectory must be used within PublicDirectoryProvider");
  return context;
}