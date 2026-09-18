import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type FaseSolidaria = Database["public"]["Tables"]["huella_solidaria_fases"]["Row"];

/** WhatsApp Business de AUNA (solo dígitos, formato internacional). */
export const WHATSAPP_AUNA = "5492227405370";
export const EMAIL_AUNA = "auna.comunidad@gmail.com";

export function linkWhatsappAuna(mensaje: string) {
  return `https://wa.me/${WHATSAPP_AUNA}?text=${encodeURIComponent(mensaje)}`;
}

async function getFasesSolidarias(): Promise<FaseSolidaria[]> {
  const { data, error } = await supabase
    .from("huella_solidaria_fases")
    .select("*")
    .eq("publicado", true)
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const fasesSolidariasOptions = queryOptions({
  queryKey: ["huella-solidaria-fases"],
  queryFn: getFasesSolidarias,
  staleTime: 60_000,
});

// Importante: estas tablas sólo permiten INSERT anónimo (nunca SELECT),
// así que jamás se encadena .select() después del insert.
export async function enviarPostulacionSolidaria(payload: {
  nombre: string;
  causa: string;
  localidad: string | null;
  descripcion: string | null;
}) {
  const { error } = await supabase.from("postulaciones_solidarias").insert(payload);
  if (error) throw error;
}

export async function enviarLeadComercio(payload: {
  nombre_local: string;
  rubro: string | null;
  localidad: string | null;
  whatsapp: string;
}) {
  const { error } = await supabase.from("leads_comercios").insert(payload);
  if (error) throw error;
}
