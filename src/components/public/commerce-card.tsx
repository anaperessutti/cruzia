import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Star, Ticket } from "lucide-react";

import type { Comercio, Cupon, Localidad, Plan } from "@/lib/public-data";
import { cn } from "@/lib/utils";

interface CommerceCardProps {
  comercio: Comercio;
  cupon: Cupon | null;
  plan?: Plan | undefined;
  localidad?: Localidad | undefined;
  className?: string;
}

/** Tarjeta de foto completa: el panel inferior se tiñe con su propia imagen (desenfoque progresivo). */
export function CommerceCard({ comercio, cupon, plan, localidad, className }: CommerceCardProps) {
  const destacado = (plan?.tiene_modulo_promocion ?? false) && cupon !== null;
  const portada = cupon?.flyer_url ?? comercio.galeria[0] ?? null;

  return (
    <article
      className={cn(
        "group relative isolate flex aspect-[3/4] h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-ink text-primary-foreground shadow-warm",
        destacado && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className,
      )}
    >
      <Link to="/comercio/$comercioId" params={{ comercioId: comercio.id }} aria-label={comercio.nombre} className="absolute inset-0 z-0">
        {portada ? (
          <>
            <img src={portada} alt={cupon ? `${cupon.titulo} — ${comercio.nombre}` : comercio.nombre} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            <img src={portada} alt="" aria-hidden="true" loading="lazy" className="glass-progressive absolute inset-0 size-full object-cover" />
          </>
        ) : (
          <div className="bg-orb absolute inset-0 opacity-90" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink/25 via-transparent to-transparent" />
      </Link>

      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
        {destacado ? <span className="glass-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-pill"><Star className="size-3 fill-current" /> Destacado</span> : <span />}
        {cupon ? <span className="glass-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-pill"><Ticket className="size-3" /> Cupón</span> : null}
      </div>

      <div className="pointer-events-none relative z-10 p-4 sm:p-5">
        <Link to="/comercio/$comercioId" params={{ comercioId: comercio.id }} className="pointer-events-auto block font-display text-xl font-bold leading-tight tracking-tight">{comercio.nombre}</Link>
        {cupon ? <p className="mt-1 line-clamp-2 text-sm font-light text-primary-foreground/90">{cupon.titulo}</p> : null}
        {localidad ? <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-xs font-semibold"><MapPin className="size-3.5" />{localidad.nombre}</p> : null}
        {destacado ? (
          <Link to="/comercio/$comercioId" params={{ comercioId: comercio.id }} className="pointer-events-auto mt-4 flex items-center justify-between rounded-full bg-card py-1.5 pl-4 pr-1.5 text-sm font-semibold text-foreground">
            <span className="inline-flex items-center gap-1.5"><Ticket className="size-4 text-primary" /> Obtener Cupón</span>
            <span className="grid size-8 place-items-center rounded-full bg-foreground text-background"><ArrowRight className="size-4" /></span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
