import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { Coords } from "@/lib/geo";
import { coordsForLocalidad } from "@/lib/localidad-coords";
import { haversineKm, RADIO_CERCANIA_KM } from "@/lib/geo";
import { publicDirectoryOptions, type Comercio, type Cupon, type PublicDirectoryData } from "@/lib/public-data";
import {
  PublicDirectoryContext,
  usePublicDirectory,
  type Filters,
  type GeoStatus,
  type PublicDirectoryContextValue,
  type TarjetaGrilla,
} from "./public-directory-context";

export { usePublicDirectory };
export type { Filters, GeoStatus, PublicDirectoryContextValue, TarjetaGrilla };

const emptyData: PublicDirectoryData = {
  comercios: [],
  cupones: [],
  giftBoxVisible: false,
  localidades: [],
  planes: [],
  rubros: [],
  colecciones: [],
  comercioColecciones: [],
  cuponColecciones: [],
  eventos: [],
  eventoColecciones: [],
  comercioSedes: [],
  cuponSedes: [],
};


function distanceSquared(latA: number, lngA: number, latB: number, lngB: number) {
  return (latA - latB) ** 2 + (lngA - lngB) ** 2;
}

export function PublicDirectoryProvider({ children }: { children: ReactNode }) {
  const query = useQuery(publicDirectoryOptions);
  const data = query.data ?? emptyData;
  const [filters, setFilters] = useState<Filters>({ localidadIds: [], coleccionIds: [], soloCupon: false });
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [detectedLocalidadId, setDetectedLocalidadId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
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
        setUserCoords({ lat: coords.latitude, lng: coords.longitude });
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
        // Preseleccionamos todas las localidades dentro del mismo radio de cercanía (10 km),
        // no solo la más próxima. La usuaria puede editarlas a mano después.
        const usuario = { lat: coords.latitude, lng: coords.longitude };
        const cercanas = candidates
          .filter((c) => haversineKm(usuario, c) <= RADIO_CERCANIA_KM)
          .map((c) => c.id);
        const preseleccion = cercanas.includes(nearest.id) ? cercanas : [nearest.id, ...cercanas];
        setFilters((current) =>
          manualSelectionRef.current || current.localidadIds.length > 0
            ? current
            : { ...current, localidadIds: preseleccion },
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

  // Colecciones por comercio, por promoción y por evento.
  const coleccionesPorComercio = useMemo(() => {
    const mapa = new Map<string, string[]>();
    for (const rel of data.comercioColecciones) {
      const lista = mapa.get(rel.comercio_id);
      if (lista) lista.push(rel.coleccion_id);
      else mapa.set(rel.comercio_id, [rel.coleccion_id]);
    }
    return mapa;
  }, [data.comercioColecciones]);

  const coleccionesPropiasDeCupon = useMemo(() => {
    const mapa = new Map<string, string[]>();
    for (const rel of data.cuponColecciones) {
      const lista = mapa.get(rel.cupon_id);
      if (lista) lista.push(rel.coleccion_id);
      else mapa.set(rel.cupon_id, [rel.coleccion_id]);
    }
    return mapa;
  }, [data.cuponColecciones]);

  const coleccionesPorEvento = useMemo(() => {
    const mapa = new Map<string, string[]>();
    for (const rel of data.eventoColecciones) {
      const lista = mapa.get(rel.evento_id);
      if (lista) lista.push(rel.coleccion_id);
      else mapa.set(rel.evento_id, [rel.coleccion_id]);
    }
    return mapa;
  }, [data.eventoColecciones]);

  /** Si la promoción tiene colecciones propias, mandan ellas; si no, hereda las del comercio. */
  const coleccionesDeCupon = useCallback(
    (cupon: Cupon) => coleccionesPropiasDeCupon.get(cupon.id) ?? coleccionesPorComercio.get(cupon.comercio_id) ?? [],
    [coleccionesPropiasDeCupon, coleccionesPorComercio],
  );
  const coleccionesDeEvento = useCallback(
    (eventoId: string) => coleccionesPorEvento.get(eventoId) ?? [],
    [coleccionesPorEvento],
  );

  const filteredComercios = useMemo(() => {
    const cuponCommerceIds = new Set(data.cupones.map((cupon) => cupon.comercio_id));
    const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
    const coincideColeccion = (comercio: Comercio) => {
      if (filters.coleccionIds.length === 0) return true;
      const propias = coleccionesPorComercio.get(comercio.id) ?? [];
      if (propias.some((id) => filters.coleccionIds.includes(id))) return true;
      // También entra si alguna de sus promociones tiene colecciones propias que coinciden.
      return data.cupones.some(
        (cupon) =>
          cupon.comercio_id === comercio.id &&
          coleccionesDeCupon(cupon).some((id) => filters.coleccionIds.includes(id)),
      );
    };
    const base = data.comercios
      .filter((item) => filters.localidadIds.length === 0 || (item.localidad_id && filters.localidadIds.includes(item.localidad_id)))
      .filter(coincideColeccion)
      .filter((item) => !filters.soloCupon || cuponCommerceIds.has(item.id))
      .filter((item) => planById.get(item.plan_id)?.aparece_en_grilla ?? false);

    // Con "Solo con Cupón" activo se respeta prioridad_orden de la tabla planes.
    // En la vista general los planes se mezclan: orden simple por fecha de alta.
    return filters.soloCupon
      ? base.slice().sort((a, b) => (planById.get(a.plan_id)?.prioridad_orden ?? 99) - (planById.get(b.plan_id)?.prioridad_orden ?? 99))
      : base.slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [data, filters, coleccionesPorComercio, coleccionesDeCupon]);

  // Una tarjeta por promoción activa; los comercios sin promociones aparecen una sola vez.
  // Los eventos vigentes de esas colecciones se mezclan con el resto.
  const tarjetas = useMemo<TarjetaGrilla[]>(() => {
    const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
    const cuponesPorComercio = new Map<string, Cupon[]>();
    for (const cupon of data.cupones) {
      const lista = cuponesPorComercio.get(cupon.comercio_id);
      if (lista) lista.push(cupon);
      else cuponesPorComercio.set(cupon.comercio_id, [cupon]);
    }
    const enColeccion = (ids: string[]) =>
      filters.coleccionIds.length === 0 || ids.some((id) => filters.coleccionIds.includes(id));

    const items: TarjetaGrilla[] = [];
    for (const comercio of filteredComercios) {
      const cupones = (cuponesPorComercio.get(comercio.id) ?? []).filter((cupon) => enColeccion(coleccionesDeCupon(cupon)));
      if (cupones.length === 0) {
        const propias = coleccionesPorComercio.get(comercio.id) ?? [];
        if (!filters.soloCupon && enColeccion(propias)) items.push({ tipo: "comercio", key: comercio.id, comercio, cupon: null });
        continue;
      }
      for (const cupon of cupones) items.push({ tipo: "comercio", key: cupon.id, comercio, cupon });
    }

    if (!filters.soloCupon) {
      for (const evento of data.eventos) {
        if (filters.localidadIds.length > 0 && !(evento.localidad_id && filters.localidadIds.includes(evento.localidad_id))) continue;
        if (!enColeccion(coleccionesDeEvento(evento.id))) continue;
        items.push({ tipo: "evento", key: `evento-${evento.id}`, evento });
      }
    }

    // Mezcla estable: nunca agrupamos a propósito por comercio_id ni por tipo.
    const barajado = (key: string) => {
      let h = 0;
      for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) % 100003;
      return h;
    };
    return items.sort((a, b) => {
      if (filters.soloCupon && a.tipo === "comercio" && b.tipo === "comercio") {
        const diff =
          (planById.get(a.comercio.plan_id)?.prioridad_orden ?? 99) -
          (planById.get(b.comercio.plan_id)?.prioridad_orden ?? 99);
        if (diff !== 0) return diff;
      }
      return barajado(a.key) - barajado(b.key);
    });
  }, [data.cupones, data.planes, data.eventos, filteredComercios, filters, coleccionesDeCupon, coleccionesDeEvento, coleccionesPorComercio]);

  const setLocalidadIds = useCallback((localidadIds: string[]) => {
    manualSelectionRef.current = true;
    setFilters((current) => ({ ...current, localidadIds }));
  }, []);
  const setColeccionIds = useCallback((coleccionIds: string[]) => setFilters((current) => ({ ...current, coleccionIds })), []);
  const setSoloCupon = useCallback((soloCupon: boolean) => setFilters((current) => current.soloCupon === soloCupon ? current : ({ ...current, soloCupon })), []);

  const detectLocation = useCallback(() => {
    manualSelectionRef.current = false;
    setFilters((current) => (current.localidadIds.length === 0 ? current : { ...current, localidadIds: [] }));
    runGeolocation();
  }, [runGeolocation]);

  const value = useMemo<PublicDirectoryContextValue>(() => ({
    data,
    filteredComercios,
    tarjetas,
    coleccionesDeCupon,
    coleccionesDeEvento,
    filters,
    isLoading: query.isLoading,
    geoStatus,
    userCoords,
    detectedLocalidadId,
    detectLocation,
    setLocalidadIds,
    setColeccionIds,
    setSoloCupon,
  }), [data, filteredComercios, tarjetas, coleccionesDeCupon, coleccionesDeEvento, filters, query.isLoading, geoStatus, userCoords, detectedLocalidadId, detectLocation, setLocalidadIds, setColeccionIds, setSoloCupon]);

  return <PublicDirectoryContext.Provider value={value}>{children}</PublicDirectoryContext.Provider>;
}
