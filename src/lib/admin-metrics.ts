import { supabase } from "@/integrations/supabase/client";

export type MetricaComercio = {
  comercioId: string;
  comercio: string;
  plan: string;
  prioridadPlan: number;
  localidad: string | null;
  rubro: string | null;
  mes: string;
  totalRedenciones: number;
  totalInteracciones: number;
  cuponTop: string | null;
};

export type DetalleCupon = {
  cuponId: string;
  titulo: string;
  modalidad: string;
  redenciones: number;
};

export type ReporteComercio = {
  metrica: MetricaComercio;
  detalle: DetalleCupon[];
  clicksWhatsapp: number;
  generadoEl: string;
};

export function mesISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export function nombreMes(iso: string): string {
  const [y, m] = iso.split("-");
  const fecha = new Date(Number(y), Number(m) - 1, 1);
  const texto = fecha.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Últimos 12 meses disponibles para elegir en el panel. */
export function mesesRecientes(cantidad = 12): string[] {
  const hoy = new Date();
  return Array.from({ length: cantidad }, (_, i) => mesISO(new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)));
}

type MetricaRow = {
  comercio_id: string;
  mes: string;
  total_redenciones: number;
  comercios: {
    nombre: string;
    planes: { nombre: string; prioridad_orden: number } | null;
    localidades: { nombre: string } | null;
    rubros: { nombre: string } | null;
  } | null;
  cupon_top: { titulo: string } | null;
};

export async function getMetricasMes(mes: string): Promise<MetricaComercio[]> {
  const { data, error } = await supabase
    .from("metricas_mensuales")
    .select(
      "comercio_id, mes, total_redenciones, comercios(nombre, planes(nombre, prioridad_orden), localidades(nombre), rubros(nombre)), cupon_top:cupones!metricas_mensuales_cupon_top_id_fkey(titulo)",
    )
    .eq("mes", mes)
    .order("total_redenciones", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as MetricaRow[]).map((row) => ({
    comercioId: row.comercio_id,
    comercio: row.comercios?.nombre ?? "Comercio",
    plan: row.comercios?.planes?.nombre ?? "Básico",
    prioridadPlan: row.comercios?.planes?.prioridad_orden ?? 3,
    localidad: row.comercios?.localidades?.nombre ?? null,
    rubro: row.comercios?.rubros?.nombre ?? null,
    mes: row.mes,
    totalRedenciones: row.total_redenciones,
    cuponTop: row.cupon_top?.titulo ?? null,
  }));
}

export async function recalcularMetricas(mes: string): Promise<number> {
  const { data, error } = await supabase.rpc("recalcular_metricas_mensuales", { p_mes: mes });
  if (error) throw error;
  return (data as number) ?? 0;
}

function rangoMes(mes: string): { desde: string; hasta: string } {
  const [y, m] = mes.split("-").map(Number);
  const desde = new Date(Date.UTC(y!, m! - 1, 1));
  const hasta = new Date(Date.UTC(y!, m!, 1));
  return { desde: desde.toISOString(), hasta: hasta.toISOString() };
}

export async function getReporteComercio(metrica: MetricaComercio): Promise<ReporteComercio> {
  const { desde, hasta } = rangoMes(metrica.mes);

  const [redRes, clicksRes, cuponesRes] = await Promise.all([
    supabase
      .from("redenciones")
      .select("cupon_id")
      .eq("comercio_id", metrica.comercioId)
      .gte("fecha_redencion", desde)
      .lt("fecha_redencion", hasta),
    supabase
      .from("clicks_whatsapp")
      .select("id", { count: "exact", head: true })
      .eq("comercio_id", metrica.comercioId)
      .gte("created_at", desde)
      .lt("created_at", hasta),
    supabase.from("cupones").select("id, titulo, modalidad").eq("comercio_id", metrica.comercioId),
  ]);

  if (redRes.error) throw redRes.error;
  if (cuponesRes.error) throw cuponesRes.error;

  const conteo = new Map<string, number>();
  for (const r of redRes.data ?? []) {
    conteo.set(r.cupon_id, (conteo.get(r.cupon_id) ?? 0) + 1);
  }

  const detalle: DetalleCupon[] = (cuponesRes.data ?? [])
    .map((c) => ({
      cuponId: c.id,
      titulo: c.titulo,
      modalidad: c.modalidad as string,
      redenciones: conteo.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.redenciones - a.redenciones);

  return {
    metrica,
    detalle,
    clicksWhatsapp: clicksRes.count ?? 0,
    generadoEl: new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" }),
  };
}
