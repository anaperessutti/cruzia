import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type FaseAdmin = Database["public"]["Tables"]["huella_solidaria_fases"]["Row"];
export type PostulacionAdmin = Database["public"]["Tables"]["postulaciones_solidarias"]["Row"];
export type FaseForm = Pick<FaseAdmin, "titulo" | "descripcion" | "fecha" | "fotos" | "publicado" | "tipo">;

export async function cargarHuellaAdmin() {
  const [fases, postulaciones] = await Promise.all([
    supabase.from("huella_solidaria_fases").select("*").order("fecha", { ascending: false }),
    supabase.from("postulaciones_solidarias").select("*").order("fecha", { ascending: false }),
  ]);
  if (fases.error || postulaciones.error) throw fases.error ?? postulaciones.error;
  return { fases: fases.data ?? [], postulaciones: postulaciones.data ?? [] };
}

export async function guardarFase(id: string | null, form: FaseForm) {
  const valores = { ...form, titulo: form.titulo.trim(), descripcion: form.descripcion?.trim() || null };
  const consulta = id
    ? supabase.from("huella_solidaria_fases").update(valores).eq("id", id)
    : supabase.from("huella_solidaria_fases").insert(valores);
  const { data, error } = await consulta.select("*").single();
  if (error) throw error;
  return data;
}

export async function publicarFase(id: string, publicado: boolean) {
  const { error } = await supabase.from("huella_solidaria_fases").update({ publicado }).eq("id", id).select("id").single();
  if (error) throw error;
}

export async function archivarFase(id: string) {
  const { error } = await supabase.from("huella_solidaria_fases").update({ tipo: "historial" }).eq("id", id).select("id").single();
  if (error) throw error;
}

export async function eliminarHuella(tabla: "huella_solidaria_fases" | "postulaciones_solidarias", id: string) {
  const { error } = await supabase.from(tabla).delete().eq("id", id).select("id").single();
  if (error) throw error;
}