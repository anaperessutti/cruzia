import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Presentacion = Database["public"]["Tables"]["giftbox_presentacion"]["Row"];

export type ExperienciaRegalo = {
  id: string;
  titulo: string;
  lugar: string | null;
  direccion: string | null;
  horarios: string | null;
  lat: number | null;
  lng: number | null;
  vigencia_inicio: string | null;
  vigencia_fin: string | null;
  descripcion: string | null;
  como_canjear: string | null;
  condiciones: string | null;
  canjeada_at: string | null;
};

export type RegaloInfo =
  | { estado: "inexistente" | "cancelado" }
  | {
      estado: "ok";
      completado: boolean;
      agasajado: string | null;
      firma: string | null;
      ocasion: string | null;
      dedicatoria: string | null;
      formato: "digital" | "fisico";
      codigo: string;
      experiencias: ExperienciaRegalo[];
    };
export type RegaloOk = Extract<RegaloInfo, { estado: "ok" }>;

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getRegalo(token: string): Promise<RegaloInfo> {
  const { data, error } = await supabase.rpc("giftbox_regalo_info", { p_token: token });
  if (error) throw error;
  return data as unknown as RegaloInfo;
}

export async function getPresentacion(): Promise<Presentacion | null> {
  const { data } = await supabase.from("giftbox_presentacion").select("*").limit(1).maybeSingle();
  return data;
}

/** Reemplaza {agasajado} en el título de bienvenida. */
export function tituloBienvenida(plantilla: string | null | undefined, agasajado: string | null): string {
  const base = plantilla?.trim() || "¡{agasajado}, tenés un regalo!";
  return base.replace(/\{agasajado\}/g, agasajado?.trim() || "Hola");
}

export function linkMaps(e: Pick<ExperienciaRegalo, "lat" | "lng" | "direccion" | "lugar">): string | null {
  if (e.lat != null && e.lng != null) return `https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`;
  const q = [e.lugar, e.direccion].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

const fechaAR = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR");

export function textoVigencia(e: Pick<ExperienciaRegalo, "vigencia_inicio" | "vigencia_fin">): string | null {
  if (e.vigencia_inicio && e.vigencia_fin) return `Del ${fechaAR(e.vigencia_inicio)} al ${fechaAR(e.vigencia_fin)}`;
  if (e.vigencia_fin) return `Hasta el ${fechaAR(e.vigencia_fin)}`;
  if (e.vigencia_inicio) return `Desde el ${fechaAR(e.vigencia_inicio)}`;
  return null;
}

export const textoCanjeada = (iso: string) => `Canjeada el ${fechaAR(iso)}`;

export const OCASION: Record<string, string> = {
  "cumpleaños": "Cumpleaños",
  aniversario: "Aniversario",
  agradecimiento: "Agradecimiento",
  otra: "",
};

export const REGALO_EJEMPLO: RegaloOk = {
  estado: "ok",
  completado: true,
  agasajado: "Martín",
  firma: "Lucía",
  ocasion: "cumpleaños",
  dedicatoria: "¡Feliz cumple! Que este verano esté lleno de momentos lindos frente al mar.",
  formato: "digital",
  codigo: "CRZ7K4PQ",
  experiencias: [
    {
      id: "ejemplo-1",
      titulo: "Cena para dos frente al mar",
      lugar: "Restaurante de ejemplo",
      direccion: "Costanera 123, San Clemente del Tuyú",
      horarios: "Martes a domingo, de 20 a 00 hs",
      lat: null,
      lng: null,
      vigencia_inicio: null,
      vigencia_fin: "2027-03-31",
      descripcion: "Entrada, principal y postre para dos personas, con una copa de bienvenida.",
      como_canjear: "Reservá por WhatsApp y mostrá tu código al llegar.",
      condiciones: "No incluye bebidas adicionales.",
      canjeada_at: null,
    },
  ],
};
