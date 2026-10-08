import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Título editorial: liviano, con la palabra clave en Bold. Por defecto, la última palabra. */
export function TituloLigero({ texto, negrita }: { texto: string; negrita?: string | undefined }) {
  const clave = negrita ?? texto.trim().split(/\s+/).slice(-1)[0] ?? "";
  const i = texto.lastIndexOf(clave);
  if (!clave || i < 0) return <span className="font-light">{texto}</span>;
  return (
    <>
      <span className="font-light">{texto.slice(0, i)}</span>
      <span className="font-bold">{clave}</span>
      <span className="font-light">{texto.slice(i + clave.length)}</span>
    </>
  );
}

/** Encabezado de página sobre el lienzo continuo (sin franjas). */
export function PageIntro({ rotulo, titulo, negrita, intro, children, className }: { rotulo: string; titulo: string; negrita?: string | undefined; intro?: ReactNode; children?: ReactNode; className?: string | undefined }) {
  return (
    <section className={cn("mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8", className)}>
      <p className="sd-reveal-text text-pill text-primary">{rotulo}</p>
      <h1 className="sd-reveal-text mt-4 max-w-4xl font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-foreground sm:text-7xl">
        <TituloLigero texto={titulo} negrita={negrita} />
      </h1>
      {intro ? <div className="sd-reveal-text mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{intro}</div> : null}
      {children}
    </section>
  );
}

/** Panel de vidrio que sube superpuesto al título. */
export function PanelVidrio({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass rounded-[32px] p-6 sm:p-8", className)}>{children}</div>;
}
