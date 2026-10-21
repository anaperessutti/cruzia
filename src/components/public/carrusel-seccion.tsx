import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { CardReveal, SplitWords, useRevealCabecera } from "./motion";
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
  primeraFila?: boolean;
}

export function BurbujaFlecha({ className }: { className?: string }) {
  return <span className={cn("grid size-8 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:translate-x-1", className)}><ArrowRight className="size-4" /></span>;
}

export function CarruselSeccion({ titulo, rotulo, destinoUrl, tarjetas, anchas = [], destacada = false, className, primeraFila = false }: CarruselSeccionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cabeceraRef = useRevealCabecera<HTMLDivElement>(primeraFila);
  const [puedeAtras, setPuedeAtras] = useState(false);
  const [puedeAdelante, setPuedeAdelante] = useState(false);
  const tarjetasVisibles = tarjetas.slice(0, 10);

  const medir = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setPuedeAtras(el.scrollLeft > 4);
    setPuedeAdelante(el.scrollLeft < max - 4);
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-carousel-card="real"]'));
    const right = el.getBoundingClientRect().right;
    const lastVisible = cards.reduce((last, card, index) => card.getBoundingClientRect().left < right ? index : last, -1);
    cards.slice(0, lastVisible + 4).forEach((card) => card.querySelector("img[data-m-card-image]")?.dispatchEvent(new Event("m-preload")));
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
      <div ref={cabeceraRef} data-m-head="" className="mx-auto flex max-w-7xl items-end justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a href={destinoUrl} className="min-w-0">
          {rotulo ? <span data-m-head-el="eyebrow" className="text-sobretitulo font-medium block text-primary">{rotulo}</span> : null}
          <SplitWords enCabecera className="mt-1 block text-subtitulo text-foreground" text={titulo} />
        </a>
        <a href={destinoUrl} data-m-head-el="cta" className="glass group flex shrink-0 items-center gap-2 rounded-full py-1 pl-4 pr-1 text-sm font-medium text-foreground">
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
            // Stagger solo en las tarjetas del primer encuadre; las de afuera quedan siempre visibles.
            <div
              key={index}
              data-carousel-card="real"
              className={cn("shrink-0 snap-start", anchas[index] ? anchoPremium : ancho)}
            >
              <CardReveal className="h-full" primeraFila={primeraFila} indice={index}>{tarjeta}</CardReveal>
            </div>
          ))}

          <div data-carousel-card="ver-todo" className={cn("shrink-0 snap-start", ancho)}>
            <a href={destinoUrl} aria-label={`Ver todo en ${titulo}`} className="frost frost-grain group relative flex aspect-[4/5] h-full flex-col justify-end overflow-hidden rounded-[28px] p-5 text-[#1F1E1E] transition-transform duration-500 hover:-translate-y-1">
              <span className="relative text-xl font-semibold leading-tight">Ver todo en <span className="block">{titulo}</span></span>
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
