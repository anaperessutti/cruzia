import { memo } from "react";

import type { Comercio, Cupon, Localidad, Plan, Rubro } from "@/lib/public-data";
import { InsigniaTarjeta, TarjetaInmersiva, type NivelTarjeta } from "./tarjeta-inmersiva";

interface CommerceCardProps {
  comercio: Comercio;
  cupon: Cupon | null;
  plan?: Plan | undefined;
  localidad?: Localidad | undefined;
  rubro?: Rubro | undefined;
  className?: string;
  compacta?: boolean;
}

/** Nivel visual: Pro/Premium solo si tienen un cupón activo (si no, se ven como Básica). */
export function nivelDeTarjeta(plan: Plan | undefined, cupon: Cupon | null): NivelTarjeta {
  if (!cupon || !(plan?.tiene_modulo_promocion ?? false)) return "basica";
  return plan?.aparece_en_hero_banner ? "premium" : "pro";
}

function venceEn(fin: string) {
  const dias = Math.round((new Date(`${fin}T23:59:59`).getTime() - Date.now()) / 86_400_000);
  if (dias <= 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return dias <= 30 ? `Vence en ${dias} días` : null;
}

export const CommerceCard = memo(function CommerceCard({ comercio, cupon, plan, localidad, rubro, className, compacta }: CommerceCardProps) {
  const nivel = nivelDeTarjeta(plan, cupon);
  const destacado = nivel !== "basica";
  return (
    <TarjetaInmersiva
      link={{ to: "/comercio/$comercioId", params: { comercioId: comercio.id } }}
      imagen={cupon?.flyer_url ?? comercio.galeria[0] ?? null}
      alt={cupon ? `${cupon.titulo} — ${comercio.nombre}` : comercio.nombre}
      nivel={nivel}
      titulo={comercio.nombre}
      descripcion={destacado ? cupon?.titulo : null}
      pildoras={rubro ? [rubro.nombre] : []}
      ubicacion={localidad?.nombre}
      etiquetaSuperior={destacado && cupon ? venceEn(cupon.vigencia_fin) : null}
      insignia={nivel === "premium" ? <InsigniaTarjeta premium>Premium</InsigniaTarjeta> : nivel === "pro" ? <InsigniaTarjeta>⭐ Cupón</InsigniaTarjeta> : undefined}
      boton={destacado ? "Obtener Cupón" : null}
      className={className}
      compacta={compacta}
    />
  );
});
