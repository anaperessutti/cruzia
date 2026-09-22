import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Evento, Localidad } from "@/lib/public-data";
import { cn } from "@/lib/utils";

function rango(inicio: string, fin: string) {
  const fmt = (valor: string) =>
    new Date(`${valor}T00:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  return inicio === fin ? fmt(inicio) : `${fmt(inicio)} al ${fmt(fin)}`;
}

export function EventoCard({
  evento,
  localidad,
  className,
}: {
  evento: Evento;
  localidad?: Localidad | undefined;
  className?: string;
}) {
  return (
    <article className={cn("group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card", className)}>
      <Link to="/eventos/$eventoId" params={{ eventoId: evento.id }} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {evento.imagen_url
          ? <img src={evento.imagen_url} alt={evento.titulo} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          : <div className="flex size-full items-center justify-center bg-wave-pattern"><span className="font-display text-5xl font-extrabold text-primary/20">AUNA</span></div>}
        <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground"><CalendarDays className="mr-1 size-3" /> Evento</Badge>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to="/eventos/$eventoId" params={{ eventoId: evento.id }} className="font-display text-lg font-bold text-primary hover:underline sm:text-xl">{evento.titulo}</Link>
        <p className="mt-1 text-sm font-semibold text-foreground">{rango(evento.fecha_inicio, evento.fecha_fin)}</p>
        {localidad ? <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" />{localidad.nombre}</p> : null}
      </div>
    </article>
  );
}
