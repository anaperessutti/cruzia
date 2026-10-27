import {
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { useFilaReveal } from "./fila-reveal";
import { cn } from "@/lib/utils";
import { observeStableResize } from "@/lib/stable-resize";

/**
 * Carrusel horizontal reutilizable para filas del Home.
 * Scroll nativo con snap, sin barra visible; flechas de vidrio solo en desktop.
 * Limita a 6 tarjetas reales y cierra con la tarjeta "Ver todo".
 * No tiene lógica de datos: recibe las tarjetas ya resueltas.
 * La cabecera (rótulo + título, único enlace a "Ver todo" arriba) y la tira de tarjetas se revelan por separado
 * con useFilaReveal (reglas hr- de styles.css), cada una cuando entra en pantalla: las primeras 4 tarjetas
 * entran en cascada con --i y la tarjeta final "Ver todo" es el último paso si la fila tiene 4 o menos.
 * La precarga de imágenes la coordinan dos observers compartidos de filas: cercanía y viewport real.
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
  /** Primera fila visible al cargar: entra solo con CSS, sin observers. */
  primera?: boolean;
  /** Fichas compactas en celular: 2 y un tercio; no se usa en la fila destacada. */
  compacta?: boolean;
  className?: string;
}

export const MAX_TARJETAS_CARRUSEL = 6;
export function seleccionarTarjetasCarrusel<T>(tarjetas: T[]): T[] {
  return tarjetas.slice(0, MAX_TARJETAS_CARRUSEL);
}

const precargasFilas = new Map<Element, (cantidad: number) => void>();
let observerCercano: IntersectionObserver | null = null;
let observerVisible: IntersectionObserver | null = null;
function observarPrecargaFila(el: HTMLElement, cargar: (cantidad: number) => void) {
  if (typeof IntersectionObserver === "undefined") {
    cargar(6);
    return () => {};
  }
  observerCercano ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        precargasFilas.get(entry.target)?.(4);
        observerCercano?.unobserve(entry.target);
      }
    },
    { threshold: 0, rootMargin: "0px 0px 200% 0px" },
  );
  observerVisible ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        precargasFilas.get(entry.target)?.(6);
        precargasFilas.delete(entry.target);
        observerVisible?.unobserve(entry.target);
        observerCercano?.unobserve(entry.target);
      }
      if (!precargasFilas.size) {
        observerVisible?.disconnect();
        observerCercano?.disconnect();
      }
    },
    { threshold: 0 },
  );
  precargasFilas.set(el, cargar);
  observerCercano.observe(el);
  observerVisible.observe(el);
  return () => {
    precargasFilas.delete(el);
    observerCercano?.unobserve(el);
    observerVisible?.unobserve(el);
    if (!precargasFilas.size) {
      observerCercano?.disconnect();
      observerVisible?.disconnect();
    }
  };
}

export function BurbujaFlecha({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:translate-x-1",
        className,
      )}
    >
      <ArrowRight className="size-4" />
    </span>
  );
}

export function CarruselSeccion({
  titulo,
  rotulo,
  destinoUrl,
  tarjetas,
  anchas = [],
  destacada = false,
  primera = false,
  compacta = false,
  className,
}: CarruselSeccionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const seccionRef = useFilaReveal<HTMLElement>(primera);
  const scrollFrame = useRef(0);
  const [puedeAtras, setPuedeAtras] = useState(false);
  const [puedeAdelante, setPuedeAdelante] = useState(false);
  const tarjetasVisibles = seleccionarTarjetasCarrusel(tarjetas);

  const precargar = useCallback(
    (cantidad: number, horizontal = false) => {
      const el = scrollerRef.current;
      if (!el) return;
      const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-carousel-card="real"]'));
      let inicio = 0;
      if (horizontal) {
        const limite = el.scrollLeft + el.clientWidth;
        const visibles = cards.filter(
          (card) => card.offsetLeft < limite && card.offsetLeft + card.offsetWidth > el.scrollLeft,
        );
        const ultima = visibles.at(-1);
        if (!ultima) return;
        inicio = cards.indexOf(ultima) + 1;
      }
      for (const card of cards.slice(inicio, inicio + cantidad)) {
        for (const image of card.querySelectorAll<HTMLImageElement>("img[data-m-card-image]")) {
          image.dispatchEvent(new Event("m-preload"));
        }
      }
    },
    [scrollerRef],
  );

  const medir = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setPuedeAtras(el.scrollLeft > 4);
    setPuedeAdelante(el.scrollLeft < max - 4);
  }, [scrollerRef]);

  useEffect(() => {
    medir();
    const el = scrollerRef.current;
    if (!el) return;
    const stopResize = observeStableResize(() => medir(), [el]);
    const stopPreload = observarPrecargaFila(el, precargar);
    const onScroll = () => {
      if (scrollFrame.current) return;
      scrollFrame.current = requestAnimationFrame(() => {
        scrollFrame.current = 0;
        medir();
        precargar(3, true);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stopResize();
      stopPreload();
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = 0;
    };
  }, [medir, precargar, scrollerRef, tarjetas]);

  const desplazar = (direccion: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const ancho = destacada
    ? "w-[78%] sm:w-[48%] lg:w-[28%]"
    : compacta
      ? "w-[calc((100%_-_8px)_/_2.2)] sm:w-[44%] lg:w-[23%]"
      : "w-[72%] sm:w-[44%] lg:w-[23%]";
  const anchoPremium = destacada
    ? "w-[82.7%] sm:w-[50.9%] lg:w-[29.7%]"
    : "w-[76.3%] sm:w-[46.6%] lg:w-[24.4%]";

  return (
    <section
      ref={seccionRef}
      data-compacta={compacta ? "" : undefined}
      aria-label={titulo}
      className={cn("hr-fila", primera && "hr-primera", "relative", className)}
    >
      {destacada ? (
        <div
          aria-hidden="true"
          className="halo-accent pointer-events-none absolute -top-20 left-1/2 -z-10 h-[34rem] w-[60rem] max-w-[160vw] -translate-x-1/2"
        />
      ) : null}
      <div
        data-hr-obs="cab"
        className="mx-auto flex max-w-7xl items-end justify-between gap-3 px-4 sm:px-6 lg:px-8"
      >
        <a href={destinoUrl} className="min-w-0">
          {rotulo ? (
            <span data-hr="eyebrow" className="text-sobretitulo font-medium block text-primary">
              {rotulo}
            </span>
          ) : null}
          <span data-hr="titulo" className="mt-1 block text-subtitulo text-foreground">
            {titulo}
          </span>
        </a>
      </div>

      <div data-hr-obs="tarjetas" className="relative mt-5">
        <div
          ref={scrollerRef}
          data-m-row=""
          className={cn(
            "flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-10 pt-1 [scrollbar-width:none] sm:scroll-px-6 sm:px-6 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden",
            // Mantener el pie que protege la sombra; la separación se ajusta entre filas.
            compacta && "max-sm:pb-[27px]",
          )}
        >
          {tarjetasVisibles.map((tarjeta, index) => (
            // Cascada solo en las primeras 4; las demás, estáticas. data-hr-blur marca cuáles se ven al entrar
            // (1: las dos primeras, también en celular; 2: la 3.ª y la 4.ª, desde 640 px).
            <div
              key={isValidElement(tarjeta) && tarjeta.key != null ? tarjeta.key : index}
              data-carousel-card="real"
              {...(index < 4
                ? {
                    "data-hr": "card",
                    "data-hr-blur": index < 2 ? "1" : "2",
                    style: { "--i": index } as CSSProperties,
                  }
                : {})}
              className={cn(
                "shrink-0 snap-start",
                anchas[index] && !compacta ? anchoPremium : ancho,
              )}
            >
              {tarjeta}
            </div>
          ))}

          {/* Último paso de la cascada cuando la fila tiene 4 tarjetas o menos; en filas largas queda lejos y es estática. */}
          <div
            data-carousel-card="ver-todo"
            {...(tarjetasVisibles.length <= 4
              ? { "data-hr": "card", style: { "--i": tarjetasVisibles.length } as CSSProperties }
              : {})}
            className={cn("shrink-0 snap-start", ancho)}
          >
            <a
              href={destinoUrl}
              aria-label={`Ver todo en ${titulo}`}
              data-compacta={compacta ? "" : undefined}
              className={cn(
                "ver-todo-card frost-grain group relative flex aspect-[4/5] h-full flex-col justify-end overflow-hidden rounded-[28px] p-5 text-[#1F1E1E] transition-transform duration-500 hover:-translate-y-1",
                compacta && "max-sm:rounded-[20px] max-sm:p-3",
              )}
            >
              <span
                className={cn(
                  "relative text-xl font-semibold leading-tight",
                  compacta && "max-sm:text-sm",
                )}
              >
                Ver todo en <span className="block">{titulo}</span>
              </span>
              <BurbujaFlecha
                className={cn(
                  "relative mt-4 size-10 bg-primary text-primary-foreground",
                  compacta && "max-sm:mt-2 max-sm:size-8",
                )}
              />
            </a>
          </div>
        </div>

        {puedeAtras ? (
          <button
            type="button"
            onClick={() => desplazar(-1)}
            aria-label="Ver tarjetas anteriores"
            className="glass-strong absolute left-4 top-[42%] z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full text-foreground md:grid"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        {puedeAdelante ? (
          <button
            type="button"
            onClick={() => desplazar(1)}
            aria-label="Ver más tarjetas"
            className="glass-strong absolute right-4 top-[42%] z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full text-foreground md:grid"
          >
            <ChevronRight className="size-5" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
