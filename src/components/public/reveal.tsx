import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Sistema de animaciones de entrada (estilo Linear).
 * Un solo IntersectionObserver compartido para todo el sitio.
 * Los elementos arrancan ocultos solo si el <html> tiene la clase "js"
 * (la agrega un script inline en el <head> antes del primer render).
 * Al entrar en pantalla se agrega .rv-in, se hace unobserve y el elemento
 * queda visible para siempre: nunca se anima dos veces.
 */

let observer: IntersectionObserver | null = null;
const callbacks = new Map<Element, () => void>();

function getObserver(): IntersectionObserver | null {
  if (observer || typeof IntersectionObserver === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const callback = callbacks.get(entry.target);
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
        callback?.();
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  return observer;
}

function observar(el: HTMLElement, alEntrar: () => void) {
  const io = getObserver();
  if (!io) {
    alEntrar();
    return () => {};
  }
  callbacks.set(el, alEntrar);
  io.observe(el);
  return () => {
    callbacks.delete(el);
    io.unobserve(el);
  };
}

/** Seguridad: a los 2 s, cualquier elemento oculto que ya esté en (o sobre) la pantalla pasa a visible. */
let seguridadArmada = false;
function armarSeguridad() {
  if (seguridadArmada) return;
  seguridadArmada = true;
  window.setTimeout(() => {
    document.querySelectorAll<HTMLElement>("[data-reveal]:not(.rv-in)").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("rv-in");
    });
  }, 2000);
}

/** Hook base: devuelve una ref; al entrar en pantalla agrega .rv-in al elemento (una sola vez). */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains("rv-in")) return;
    armarSeguridad();
    return observar(el, () => el.classList.add("rv-in"));
  }, []);
  return ref;
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Etiqueta a renderizar (por defecto div). */
  as?: "div" | "section" | "footer" | "li" | "article" | "ol" | "ul";
  style?: CSSProperties;
};

/** Revela un bloque completo al entrar en pantalla (fade + subida de 16px, 500 ms). */
export function Reveal({ children, className, as: Tag = "div", style }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag ref={ref as never} data-reveal className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * Grupo con stagger en cascada: cuando el grupo entra en pantalla, sus hijos
 * directos aparecen con 60 ms de retraso entre cada uno (variable --i por
 * nth-child en CSS, con tope en el 8.º). Los hijos no necesitan nada especial.
 */
export function RevealGroup({ children, className, as: Tag = "div", style }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag ref={ref as never} data-reveal-group className={cn(className)} style={style}>
      {children}
    </Tag>
  );
}
