import { Link } from "@tanstack/react-router";
import { MapPin, Star, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Comercio, Cupon, Localidad, Plan } from "@/lib/public-data";
import { cn } from "@/lib/utils";

interface CommerceCardProps {
  comercio: Comercio;
  cupon: Cupon | null;
  plan?: Plan | undefined;
  localidad?: Localidad | undefined;
  className?: string;
}

export function CommerceCard({ comercio, cupon, plan, localidad, className }: CommerceCardProps) {
  const destacado = (plan?.tiene_modulo_promocion ?? false) && cupon !== null;
  const portada = cupon?.flyer_url ?? comercio.galeria[0] ?? null;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-md bg-card",
        destacado ? "border-2 border-secondary shadow-premium" : "border border-border",
        className,
      )}
    >
      <Link to="/comercio/$comercioId" params={{ comercioId: comercio.id }} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {portada
          ? <img src={portada} alt={cupon ? `${cupon.titulo} — ${comercio.nombre}` : comercio.nombre} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          : <div className="flex size-full items-center justify-center bg-wave-pattern"><span className="font-display text-5xl font-extrabold text-primary/20">Cruzia</span></div>}
        {destacado ? <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground"><Star className="mr-1 size-3 fill-current" /> Destacado</Badge> : null}
        {cupon ? <Badge className="absolute bottom-3 right-3 bg-accent text-accent-foreground"><Ticket className="mr-1 size-3" /> Cupón activo</Badge> : null}
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to="/comercio/$comercioId" params={{ comercioId: comercio.id }} className="font-display text-lg font-bold text-primary hover:underline sm:text-xl">{comercio.nombre}</Link>
        {cupon ? <p className="mt-1 text-sm font-semibold text-foreground">{cupon.titulo}</p> : null}
        {localidad ? <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" />{localidad.nombre}</p> : null}
        {destacado ? (
          <Button asChild className="mt-4 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link to="/comercio/$comercioId" params={{ comercioId: comercio.id }}><Ticket className="mr-1.5 size-4" /> Obtener Cupón</Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}