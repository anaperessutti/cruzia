import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Comercio = Database["public"]["Tables"]["comercios"]["Row"];
export type Cupon = Database["public"]["Tables"]["cupones"]["Row"];
export type Localidad = Database["public"]["Tables"]["localidades"]["Row"];
export type Plan = Database["public"]["Tables"]["planes"]["Row"];
export type Rubro = Database["public"]["Tables"]["rubros"]["Row"];

export type PublicDirectoryData = {
  comercios: Comercio[];
  cupones: Cupon[];
  giftBoxVisible: boolean;
  localidades: Localidad[];
  planes: Plan[];
  rubros: Rubro[];
};

async function getPublicDirectory(): Promise<PublicDirectoryData> {
  const [comercios, cupones, config, localidades, planes, rubros] = await Promise.all([
    supabase.from("comercios").select("*").order("nombre"),
    supabase.from("cupones").select("*").order("vigencia_fin"),
    supabase.from("configuracion_global").select("gift_box_visible").limit(1).maybeSingle(),
    supabase.from("localidades").select("*").order("nombre"),
    supabase.from("planes").select("*").order("prioridad_orden"),
    supabase.from("rubros").select("*").order("nombre"),
  ]);

  const firstError = [comercios.error, cupones.error, config.error, localidades.error, planes.error, rubros.error].find(Boolean);
  if (firstError) throw firstError;

  return {
    comercios: comercios.data ?? [],
    cupones: cupones.data ?? [],
    giftBoxVisible: config.data?.gift_box_visible ?? false,
    localidades: localidades.data ?? [],
    planes: planes.data ?? [],
    rubros: rubros.data ?? [],
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