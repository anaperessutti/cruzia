import { createContext, useContext } from "react";

import type { Coords } from "@/lib/geo";
import type { Comercio, Cupon, PublicDirectoryData } from "@/lib/public-data";

export type Filters = {
  localidadIds: string[];
  coleccionIds: string[];
  soloCupon: boolean;
};

export type GeoStatus = "idle" | "solicitando" | "detectada" | "denegada" | "no-disponible";

/** Una tarjeta de la grilla: o bien una promoción activa, o bien un comercio sin promociones. */
export type TarjetaGrilla = {
  key: string;
  comercio: Comercio;
  cupon: Cupon | null;
};

export type PublicDirectoryContextValue = {
  data: PublicDirectoryData;
  filteredComercios: Comercio[];
  tarjetas: TarjetaGrilla[];
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
