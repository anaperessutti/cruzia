import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { imagenTarjeta, optimizarImagen, posicionValida } from "@/lib/imagen";
import { cn } from "@/lib/utils";
import { CardImage } from "./motion";

export type NivelTarjeta = "basica" | "pro" | "premium";

interface TarjetaInmersivaProps {
  link: LinkProps;
  imagen: string | null;
  alt: string;
  nivel: NivelTarjeta;
  titulo: string;
  descripcion?: string | null | undefined;
  /** Texto breve que reemplaza a la descripción solo en la ficha compacta. */
  descripcionCorta?: string | null | undefined;
  /** Punto de enfoque de la foto ("X% Y%"); null = centrada. */
  posicionImagen?: string | null | undefined;
  pildoras?: string[];
  ubicacion?: string | null | undefined;
  etiquetaSuperior?: string | null | undefined;
  insignia?: ReactNode | undefined;
  boton?: string | null;
  className?: string | undefined;
  compacta?: boolean | undefined;
}

/** Pieza inmersiva 4:5: foto a sangre + panel inferior teñido con la propia imagen. */
export function TarjetaInmersiva({ link, imagen, alt, nivel, titulo, descripcion, descripcionCorta, posicionImagen, pildoras = [], ubicacion, etiquetaSuperior, insignia, boton, className, compacta = false }: TarjetaInmersivaProps) {
  void nivel;
  const enfoque = posicionValida(posicionImagen) ? posicionImagen : undefined;
  // En la ficha compacta se muestra una sola descripción: la corta si existe, si no la de siempre.
  const usaCorta = compacta && Boolean(descripcionCorta);
  const texto = usaCorta ? descripcionCorta : descripcion;
  return (
    <Link
      {...link}
      data-compacta={compacta ? "" : undefined}
      className={cn(
        "immersive-card-link group block h-full rounded-[28px] shadow-card transition-transform duration-500 ease-out hover:-translate-y-1 active:-translate-y-1",
        className,
      )}
    >
      <article data-compacta={compacta ? "" : undefined} className="immersive-card relative isolate flex aspect-[4/5] h-full w-full flex-col justify-end overflow-clip rounded-[28px] text-primary-foreground">
        <div aria-hidden="true" className="frost-neutral absolute inset-0" />
        {imagen ? (
          <>
            <CardImage src={imagenTarjeta(imagen, compacta)} fallbackSrc={optimizarImagen(imagen)} alt={alt} width={800} height={1000} style={enfoque ? { objectPosition: enfoque } : undefined} className="absolute inset-0 z-0 size-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]" />
            <div aria-hidden="true" className="pblur"><i /><i /></div>
          </>
        ) : null}
        <div aria-hidden="true" className="pblur-shade" />

        <div data-m-card-content="" className="tarjeta-top absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          {insignia ?? <span />}
          {etiquetaSuperior ? <span data-compacta-hide="" className="rounded-full bg-ink/40 px-2.5 py-1 text-[11px] font-medium">{etiquetaSuperior}</span> : null}
        </div>

        <div data-m-card-content="" className="tarjeta-body text-shadow-soft relative z-10 p-4">
          <h3 className="text-[17px] font-semibold leading-tight">{titulo}</h3>
          {texto ? <p className={cn("mt-0.5 line-clamp-2 text-[13px] leading-snug text-primary-foreground/90", usaCorta && "oferta-corta")}>{texto}</p> : null}
          {pildoras.length > 0 || ubicacion ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {pildoras.map((p) => <span key={p} data-compacta-hide="" className="rounded-full bg-ink/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide">{p}</span>)}
              {ubicacion ? <span className="inline-flex items-center gap-1 rounded-full bg-ink/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"><MapPin className="size-3" />{ubicacion}</span> : null}
            </div>
          ) : null}
          {boton ? (
            <span data-compacta-hide="" className="mt-3.5 flex items-center justify-between rounded-full border-[1.5px] border-primary-foreground py-1 pl-4 pr-1 text-sm font-medium text-primary-foreground [text-shadow:none]">
              {boton}
              <span className="grid size-9 place-items-center rounded-full text-primary-foreground transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1"><ArrowRight className="size-4" /></span>
            </span>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export function InsigniaTarjeta({ children, premium = false }: { children: ReactNode; premium?: boolean }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide", premium ? "bg-card text-foreground" : "bg-primary text-primary-foreground")}>{children}</span>;
}
