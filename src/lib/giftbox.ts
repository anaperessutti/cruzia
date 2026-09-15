import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type GiftboxItem = Database["public"]["Tables"]["giftbox_items"]["Row"];
export type GiftboxCategoria = Database["public"]["Enums"]["giftbox_categoria"];
export type GiftboxFormato = Database["public"]["Enums"]["giftbox_formato"];

export const CATEGORIAS: { id: GiftboxCategoria; titulo: string; detalle: string }[] = [
  { id: "Noche", titulo: "Noche", detalle: "Salidas, música y brindis frente al mar." },
  { id: "Sabor", titulo: "Sabor", detalle: "Mesas largas, cocina local y dulces." },
  { id: "Relax", titulo: "Relax", detalle: "Spa, masajes y pausas para respirar." },
  { id: "Diversión" as GiftboxCategoria, titulo: "Diversión", detalle: "Surf, dunas y aventuras costeras." },
];

export async function getGiftboxItems(): Promise<GiftboxItem[]> {
  const { data, error } = await supabase
    .from("giftbox_items")
    .select("*")
    .eq("activo", true)
    .order("precio");
  if (error) throw error;
  return data ?? [];
}

export type NuevoPedido = {
  items: GiftboxItem[];
  formato: GiftboxFormato;
  total: number;
  nombre: string;
  whatsapp: string;
  deviceId: string | null;
};

/**
 * Inserta el pedido. IMPORTANTE: nunca encadenar .select() acá:
 * la tabla sólo permite INSERT anónimo, no SELECT.
 */
export async function crearPedidoGiftbox(pedido: NuevoPedido): Promise<void> {
  const { error } = await supabase.from("giftbox_pedidos").insert({
    items_seleccionados: pedido.items.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      categoria: item.categoria,
      precio: item.precio,
    })),
    formato: pedido.formato,
    precio_total: pedido.total,
    contacto_nombre: pedido.nombre,
    contacto_whatsapp: pedido.whatsapp,
    device_id: pedido.deviceId,
  });
  if (error) throw error;
}

export function formatearPrecio(valor: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(valor);
}
