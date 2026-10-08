import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type NivelTarjeta = "basica" | "pro" | "premium";

interface TarjetaInmersivaProps {
  link: LinkProps;
  imagen: string | null;
  alt: string;
  nivel: NivelTarjeta;
  titulo: string;
  descripcion?: string | null | undefined;
  pildoras?: string[];
  ubicacion?: string | null | undefined;
  etiquetaSuperior?: string | null | undefined;
  insignia?: ReactNode | undefined;
  boton?: string | null;
  className?: string | undefined;
}

/** Pieza inmersiva 4:5: foto a sangre + panel inferior teñido con la propia imagen. */
export function TarjetaInmersiva({ link, imagen, alt, nivel, titulo, descripcion, pildoras = [], ubicacion, etiquetaSuperior, insignia, boton, className }: TarjetaInmersivaProps) {
  const premium = nivel === "premium";
  return (
    <Link
      {...link}
      className={cn(
        "group block h-full rounded-[32px] transition-transform duration-500 ease-out hover:-translate-y-1 active:-translate-y-1",
        premium ? "bg-premium-ring p-[1.5px] shadow-glow-premium" : nivel === "pro" ? "shadow-glow-pro" : "shadow-warm",
        className,
      )}
    >
      <article className={cn("relative isolate flex aspect-[4/5] h-full w-full flex-col justify-end overflow-hidden bg-ink text-primary-foreground", premium ? "rounded-[30.5px]" : "rounded-[32px]")}>
        {imagen ? (
          <>
            <img src={imagen} alt={alt} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]" />
            <img src={imagen} alt="" aria-hidden="true" loading="lazy" className="glass-progressive absolute inset-0 size-full object-cover" />
          </>
        ) : <div className="bg-orb absolute inset-0 opacity-90" />}
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-t from-ink/25 to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {insignia ?? <span />}
          {etiquetaSuperior ? <span className="rounded-full bg-ink/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur-md">{etiquetaSuperior}</span> : null}
        </div>

        <div className="text-shadow-soft relative p-4">
          <h3 className="text-[17px] font-bold leading-tight">{titulo}</h3>
          {descripcion ? <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-primary-foreground/90">{descripcion}</p> : null}
          {pildoras.length > 0 || ubicacion ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {pildoras.map((p) => <span key={p} className="rounded-full bg-ink/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-md">{p}</span>)}
              {ubicacion ? <span className="inline-flex items-center gap-1 rounded-full bg-ink/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-md"><MapPin className="size-3" />{ubicacion}</span> : null}
            </div>
          ) : null}
          {boton ? (
            <span className="mt-3.5 flex items-center justify-between rounded-full bg-card py-1 pl-4 pr-1 text-sm font-bold text-foreground [text-shadow:none]">
              {boton}
              <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1"><ArrowRight className="size-4" /></span>
            </span>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export function InsigniaTarjeta({ children, premium = false }: { children: ReactNode; premium?: boolean }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide", premium ? "bg-card text-foreground" : "bg-primary text-primary-foreground")}>{children}</span>;
}
