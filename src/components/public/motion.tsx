import { memo, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode, type ImgHTMLAttributes } from "react";

import { clsx } from "clsx";

/**
 * Módulo único de movimiento de entrada (tiempos de linear.app).
 * Variables de tiempo: bloque "Movimiento" en src/styles.css (--m-dur, --m-ease, --m-word-stagger, --m-stagger, --m-dist).
 * - <Reveal>: bloque que entra al scrollear (opacity + translateY).
 * - <RevealGroup>: sus hijos directos entran en cascada (110 ms, tope 8).
 * - <SplitWords>: título palabra por palabra (al scrollear, o dentro de una <Secuencia>).
 * - <Secuencia>: arranca al cargar (dos frames después del primer pintado); sus hijos marcados con
 *   data-m-seq="eyebrow|title|desc|cta|media|row" toman los retrasos del hero.
 * Los elementos solo arrancan ocultos si <html> tiene la clase "m-js" (script inline del <head>).
 */

/** Única fuente de verdad de los parámetros compartidos de movimiento. */
export const TIEMPOS = {
  dur: 1400,
  easeMove: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeFade: "cubic-bezier(0.4, 0, 0.2, 1)",
  wordStagger: 45,
  stagger: 110,
} as const;

let tiemposAplicados = false;
/** Escribe las CSS vars de movimiento en :root desde TIEMPOS (los valores de styles.css quedan de respaldo). */
export function aplicarTiemposMovimiento() {
  if (tiemposAplicados || typeof document === "undefined") return;
  tiemposAplicados = true;
  const s = document.documentElement.style;
  s.setProperty("--m-dur", `${TIEMPOS.dur}ms`);
  s.setProperty("--m-ease-move", TIEMPOS.easeMove);
  s.setProperty("--m-ease-fade", TIEMPOS.easeFade);
  s.setProperty("--m-word-stagger", `${TIEMPOS.wordStagger}ms`);
  s.setProperty("--m-stagger", `${TIEMPOS.stagger}ms`);
}

/** Cuando un observador compartido se queda sin elementos, se desconecta (se reactiva solo al observar de nuevo). */
function soltarSiVacio(io: IntersectionObserver, mapa: Map<Element, unknown>) {
  if (mapa.size === 0) io.disconnect();
}

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
      if (observer) soltarSiVacio(observer, callbacks);
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
    return () => { callbacks.delete(el); io.unobserve(el); soltarSiVacio(io, callbacks); };
  }, [enabled]);
  return ref;
}

// Observer de borde: threshold 0 y rootMargin 0, igual que las tarjetas (se dispara apenas toca el viewport).
let bordeObserver: IntersectionObserver | null = null;
const bordeCallbacks = new Map<Element, () => void>();
function getBordeObserver() {
  if (bordeObserver || typeof IntersectionObserver === "undefined") return bordeObserver;
  bordeObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const cb = bordeCallbacks.get(entry.target);
      bordeCallbacks.delete(entry.target);
      bordeObserver?.unobserve(entry.target);
      cb?.();
    }
    if (bordeObserver) soltarSiVacio(bordeObserver, bordeCallbacks);
  }, { threshold: 0, rootMargin: "0px 0px 0px 0px" });
  return bordeObserver;
}

/** Revelado al borde del viewport (threshold 0, rootMargin 0), una sola vez. */
export function useRevealBorde<T extends HTMLElement = HTMLDivElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || el.classList.contains("m-in")) return;
    const io = getBordeObserver();
    if (!io) { el.classList.add("m-in"); return; }
    bordeCallbacks.set(el, () => activar(el));
    io.observe(el);
    return () => { bordeCallbacks.delete(el); io.unobserve(el); soltarSiVacio(io, bordeCallbacks); };
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
    if (headObserver) soltarSiVacio(headObserver, headCallbacks);
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
    return () => { headCallbacks.delete(el); io.unobserve(el); soltarSiVacio(io, headCallbacks); };
  }, []);
  return ref;
}

// Card-only observers: other reveals and hero sequences retain their configuration.
let cardObserver: IntersectionObserver | null = null;
const cardCallbacks = new Map<Element, (delay: number) => void>();
function getCardObserver() {
  if (cardObserver || typeof IntersectionObserver === "undefined") return cardObserver;
  cardObserver = new IntersectionObserver((entries) => {
    const rows = new Map<number, IntersectionObserverEntry[]>();
    for (const entry of entries.filter((item) => item.isIntersecting)) {
      // Group the same visual row, then order independently of DOM/observer order.
      // boundingClientRect viene en la entrada: no fuerza lectura de layout.
      const row = Math.round(entry.boundingClientRect.top / 10);
      const group = rows.get(row) ?? [];
      group.push(entry);
      rows.set(row, group);
    }
    for (const group of rows.values()) {
      group.sort((a, b) => a.boundingClientRect.left - b.boundingClientRect.left);
      group.forEach((entry, step) => {
        const cb = cardCallbacks.get(entry.target);
        cardCallbacks.delete(entry.target);
        cardObserver?.unobserve(entry.target);
        cb?.(Math.min(step, 2) * TIEMPOS.stagger);
      });
    }
    if (cardObserver) soltarSiVacio(cardObserver, cardCallbacks);
  }, { threshold: 0, rootMargin: "0px 0px 0px 0px" });
  return cardObserver;
}

// Only pending cards participate in fast-scroll recovery; one listener for the whole page.
const pendingCards = new Map<HTMLElement, () => void>();
let missedFrame = 0;
function catchMissedCards() {
  if (missedFrame || pendingCards.size === 0) return;
  missedFrame = requestAnimationFrame(() => {
    missedFrame = 0;
    const missed = Array.from(pendingCards.keys()).filter((el) => el.getBoundingClientRect().bottom <= 0);
    for (const el of missed) {
      el.classList.add("m-card-fast");
      el.style.setProperty("--m-card-delay", "0ms");
      pendingCards.get(el)?.();
    }
  });
}
function removePendingCard(el: HTMLElement) {
  pendingCards.delete(el);
  if (pendingCards.size !== 0) return;
  window.removeEventListener("scroll", catchMissedCards);
  cancelAnimationFrame(missedFrame);
  missedFrame = 0;
}
function addPendingCard(el: HTMLElement, reveal: () => void) {
  if (pendingCards.size === 0) window.addEventListener("scroll", catchMissedCards, { passive: true });
  pendingCards.set(el, reveal);
  // Also recover cards mounted above the viewport after late data or navigation.
  catchMissedCards();
}

export function CardReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains("m-in")) return;
    // WebKit must not composite backdrop-filter underneath an opacity-animated ancestor.
    if (/AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg/.test(navigator.userAgent)) el.classList.add("m-card-webkit");
    let cleanupTimer = 0;
    let imageTimer = 0;
    let done = false;
    let removeImageListener = () => {};
    const io = getCardObserver();
    const reveal = () => {
      if (done) return;
      done = true;
      removePendingCard(el);
      cardCallbacks.delete(el);
      io?.unobserve(el);
      if (io) soltarSiVacio(io, cardCallbacks);
      const show = () => {
        window.clearTimeout(imageTimer);
        el.removeEventListener("m-image-ready", show);
        el.classList.add("m-in");
        cleanupTimer = window.setTimeout(() => el.classList.add("m-card-done"), TIEMPOS.dur + 300);
      };
      const image = el.querySelector<HTMLImageElement>("img[data-m-card-image]");
      if (image && image.dataset['ready'] !== "true" && !el.classList.contains("m-card-fast")) {
        el.addEventListener("m-image-ready", show, { once: true });
        imageTimer = window.setTimeout(show, 300);
        removeImageListener = () => el.removeEventListener("m-image-ready", show);
      } else show();
    };
    const enter = (delay: number) => {
      el.style.setProperty("--m-card-delay", `${delay}ms`);
      reveal();
    };
    if (io) { cardCallbacks.set(el, enter); io.observe(el); addPendingCard(el, reveal); }
    else enter(0);
    return () => {
      removePendingCard(el);
      cardCallbacks.delete(el); io?.unobserve(el);
      if (io) soltarSiVacio(io, cardCallbacks);
      window.clearTimeout(cleanupTimer);
      window.clearTimeout(imageTimer); removeImageListener();
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
    if (imageObserver) soltarSiVacio(imageObserver, imageCallbacks);
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
    return () => { imageCallbacks.delete(el); io?.unobserve(el); if (io) soltarSiVacio(io, imageCallbacks); el.removeEventListener("m-preload", preload); };
  }, [src]);
  const loaded = async () => {
    try { await ref.current?.decode(); } catch { /* load still supplies a usable image */ }
    setReady(true);
    requestAnimationFrame(() => ref.current?.dispatchEvent(new Event("m-image-ready", { bubbles: true })));
  };
  return <img {...props} ref={ref} src={requested ? src : undefined} loading="eager" decoding="async" data-m-card-image="" data-ready={ready} onLoad={() => void loaded()} />;
}

export function Reveal({ children, className, as: T = "div", style, alBorde = false }: Props & { alBorde?: boolean }) {
  const ref = useReveal<HTMLDivElement>(!alBorde);
  const refBorde = useRevealBorde<HTMLDivElement>(alBorde);
  return <T ref={(alBorde ? refBorde : ref) as never} data-m className={className} style={style}>{children}</T>;
}

export function RevealGroup({ children, className, as: T = "div", style }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return <T ref={ref as never} data-m-group className={className} style={style}>{children}</T>;
}

/** Secuencia de carga independiente; `pagina` conserva los retrasos de PageIntro. */
export function Secuencia({ children, className, as: T = "div", style, pagina = false, ...rest }: Props & { pagina?: boolean; "aria-label"?: string; "aria-roledescription"?: string } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => activar(el)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, []);
  return (
    <T ref={ref as never} data-m-seq-root="" {...(pagina ? { "data-m-page": "" } : {})} className={className} style={style} {...rest}>
      {children}
    </T>
  );
}

/** Título dividido en palabras. Fuera de una Secuencia, se revela solo al entrar en pantalla (con alBorde, apenas toca el borde del viewport). Con enCabecera, lo dispara el encabezado de colección que lo contiene . */
export const SplitWords = memo(function SplitWords({ text, as: T = "span", className, enSecuencia = false, enCabecera = false, alBorde = false, negrita, preservarSaltos = false }: { text: string; as?: ElementType; className?: string; enSecuencia?: boolean; enCabecera?: boolean; alBorde?: boolean; negrita?: string; preservarSaltos?: boolean }) {
  const suelto = !enSecuencia && !enCabecera;
  const ref = useReveal<HTMLElement>(suelto && !alBorde);
  const refBorde = useRevealBorde<HTMLElement>(suelto && alBorde);
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
    <T ref={alBorde ? refBorde : ref} data-m-words="" {...(enSecuencia ? { "data-m-seq": "title" } : {})} aria-label={text} className={clsx((enSecuencia || enCabecera) && "m-in", className)}>
      {palabras.map((p, i) => (
        <span key={i} aria-hidden="true">
          {saltos.has(i) ? <br /> : null}
          <span data-m-w="" className={negrita ? (p === negrita ? "font-bold" : "font-light") : undefined} style={{ "--w": i } as CSSProperties}>{p}</span>
          {i < palabras.length - 1 && !saltos.has(i + 1) ? " " : null}
        </span>
      ))}
    </T>
  );
});
