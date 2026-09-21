import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Carrusel horizontal reutilizable para filas del Home.
 *
 * - Scroll horizontal nativo (swipe natural en mobile, sin flechas en touch).
 * - En desktop (md+) suma flechas de navegación a los costados.
 * - Muestra una franja "sticky" con blur y un botón "+" pegada al borde
 *   derecho, superpuesta a la tarjeta que asoma (la "siguiente tarjeta"
 *   apenas entrevida). Al tocarla, navega a `destinoUrl`.
 * - El título del encabezado también es clickeable y lleva al mismo destino.
 * - No tiene lógica de datos: recibe las tarjetas ya resueltas como props.
 *
 * El ancho de cada tarjeta es responsivo: en pantallas muy anchas (2xl)
 * entran 5 tarjetas completas más el borde de la siguiente; en mobile
 * entren menos para que cada tarjeta siga siendo legible.
 */
interface CarruselSeccionProps {
  /** Título de la fila (encabezado clickeable). */
  titulo: string;
  /** Destino del título y del botón "+": URL de la grilla tradicional de la categoría. */
  destinoUrl: string;
  /** Tarjetas a mostrar, ya resueltas. El orden es el orden de la fila. */
  tarjetas: ReactNode[];
  className?: string;
}

export function CarruselSeccion({ titulo, destinoUrl, tarjetas, className }: CarruselSeccionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [puedeAtras, setPuedeAtras] = useState(false);
  const [puedeAdelante, setPuedeAdelante] = useState(false);
  const [sinScroll, setSinScroll] = useState(false);

  const medir = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setPuedeAtras(el.scrollLeft > 4);
    setPuedeAdelante(el.scrollLeft < max - 4);
    setSinScroll(max <= 4);
  }, []);

  useEffect(() => {
    medir();
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(medir);
    observer.observe(el);
    return () => observer.disconnect();
  }, [medir, tarjetas.length]);

  const desplazar = (direccion: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section aria-label={titulo} className={cn("relative", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <a
          href={destinoUrl}
          className="group inline-flex items-center gap-1 font-display text-xl font-extrabold text-primary transition-colors hover:text-secondary sm:text-2xl"
        >
          {titulo}
          <ChevronRight className="size-5 shrink-0 text-secondary transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      <div className="relative mt-4">
        <div
          ref={scrollerRef}
          onScroll={medir}
          className="flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {tarjetas.map((tarjeta, index) => (
            <div
              key={index}
              className={cn(
                "shrink-0 snap-start",
                // Mobile: ~1.6 tarjetas visibles + borde de la siguiente.
                "w-[calc((100%-3.5rem-1rem)/1.6)]",
                "sm:w-[calc((100%-3.5rem-2rem)/2.4)]",
                "md:w-[calc((100%-3.5rem-3rem)/3.3)]",
                "lg:w-[calc((100%-3.5rem-4rem)/4.2)]",
                // Desktop ancho: 5 tarjetas completas + borde de la 6ta.
                "2xl:w-[calc((100%-3.5rem-4rem)/5)]",
              )}
            >
              {tarjeta}
            </div>
          ))}

          {!sinScroll && (
            <a
              href={destinoUrl}
              aria-label={`Ver todo: ${titulo}`}
              className="sticky right-0 z-10 flex w-14 shrink-0 items-center justify-center self-stretch overflow-hidden rounded-2xl border border-border/60 bg-background/35 backdrop-blur-md transition-colors hover:bg-background/55"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-premium">
                <Plus className="size-5" />
              </span>
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => desplazar(-1)}
          disabled={!puedeAtras}
          aria-label="Anterior"
          className="absolute left-0 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-primary shadow-md transition hover:bg-muted disabled:opacity-0 md:flex lg:-left-2"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => desplazar(1)}
          disabled={!puedeAdelante}
          aria-label="Siguiente"
          className="absolute right-0 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-primary shadow-md transition hover:bg-muted disabled:opacity-0 md:flex lg:-right-2"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </section>
  );
}
