import { createContext, useContext } from "react";

import type { Coords } from "@/lib/geo";
import type { Comercio, Cupon, Evento, PublicDirectoryData } from "@/lib/public-data";

export type Filters = {
  localidadIds: string[];
  coleccionIds: string[];
  soloCupon: boolean;
};

export type GeoStatus = "idle" | "solicitando" | "detectada" | "denegada" | "no-disponible";

/** Una tarjeta: una promoción activa, un comercio sin promociones, o un evento vigente. */
export type TarjetaGrilla =
  | { tipo: "comercio"; key: string; comercio: Comercio; cupon: Cupon | null }
  | { tipo: "evento"; key: string; evento: Evento };

export type PublicDirectoryContextValue = {
  data: PublicDirectoryData;
  filteredComercios: Comercio[];
  tarjetas: TarjetaGrilla[];
  /** Colecciones efectivas de una promoción: las propias si tiene, si no las del comercio. */
  coleccionesDeCupon: (cupon: Cupon) => string[];
  coleccionesDeEvento: (eventoId: string) => string[];
  filters: Filters;
  isLoading: boolean;
  geoStatus: GeoStatus;
  /** Coordenadas reales del GPS del navegador, usadas para el radio de cercanía. */
  userCoords: Coords | null;
  detectedLocalidadId: string | null;
  detectLocation: () => void;
  setLocalidadIds: (ids: string[]) => void;
  setColeccionIds: (ids: string[]) => void;
  setSoloCupon: (value: boolean) => void;
};

export const PublicDirectoryContext = createContext<PublicDirectoryContextValue | undefined>(undefined);

export function usePublicDirectory() {
  const context = useContext(PublicDirectoryContext);
  if (!context) throw new Error("usePublicDirectory must be used within PublicDirectoryProvider");
  return context;
}
