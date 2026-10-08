import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Carrusel horizontal reutilizable para filas del Home.
 * Scroll nativo con snap, sin barra visible; flechas de vidrio solo en desktop.
 * Limita a 10 tarjetas reales y cierra con la tarjeta "Ver todo".
 * No tiene lógica de datos: recibe las tarjetas ya resueltas.
 */
interface CarruselSeccionProps {
  titulo: string;
  /** Micro-rótulo en mayúsculas sobre el título. */
  rotulo?: string;
  destinoUrl: string;
  tarjetas: ReactNode[];
  /** Tarjetas que van ~6% más anchas (Premium), en el mismo orden. */
  anchas?: boolean[];
  /** Fila protagonista (Favoritos): tarjetas más anchas y halo detrás. */
  destacada?: boolean;
  /** Se mantiene por compatibilidad. */
  imagenes?: (string | null)[];
  className?: string;
}

function TituloFila({ texto }: { texto: string }) {
  const palabras = texto.trim().split(/\s+/);
  const corte = Math.max(palabras.length - 1, 0);
  return (
    <>
      {corte > 0 ? <span className="font-light">{palabras.slice(0, corte).join(" ")} </span> : null}
      <span className="font-bold">{palabras.slice(corte).join(" ")}</span>
    </>
  );
}

export function BurbujaFlecha({ className }: { className?: string }) {
  return <span className={cn("grid size-8 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:translate-x-1", className)}><ArrowRight className="size-4" /></span>;
}

export function CarruselSeccion({ titulo, rotulo, destinoUrl, tarjetas, anchas = [], destacada = false, className }: CarruselSeccionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [puedeAtras, setPuedeAtras] = useState(false);
  const [puedeAdelante, setPuedeAdelante] = useState(false);
  const tarjetasVisibles = tarjetas.slice(0, 10);

  const medir = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setPuedeAtras(el.scrollLeft > 4);
    setPuedeAdelante(el.scrollLeft < max - 4);
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
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const ancho = destacada
    ? "w-[78%] sm:w-[48%] lg:w-[28%]"
    : "w-[72%] sm:w-[44%] lg:w-[23%]";
  const anchoPremium = destacada
    ? "w-[82.7%] sm:w-[50.9%] lg:w-[29.7%]"
    : "w-[76.3%] sm:w-[46.6%] lg:w-[24.4%]";

  return (
    <section aria-label={titulo} className={cn("relative", className)}>
      {destacada ? <div aria-hidden="true" className="halo-accent pointer-events-none absolute -top-20 left-1/2 -z-10 h-[34rem] w-[60rem] max-w-[160vw] -translate-x-1/2" /> : null}
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a href={destinoUrl} className="sd-reveal-text min-w-0">
          {rotulo ? <span className="text-pill block text-primary">{rotulo}</span> : null}
          <span className="mt-1 block font-display text-[28px] leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[34px]"><TituloFila texto={titulo} /></span>
        </a>
        <a href={destinoUrl} className="glass group flex shrink-0 items-center gap-2 rounded-full py-1 pl-4 pr-1 text-sm font-semibold text-foreground">
          Ver todo <BurbujaFlecha />
        </a>
      </div>

      <div className="relative mt-5">
        <div
          ref={scrollerRef}
          onScroll={medir}
          className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-10 pt-1 [scrollbar-width:none] sm:scroll-px-6 sm:px-6 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {tarjetasVisibles.map((tarjeta, index) => (
            <div key={index} data-carousel-card="real" className={cn("sd-card-inline shrink-0 snap-start", anchas[index] ? anchoPremium : ancho)}>
              {tarjeta}
            </div>
          ))}

          <div data-carousel-card="ver-todo" className={cn("shrink-0 snap-start", ancho)}>
            <a href={destinoUrl} aria-label={`Ver todo en ${titulo}`} className="group relative isolate flex aspect-[4/5] h-full flex-col justify-end overflow-hidden rounded-[32px] bg-ink p-5 text-primary-foreground shadow-warm transition-transform duration-500 hover:-translate-y-1">
              <span aria-hidden="true" className="bg-orb absolute -right-10 top-8 size-48 rounded-full" />
              <span aria-hidden="true" className="glass-dark absolute -right-6 top-24 h-40 w-[70%] rounded-[28px]" />
              <span className="relative text-xl font-bold leading-tight">Ver todo en <span className="block">{titulo}</span></span>
              <BurbujaFlecha className="relative mt-4 size-10 bg-primary text-primary-foreground" />
            </a>
          </div>
        </div>

        {puedeAtras ? (
          <button type="button" onClick={() => desplazar(-1)} aria-label="Ver tarjetas anteriores" className="glass-strong absolute left-4 top-[42%] z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full text-foreground md:grid">
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        {puedeAdelante ? (
          <button type="button" onClick={() => desplazar(1)} aria-label="Ver más tarjetas" className="glass-strong absolute right-4 top-[42%] z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full text-foreground md:grid">
            <ChevronRight className="size-5" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
