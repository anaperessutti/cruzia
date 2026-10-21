import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode, type ImgHTMLAttributes } from "react";

import { clsx } from "clsx";

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

/** Tope de elementos con filter animándose a la vez; los extra entran sin blur (clase m-noblur). */
let filtrosActivos = 0;
const MAX_FILTROS = 24;

/** Activa el elemento: will-change solo mientras dura la animación (m-run se quita al terminar). */
function activar(el: HTMLElement) {
  const conFiltro = filtrosActivos < MAX_FILTROS;
  if (conFiltro) filtrosActivos += 1;
  else el.classList.add("m-noblur");
  el.classList.add("m-run", "m-in");
  let timer = 0;
  const fin = () => {
    el.classList.remove("m-run");
    if (conFiltro) filtrosActivos -= 1;
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
  timer = window.setTimeout(fin, 4800);
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

// Encabezados de colección: observador propio (threshold 0, margen inferior 6%), una sola vez.
let headObserver: IntersectionObserver | null = null;
const headCallbacks = new Map<Element, () => void>();
function getHeadObserver() {
  if (headObserver || typeof IntersectionObserver === "undefined") return headObserver;
  headObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const cb = headCallbacks.get(entry.target);
      headCallbacks.delete(entry.target);
      headObserver?.unobserve(entry.target);
      cb?.();
    }
  }, { threshold: 0, rootMargin: "0px 0px 6% 0px" });
  return headObserver;
}

/** Encabezado de colección: se dispara apenas toca el borde del viewport, igual que las tarjetas. */
export function useRevealCabecera<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains("m-in")) return;
    const io = getHeadObserver();
    if (!io) { el.classList.add("m-in"); return; }
    headCallbacks.set(el, () => activar(el));
    io.observe(el);
    return () => { headCallbacks.delete(el); io.unobserve(el); };
  }, []);
  return ref;
}

// Card-only observers: other reveals and hero sequences retain their configuration.
let cardObserver: IntersectionObserver | null = null;
const cardCallbacks = new Map<Element, (delay: number) => void>();
function getCardObserver() {
  if (cardObserver || typeof IntersectionObserver === "undefined") return cardObserver;
  cardObserver = new IntersectionObserver((entries) => {
    const entering = entries.filter((entry) => entry.isIntersecting);
    const rows = new Map<number, number>();
    for (const entry of entering) {
      const row = Math.round(entry.boundingClientRect.top / 10);
      const step = rows.get(row) ?? 0;
      rows.set(row, step + 1);
      const cb = cardCallbacks.get(entry.target);
      cardCallbacks.delete(entry.target);
      cardObserver?.unobserve(entry.target);
      cb?.(Math.min(step, 3) * 60);
    }
  }, { threshold: 0, rootMargin: "0px 0px 6% 0px" });
  return cardObserver;
}

export function CardReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains("m-in")) return;
    let timer = 0;
    let cleanupTimer = 0;
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      el.classList.add("m-in");
      cleanupTimer = window.setTimeout(() => el.classList.add("m-card-done"), 1100);
    };
    const enter = (delay: number) => {
      el.style.setProperty("--m-card-delay", `${delay}ms`);
      const image = el.querySelector<HTMLImageElement>("img[data-m-card-image]");
      if (!image || image.dataset['ready'] === "true") { reveal(); return; }
      image.dispatchEvent(new Event("m-preload"));
      image.addEventListener("load", reveal, { once: true });
      image.addEventListener("error", reveal, { once: true });
      timer = window.setTimeout(reveal, 400);
    };
    const io = getCardObserver();
    if (io) { cardCallbacks.set(el, enter); io.observe(el); }
    else enter(0);
    return () => {
      cardCallbacks.delete(el); io?.unobserve(el);
      window.clearTimeout(timer); window.clearTimeout(cleanupTimer);
      const image = el.querySelector("img[data-m-card-image]");
      image?.removeEventListener("load", reveal); image?.removeEventListener("error", reveal);
    };
  }, []);
  return <div ref={ref} data-m-card="" className={className}>{children}</div>;
}

let imageObserver: IntersectionObserver | null = null;
const imageCallbacks = new Map<Element, () => void>();
function getImageObserver() {
  if (imageObserver || typeof IntersectionObserver === "undefined") return imageObserver;
  imageObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      imageCallbacks.get(entry.target)?.();
      imageCallbacks.delete(entry.target);
      imageObserver?.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: "0px 0px 150% 0px" });
  return imageObserver;
}

export function CardImage({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const preload = () => setRequested(true);
    const io = getImageObserver();
    el.addEventListener("m-preload", preload);
    if (io) { imageCallbacks.set(el, preload); io.observe(el); }
    else preload();
    return () => { imageCallbacks.delete(el); io?.unobserve(el); el.removeEventListener("m-preload", preload); };
  }, [src]);
  const loaded = async () => {
    try { await ref.current?.decode(); } catch { /* load still supplies a usable image */ }
    setReady(true);
  };
  return <img {...props} ref={ref} src={requested ? src : undefined} loading="eager" decoding="async" data-m-card-image="" data-ready={ready} onLoad={() => void loaded()} />;
}

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
export function SplitWords({ text, as: T = "span", className, enSecuencia = false, negrita, preservarSaltos = false }: { text: string; as?: ElementType; className?: string; enSecuencia?: boolean; negrita?: string; preservarSaltos?: boolean }) {
  const ref = useReveal<HTMLElement>(!enSecuencia);
  const palabras = text.trim().split(/\s+/);
  const saltos = new Set<number>();
  if (preservarSaltos) {
    let indice = 0;
    for (const linea of text.trim().split(/\n+/).slice(0, -1)) {
      indice += linea.trim().split(/\s+/).length;
      saltos.add(indice);
    }
  }
  return (
    <T ref={ref} data-m-words="" {...(enSecuencia ? { "data-m-seq": "title" } : {})} aria-label={text} className={clsx(enSecuencia && "m-in", className)}>
      {palabras.map((p, i) => (
        <span key={i} aria-hidden="true">
          {saltos.has(i) ? <br /> : null}
          <span data-m-w="" className={negrita ? (p === negrita ? "font-bold" : "font-light") : undefined} style={{ "--w": i } as CSSProperties}>{p}</span>
          {i < palabras.length - 1 && !saltos.has(i + 1) ? " " : null}
        </span>
      ))}
    </T>
  );
}
