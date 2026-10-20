import type { ReactNode } from "react";

import { Secuencia, SplitWords } from "./motion";
import { cn } from "@/lib/utils";

/** Título editorial: liviano, con la palabra clave en Bold. Por defecto, la última palabra. */
export function TituloLigero({ texto, negrita }: { texto: string; negrita?: string | undefined }) {
  const clave = negrita ?? texto.trim().split(/\s+/).slice(-1)[0] ?? "";
  const i = texto.lastIndexOf(clave);
  if (!clave || i < 0) return <span>{texto}</span>;
  return (
    <span>{texto}</span>
  );
}

/** Encabezado de página sobre el lienzo continuo (sin franjas). */
export function PageIntro({ rotulo, titulo, negrita, intro, children, className }: { rotulo: string; titulo: string; negrita?: string | undefined; intro?: ReactNode; children?: ReactNode; className?: string | undefined }) {
  return (
    <Secuencia as="section" pagina className={cn("mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8", className)}>
      <p data-m-seq="eyebrow" className="text-sobretitulo font-medium text-primary">{rotulo}</p>
      <SplitWords as="h1" enSecuencia className="mt-4 max-w-4xl text-titulo text-foreground" text={titulo} />
      {intro ? <div data-m-seq="desc" className="mt-6 max-w-2xl text-cuerpo text-foreground/80">{intro}</div> : null}
      {children ? <div data-m-seq="cta">{children}</div> : null}
    </Secuencia>
  );
}

/** Panel de vidrio que sube superpuesto al título. */
export function PanelVidrio({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass rounded-[32px] p-6 sm:p-8", className)}>{children}</div>;
}
