import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Carrusel horizontal reutilizable para filas del Home.
 *
 * - Scroll horizontal nativo (swipe natural en mobile, sin flechas en touch).
 * - En desktop (md+) suma flechas de navegación a los costados.
 * - Limita el recorrido a 10 tarjetas reales y agrega "Ver todo" al final.
 * - En desktop muestra indicadores laterales espejados con fade y flecha.
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
  const tarjetasVisibles = tarjetas.slice(0, 10);
  const tarjetaFondoVerTodo = tarjetas[10] ?? tarjetasVisibles.at(-1);

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
  }, [medir, tarjetasVisibles.length]);

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
          {tarjetasVisibles.map((tarjeta, index) => (
            <div
              key={index}
              data-carousel-card="real"
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

          <div
            data-carousel-card="ver-todo"
            className={cn(
              "shrink-0 snap-start",
              "w-[calc((100%-3.5rem-1rem)/1.6)]",
              "sm:w-[calc((100%-3.5rem-2rem)/2.4)]",
              "md:w-[calc((100%-3.5rem-3rem)/3.3)]",
              "lg:w-[calc((100%-3.5rem-4rem)/4.2)]",
              "2xl:w-[calc((100%-3.5rem-4rem)/5)]",
            )}
          >
            <a
              href={destinoUrl}
              aria-label={`Ver todo: ${titulo}`}
              className="group relative flex h-full min-h-64 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-border px-4 text-center text-primary-foreground shadow-sm"
            >
              {tarjetaFondoVerTodo && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 scale-110 overflow-hidden blur-md [&>*]:h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                >
                  {tarjetaFondoVerTodo}
                </div>
              )}
              <span className="absolute inset-0 bg-primary/55 backdrop-blur-sm transition-colors group-hover:bg-primary/65" />
              <span className="relative flex size-11 items-center justify-center rounded-full border border-primary-foreground/50 bg-background/25 text-primary-foreground shadow-premium backdrop-blur-md transition-transform group-hover:scale-105">
                <Plus className="size-5" />
              </span>
              <span className="relative font-display text-base font-extrabold">Ver todo</span>
            </a>
          </div>
        </div>

        {!sinScroll && puedeAtras && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-24 items-center justify-start bg-gradient-to-l from-background/0 via-background/70 to-background pl-3 md:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => desplazar(-1)}
              aria-label="Ver tarjetas anteriores"
              className="pointer-events-auto rounded-full text-primary hover:bg-background/80"
            >
              <ChevronLeft className="size-6" />
            </Button>
          </div>
        )}

        {!sinScroll && puedeAdelante && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-24 items-center justify-end bg-gradient-to-r from-background/0 via-background/70 to-background pr-3 md:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => desplazar(1)}
              aria-label="Ver más tarjetas"
              className="pointer-events-auto rounded-full text-primary hover:bg-background/80"
            >
              <ChevronRight className="size-6" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
