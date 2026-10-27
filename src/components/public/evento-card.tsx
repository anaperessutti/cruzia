import { memo } from "react";

import type { Evento, Localidad } from "@/lib/public-data";
import { InsigniaTarjeta, TarjetaInmersiva } from "./tarjeta-inmersiva";

function rango(inicio: string, fin: string) {
  const fmt = (valor: string) =>
    new Date(`${valor}T00:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  return inicio === fin ? fmt(inicio) : `${fmt(inicio)} al ${fmt(fin)}`;
}

export const EventoCard = memo(function EventoCard({
  evento,
  localidad,
  className,
  compacta,
}: {
  evento: Evento;
  localidad?: Localidad | undefined;
  className?: string;
  compacta?: boolean;
}) {
  return (
    <TarjetaInmersiva
      link={{ to: "/eventos/$eventoId", params: { eventoId: evento.id } }}
      imagen={evento.imagen_url}
      alt={evento.titulo}
      nivel="basica"
      titulo={evento.titulo}
      descripcion={rango(evento.fecha_inicio, evento.fecha_fin)}
      ubicacion={localidad?.nombre}
      insignia={<InsigniaTarjeta premium>Evento</InsigniaTarjeta>}
      className={className}
      compacta={compacta}
    />
  );
});
