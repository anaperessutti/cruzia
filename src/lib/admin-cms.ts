import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Comercio = Database["public"]["Tables"]["comercios"]["Row"];
export type Cupon = Database["public"]["Tables"]["cupones"]["Row"];
export type Localidad = Database["public"]["Tables"]["localidades"]["Row"];
export type Plan = Database["public"]["Tables"]["planes"]["Row"];
export type Rubro = Database["public"]["Tables"]["rubros"]["Row"];
export type Modalidad = Database["public"]["Enums"]["modalidad_cupon"];

/** Bucket privado de imágenes. Ver docs/medidas-imagenes.md por las medidas recomendadas. */
const BUCKET = "medios";
/** Validez de los links firmados: 10 años (el bucket es privado por política del espacio de trabajo). */
const VALIDEZ_LINK_SEG = 60 * 60 * 24 * 3650;

export async function subirImagen(file: File, carpeta: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ruta = `${carpeta}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: errFirma } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(ruta, VALIDEZ_LINK_SEG);
  if (errFirma || !data?.signedUrl) throw errFirma ?? new Error("No pudimos generar el link de la imagen.");
  return data.signedUrl;
}

export type Coleccion = Database["public"]["Tables"]["colecciones"]["Row"];

export type CatalogosCms = {
  localidades: Localidad[];
  planes: Plan[];
  rubros: Rubro[];
  colecciones: Coleccion[];
};

export async function getCatalogos(): Promise<CatalogosCms> {
  const [localidades, planes, rubros, colecciones] = await Promise.all([
    supabase.from("localidades").select("*").order("nombre"),
    supabase.from("planes").select("*").order("prioridad_orden"),
    supabase.from("rubros").select("*").order("nombre"),
    supabase.from("colecciones").select("*").order("orden"),
  ]);
  const err = [localidades.error, planes.error, rubros.error, colecciones.error].find(Boolean);
  if (err) throw err;
  return {
    localidades: localidades.data ?? [],
    planes: planes.data ?? [],
    rubros: rubros.data ?? [],
    colecciones: colecciones.data ?? [],
  };
}

/** Colecciones temáticas asignadas a un comercio. */
export async function getColeccionesDeComercio(comercioId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("comercio_colecciones")
    .select("coleccion_id")
    .eq("comercio_id", comercioId);
  if (error) throw error;
  return (data ?? []).map((r) => r.coleccion_id);
}

/** Reemplaza las colecciones del comercio por la selección actual. */
export async function guardarColeccionesDeComercio(comercioId: string, ids: string[]) {
  const { error: errBorrar } = await supabase
    .from("comercio_colecciones")
    .delete()
    .eq("comercio_id", comercioId);
  if (errBorrar) throw errBorrar;
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("comercio_colecciones")
    .insert(ids.map((coleccion_id) => ({ comercio_id: comercioId, coleccion_id })));
  if (error) throw error;
}

export async function getComerciosAdmin(): Promise<Comercio[]> {
  const { data, error } = await supabase.from("comercios").select("*").order("nombre");
  if (error) throw error;
  return data ?? [];
}

export async function getComercio(id: string): Promise<Comercio | null> {
  const { data, error } = await supabase.from("comercios").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export type ComercioForm = {
  nombre: string;
  plan_id: string;
  rubro_id: string | null;
  localidad_id: string | null;
  descripcion: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  horarios: string | null;
  whatsapp: string | null;
  galeria: string[];
  activo: boolean;
  es_indoor: boolean;
  hero_alcance_local: boolean;
};

export async function guardarComercio(id: string | null, form: ComercioForm): Promise<string> {
  if (id) {
    const { error } = await supabase.from("comercios").update(form).eq("id", id);
    if (error) throw error;
    return id;
  }
  const { data, error } = await supabase.from("comercios").insert(form).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function eliminarComercio(id: string) {
  const { error } = await supabase.from("comercios").delete().eq("id", id);
  if (error) throw error;
}

export async function getCuponesAdmin(comercioId?: string): Promise<Cupon[]> {
  let q = supabase.from("cupones").select("*").order("vigencia_fin", { ascending: false });
  if (comercioId) q = q.eq("comercio_id", comercioId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export type CuponForm = {
  comercio_id: string;
  titulo: string;
  descripcion: string | null;
  flyer_url: string | null;
  vigencia_inicio: string;
  vigencia_fin: string;
  modalidad: Modalidad;
  cooldown_dias: number;
  activo: boolean;
  es_favorita_home: boolean;
  es_top_slider: boolean;
  hero_alcance_local: boolean;
};

export async function guardarCupon(id: string | null, form: CuponForm): Promise<string> {
  if (id) {
    const { error } = await supabase.from("cupones").update(form).eq("id", id);
    if (error) throw error;
    return id;
  }
  const { data, error } = await supabase.from("cupones").insert(form).select("id").single();
  if (error) throw error;
  return data.id;
}

export type CuposMes = { usados: number; max: number };

/** Cupos de promociones NUEVAS disponibles este mes calendario según el plan del comercio. */
export async function getCuposMes(comercioId: string): Promise<CuposMes> {
  const { data, error } = await supabase.rpc("cupos_promos_mes", { p_comercio_id: comercioId });
  if (error) throw error;
  return data as unknown as CuposMes;
}

/** True si este cupón ya consumió un cupo del mes calendario actual (reactivarlo es libre). */
export async function cuponActivadoEsteMes(cuponId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("cupon_activado_este_mes", { p_cupon_id: cuponId });
  if (error) throw error;
  return Boolean(data);
}

export function esErrorLimiteMensual(e: unknown): boolean {
  return typeof (e as { message?: string })?.message === "string" &&
    (e as { message: string }).message.includes("LIMITE_MENSUAL_PROMOS");
}

export async function eliminarCupon(id: string) {
  const { error } = await supabase.from("cupones").delete().eq("id", id);
  if (error) throw error;
}

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function enDiasISO(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}
