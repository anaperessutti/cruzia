import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Comercio = Database["public"]["Tables"]["comercios"]["Row"];
export type Cupon = Database["public"]["Tables"]["cupones"]["Row"];
export type Localidad = Database["public"]["Tables"]["localidades"]["Row"];
export type Plan = Database["public"]["Tables"]["planes"]["Row"];
export type Rubro = Database["public"]["Tables"]["rubros"]["Row"];
export type Coleccion = Database["public"]["Tables"]["colecciones"]["Row"];
export type ComercioColeccion = Database["public"]["Tables"]["comercio_colecciones"]["Row"];
export type CuponColeccion = Database["public"]["Tables"]["cupon_colecciones"]["Row"];
export type Evento = Database["public"]["Tables"]["eventos"]["Row"];
export type EventoColeccion = Database["public"]["Tables"]["evento_colecciones"]["Row"];
export type ComercioSede = Database["public"]["Tables"]["comercio_sedes"]["Row"];
export type CuponSede = Database["public"]["Tables"]["cupon_sedes"]["Row"];

export type PublicDirectoryData = {
  comercios: Comercio[];
  cupones: Cupon[];
  giftBoxVisible: boolean;
  localidades: Localidad[];
  planes: Plan[];
  rubros: Rubro[];
  colecciones: Coleccion[];
  comercioColecciones: ComercioColeccion[];
  cuponColecciones: CuponColeccion[];
  eventos: Evento[];
  eventoColecciones: EventoColeccion[];
  comercioSedes: ComercioSede[];
  cuponSedes: CuponSede[];
};

async function getPublicDirectory(): Promise<PublicDirectoryData> {
  const hoy = new Date().toISOString().slice(0, 10);
  const [
    comercios,
    cupones,
    config,
    localidades,
    planes,
    rubros,
    colecciones,
    comercioColecciones,
    cuponColecciones,
    eventos,
    eventoColecciones,
    comercioSedes,
    cuponSedes,
  ] = await Promise.all([
    supabase.from("comercios").select("*").order("nombre"),
    supabase.from("cupones").select("*").order("vigencia_fin"),
    supabase.from("configuracion_global").select("gift_box_visible").limit(1).maybeSingle(),
    supabase.from("localidades").select("*").order("nombre"),
    supabase.from("planes").select("*").order("prioridad_orden"),
    supabase.from("rubros").select("*").order("nombre"),
    supabase.from("colecciones").select("*").order("orden"),
    supabase.from("comercio_colecciones").select("*"),
    supabase.from("cupon_colecciones").select("*"),
    // Los eventos vencidos dejan de mostrarse solos: filtro por fechas, sin pausas manuales.
    supabase.from("eventos").select("*").lte("fecha_inicio", hoy).gte("fecha_fin", hoy).order("fecha_inicio"),
    supabase.from("evento_colecciones").select("*"),
  ]);

  const firstError = [
    comercios.error,
    cupones.error,
    config.error,
    localidades.error,
    planes.error,
    rubros.error,
    colecciones.error,
    comercioColecciones.error,
    cuponColecciones.error,
    eventos.error,
    eventoColecciones.error,
  ].find(Boolean);
  if (firstError) throw firstError;

  return {
    comercios: comercios.data ?? [],
    cupones: cupones.data ?? [],
    giftBoxVisible: config.data?.gift_box_visible ?? false,
    localidades: localidades.data ?? [],
    planes: planes.data ?? [],
    rubros: rubros.data ?? [],
    colecciones: colecciones.data ?? [],
    comercioColecciones: comercioColecciones.data ?? [],
    cuponColecciones: cuponColecciones.data ?? [],
    eventos: eventos.data ?? [],
    eventoColecciones: eventoColecciones.data ?? [],
  };
}

export const publicDirectoryOptions = queryOptions({
  queryKey: ["public-directory"],
  queryFn: getPublicDirectory,
  // Sin caché: cualquier cambio hecho desde el panel se ve al recargar o al volver a la pestaña.
  staleTime: 0,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
});
