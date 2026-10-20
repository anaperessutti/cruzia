import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Módulo único de movimiento de entrada (tiempos de linear.app).
 * Variables de tiempo: bloque "Movimiento" en src/styles.css (--m-dur, --m-ease, --m-word-stagger, --m-stagger, --m-dist).
 * - <Reveal>: bloque que entra al scrollear (opacity + translateY).
 * - <RevealGroup>: sus hijos directos entran en cascada (90 ms, tope 8).
 * - <SplitWords>: título palabra por palabra (al scrollear, o dentro de una <Secuencia>).
 * - <Secuencia>: arranca al cargar (dos frames después del primer pintado); sus hijos marcados con
 *   data-m-seq="eyebrow|title|desc|cta|media|row" toman los retrasos del hero.
 * Los elementos solo arrancan ocultos si <html> tiene la clase "m-js" (script inline del <head>).
 */

let observer: IntersectionObserver | null = null;
const callbacks = new Map<Element, () => void>();

function getObserver() {
  if (observer || typeof IntersectionObserver === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = callbacks.get(entry.target);
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
        cb?.();
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  return observer;
}

/** Activa el elemento: will-change solo mientras dura la animación (m-run se quita al terminar). */
function activar(el: HTMLElement) {
  el.classList.add("m-run", "m-in");
  let timer = 0;
  const fin = () => {
    el.classList.remove("m-run");
    el.removeEventListener("transitionend", alTerminar);
    window.clearTimeout(timer);
  };
  // Se espera la transición más larga posible (palabras/cascada) antes de soltar will-change.
  let pendientes = 0;
  const alTerminar = (e: TransitionEvent) => {
    if (e.propertyName !== "opacity") return;
    pendientes += 1;
    if (e.target === el || pendientes > 40) fin();
  };
  el.addEventListener("transitionend", alTerminar);
  timer = window.setTimeout(fin, 3200);
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || el.classList.contains("m-in")) return;
    const io = getObserver();
    if (!io) { el.classList.add("m-in"); return; }
    callbacks.set(el, () => activar(el));
    io.observe(el);
    return () => { callbacks.delete(el); io.unobserve(el); };
  }, [enabled]);
  return ref;
}

type Tag = "div" | "section" | "footer" | "li" | "article" | "ol" | "ul" | "main" | "header";
type Props = { children: ReactNode; className?: string; as?: Tag; style?: CSSProperties };

export function Reveal({ children, className, as: T = "div", style }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return <T ref={ref as never} data-m className={className} style={style}>{children}</T>;
}

export function RevealGroup({ children, className, as: T = "div", style }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return <T ref={ref as never} data-m-group className={className} style={style}>{children}</T>;
}

/** Secuencia de carga (hero de la home o encabezado de página con `pagina`, que arranca 250 ms antes). */
export function Secuencia({ children, className, as: T = "div", style, pagina = false, hero = false, ...rest }: Props & { pagina?: boolean; hero?: boolean; "aria-label"?: string; "aria-roledescription"?: string } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => activar(el)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, []);
  return (
    <T ref={ref as never} data-m-seq-root="" {...(pagina ? { "data-m-page": "" } : {})} {...(hero ? { "data-m-hero": "" } : {})} className={className} style={style} {...rest}>
      {children}
    </T>
  );
}

/** Título dividido en palabras. Fuera de una Secuencia, se revela solo al entrar en pantalla. */
export function SplitWords({ text, as: T = "span", className, enSecuencia = false }: { text: string; as?: ElementType; className?: string; enSecuencia?: boolean }) {
  const ref = useReveal<HTMLElement>(!enSecuencia);
  const palabras = text.trim().split(/\s+/);
  return (
    <T ref={ref} data-m-words="" {...(enSecuencia ? { "data-m-seq": "title" } : {})} aria-label={text} className={cn(enSecuencia && "m-in", className)}>
      {palabras.map((p, i) => (
        <span key={i} aria-hidden="true">
          <span data-m-w="" style={{ "--w": i } as CSSProperties}>{p}</span>
          {i < palabras.length - 1 ? " " : null}
        </span>
      ))}
    </T>
  );
}
