import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type GiftboxItem = Database["public"]["Tables"]["giftbox_items"]["Row"];
export type GiftboxCategoria = Database["public"]["Enums"]["giftbox_categoria"];
export type GiftboxFormato = Database["public"]["Enums"]["giftbox_formato"];

export const CATEGORIAS: { id: GiftboxCategoria; titulo: string; detalle: string }[] = [
  { id: "Noche", titulo: "Noche", detalle: "Salidas, música y brindis frente al mar." },
  { id: "Sabor", titulo: "Sabor", detalle: "Mesas largas, cocina local y dulces." },
  { id: "Relax", titulo: "Relax", detalle: "Spa, masajes y pausas para respirar." },
  { id: "Diversión", titulo: "Diversión", detalle: "Surf, dunas y aventuras costeras." },
];

export async function getGiftboxItems(): Promise<GiftboxItem[]> {
  const { data, error } = await supabase
    .from("giftbox_items")
    .select(
      "id, categoria, nombre, precio, orden, activo, lugar, descripcion, imagen_url, galeria, comercio_id, direccion, localidad_id, horarios, lat, lng, whatsapp, redes_sociales, vigencia_inicio, vigencia_fin, como_canjear, condiciones, created_at, updated_at",
    )
    .eq("activo", true)
    .order("categoria")
    .order("orden")
    .order("precio");
  if (error) throw error;
  return data ?? [];
}

/** Dónde aplica la experiencia: el campo `lugar` o, si está vacío, el comercio vinculado. */
export function lugarDelItem(
  item: Pick<GiftboxItem, "lugar" | "comercio_id">,
  comercios: readonly { id: string; nombre: string }[],
): string | null {
  const propio = item.lugar?.trim();
  if (propio) return propio;
  return comercios.find((comercio) => comercio.id === item.comercio_id)?.nombre ?? null;
}

export type NuevoPedido = {
  items: GiftboxItem[];
  formato: GiftboxFormato;
  nombre: string;
  whatsapp: string;
  deviceId: string | null;
};

/**
 * Crea el pedido vía función del servidor: sólo se envían los IDs de los items.
 * El precio total se calcula en la base con los precios reales. Devuelve ese total.
 */
export async function crearPedidoGiftbox(pedido: NuevoPedido): Promise<number> {
  const { data, error } = await supabase.rpc("crear_pedido_giftbox", {
    p_item_ids: pedido.items.map((item) => item.id),
    p_formato: pedido.formato,
    p_nombre: pedido.nombre,
    p_whatsapp: pedido.whatsapp,
    ...(pedido.deviceId ? { p_device_id: pedido.deviceId } : {}),
  });
  if (error) throw error;
  return Number((data as { total?: number } | null)?.total ?? 0);
}

export function formatearPrecio(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}
