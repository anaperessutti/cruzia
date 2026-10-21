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
export function useRevealCabecera<T extends HTMLElement = HTMLDivElement>(primeraFila = false, after?: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains("m-in")) return;
    const io = getHeadObserver();
    if (!io) { el.classList.add("m-in"); return; }
    const timed = primeraFila || after ? firstCollectionEntrance(el, -400, () => activar(el), after) : null;
    headCallbacks.set(el, () => timed ? timed.enter() : activar(el));
    io.observe(el);
    return () => { timed?.cleanup(); headCallbacks.delete(el); io.unobserve(el); };
  }, [primeraFila, after]);
  return ref;
}

function inViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
}

/** Fin de la entrada calculado desde las variables de tiempo del CSS, sin medir el DOM:
    eyebrow 300 ms, palabras 400 ms + stagger por palabra, desc 800 ms, cta 1100 ms (ver bloque
    "Movimiento" en styles.css); las páginas internas adelantan todo 250 ms (--shift). */
let tiemposCache: { dur: number; stagger: number } | null = null;
function tiemposMovimiento() {
  if (tiemposCache) return tiemposCache;
  const raiz = getComputedStyle(document.documentElement);
  tiemposCache = {
    dur: Number.parseFloat(raiz.getPropertyValue("--m-dur")) || 1400,
    stagger: Number.parseFloat(raiz.getPropertyValue("--m-word-stagger")) || 45,
  };
  return tiemposCache;
}
function heroTextDuration(hero: HTMLElement) {
  const { dur, stagger } = tiemposMovimiento();
  const shift = hero.hasAttribute("data-m-page") ? 250 : 0;
  // Solo cuenta lo visible: los slides ocultos del hero llevan aria-hidden.
  const visible = (selector: string) => {
    for (const el of hero.querySelectorAll(selector)) if (!el.closest('[aria-hidden="true"]')) return true;
    return false;
  };
  let palabras = 0;
  for (const cont of hero.querySelectorAll("[data-m-words]")) {
    if (cont.closest('[aria-hidden="true"]')) continue;
    palabras = Math.max(palabras, cont.querySelectorAll("[data-m-w]").length);
  }
  let end = 0;
  if (visible('[data-m-seq="eyebrow"]')) end = Math.max(end, 300 + dur);
  if (palabras > 0) end = Math.max(end, 400 + (palabras - 1) * stagger + dur);
  if (visible('[data-m-seq="desc"]')) end = Math.max(end, 800 + dur);
  if (visible('[data-m-seq="cta"]')) end = Math.max(end, 1100 + dur);
  return Math.max(0, end - shift);
}

/** First collection follows the hero's actual end, including late data/layout changes. */
function firstCollectionEntrance(el: HTMLElement, offset: number, reveal: () => void, after?: string) {
  let timer = 0;
  let safetyTimer = 0;
  let scrolled = false;
  let finished = false;
  const heroEnd = () => {
    const selector = after ? `[data-m-sequence="${CSS.escape(after)}"]` : "[data-m-hero]";
    const hero = el.closest("main")?.querySelector<HTMLElement>(selector);
    const end = Number(hero?.dataset['mEnded']);
    return hero && Number.isFinite(end) ? end : null;
  };
  const enter = () => {
    if (finished || !inViewport(el)) return;
    const end = heroEnd();
    if (!scrolled && (end === null || performance.now() < end + offset)) return;
    finished = true;
    reveal();
  };
  const measure = () => {
    window.clearTimeout(timer);
    window.clearTimeout(safetyTimer);
    enter();
    if (finished) return;
    const end = heroEnd();
    if (end !== null) {
      if (performance.now() < end + offset) timer = window.setTimeout(measure, end + offset - performance.now());
      safetyTimer = window.setTimeout(safety, Math.max(0, end + 3000 - performance.now()));
    }
  };
  const onScroll = () => { scrolled = true; measure(); };
  // Visible content cannot remain stranded if it was measured before data/layout settled.
  const safety = () => {
    const end = heroEnd();
    if (!finished && end !== null && performance.now() >= end + 3000 && inViewport(el)) { finished = true; reveal(); }
  };
  const recheck = () => { measure(); safety(); };
  const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(recheck);
  resize?.observe(el);
  const main = el.closest("main");
  if (main) resize?.observe(main);
  window.addEventListener("m-hero-start", recheck);
  window.addEventListener("m-sequence-start", recheck);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", recheck);
  measure();
  return { enter, cleanup: () => {
    window.clearTimeout(timer); window.clearTimeout(safetyTimer); resize?.disconnect();
    window.removeEventListener("m-hero-start", recheck);
    window.removeEventListener("m-sequence-start", recheck);
    window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", recheck);
  } };
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
        cb?.(Math.min(step, 2) * 80);
      });
    }
  }, { threshold: 0, rootMargin: "0px 0px 0px 0px" });
  return cardObserver;
}

export function CardReveal({ children, className, primeraFila = false, indice = 0, after }: Props & { primeraFila?: boolean; indice?: number; after?: string | undefined }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains("m-in")) return;
    // WebKit must not composite backdrop-filter underneath an opacity-animated ancestor.
    if (/AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg/.test(navigator.userAgent)) el.classList.add("m-card-webkit");
    let cleanupTimer = 0;
    let imageTimer = 0;
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      const show = () => {
        window.clearTimeout(imageTimer);
        el.removeEventListener("m-image-ready", show);
        el.classList.add("m-in");
        cleanupTimer = window.setTimeout(() => el.classList.add("m-card-done"), 1100);
      };
      const image = el.querySelector<HTMLImageElement>("img[data-m-card-image]");
      if (image && image.dataset['ready'] !== "true" && !el.classList.contains("m-card-fast")) {
        el.addEventListener("m-image-ready", show, { once: true });
        imageTimer = window.setTimeout(show, 400);
        removeImageListener = () => el.removeEventListener("m-image-ready", show);
      } else show();
    };
    let removeImageListener = () => {};
    const timed = primeraFila || after ? firstCollectionEntrance(el, -300, reveal, after) : null;
    const enter = (delay: number) => {
      el.style.setProperty("--m-card-delay", `${delay}ms`);
      if (timed) timed.enter(); else reveal();
    };
    // La lectura de layout se agrupa en un solo frame por ráfaga de scroll.
    let rafPendiente = 0;
    const catchMissed = () => {
      if (done || timed || rafPendiente) return;
      rafPendiente = requestAnimationFrame(() => {
        rafPendiente = 0;
        if (done) return;
        if (el.getBoundingClientRect().bottom <= 0) {
          el.classList.add("m-card-fast");
          el.style.setProperty("--m-card-delay", "0ms");
          reveal();
        }
      });
    };
    const io = getCardObserver();
    if (io) { cardCallbacks.set(el, enter); io.observe(el); }
    else enter(0);
    window.addEventListener("scroll", catchMissed, { passive: true });
    return () => {
      timed?.cleanup(); window.removeEventListener("scroll", catchMissed);
      cardCallbacks.delete(el); io?.unobserve(el);
      window.clearTimeout(cleanupTimer);
      window.clearTimeout(imageTimer); removeImageListener();
    };
  }, [primeraFila, indice, after]);
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
    requestAnimationFrame(() => ref.current?.dispatchEvent(new Event("m-image-ready", { bubbles: true })));
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
export function Secuencia({ children, className, as: T = "div", style, pagina = false, hero = false, sequenceId, ...rest }: Props & { pagina?: boolean; hero?: boolean; sequenceId?: string; "aria-label"?: string; "aria-roledescription"?: string } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => {
      activar(el);
      if (hero || sequenceId) {
        el.dataset['mStarted'] = String(performance.now());
        el.dataset['mEnded'] = String(performance.now() + heroTextDuration(el));
        window.dispatchEvent(new Event(hero ? "m-hero-start" : "m-sequence-start"));
      }
    }); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [hero, sequenceId]);
  return (
    <T ref={ref as never} data-m-seq-root="" data-m-sequence={sequenceId} {...(pagina ? { "data-m-page": "" } : {})} {...(hero ? { "data-m-hero": "" } : {})} className={className} style={style} {...rest}>
      {children}
    </T>
  );
}

/** Título dividido en palabras. Fuera de una Secuencia, se revela solo al entrar en pantalla. Con enCabecera, lo dispara el encabezado de colección que lo contiene (variante rápida). */
export function SplitWords({ text, as: T = "span", className, enSecuencia = false, enCabecera = false, negrita, preservarSaltos = false }: { text: string; as?: ElementType; className?: string; enSecuencia?: boolean; enCabecera?: boolean; negrita?: string; preservarSaltos?: boolean }) {
  const ref = useReveal<HTMLElement>(!enSecuencia && !enCabecera);
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
    <T ref={ref} data-m-words="" {...(enSecuencia ? { "data-m-seq": "title" } : {})} aria-label={text} className={clsx((enSecuencia || enCabecera) && "m-in", className)}>
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
