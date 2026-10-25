import { useEffect, useRef } from "react";

/**
 * Movimiento de las filas de carruseles de Inicio: simple y autocontenido.
 * Dos IntersectionObserver compartidos (cercanía y entrada), sin listeners de scroll,
 * sin medición de velocidad y sin timers en JS; el estado visual vive en las reglas hr- de styles.css.
 * - ioCerca (rootMargin 100%): agrega hr-cerca; si la fila nunca entra, un respaldo CSS la muestra a los 1,8 s.
 * - ioEntra (rootMargin 12%): agrega hr-in; si entra de golpe (intersectionRatio > 0.3), también hr-tarde
 *   para acortar la transición.
 * La primera fila (primera=true) no se observa: entra solo con CSS al cargar.
 */

let ioCerca: IntersectionObserver | null = null;
let ioEntra: IntersectionObserver | null = null;
const filasObservadas = new Set<Element>();

function soltarSiVacios() {
  if (filasObservadas.size !== 0) return;
  ioCerca?.disconnect();
  ioEntra?.disconnect();
}

function getIoCerca() {
  if (ioCerca || typeof IntersectionObserver === "undefined") return ioCerca;
  ioCerca = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("hr-cerca");
        ioCerca?.unobserve(entry.target);
      }
      soltarSiVacios();
    },
    { threshold: 0, rootMargin: "0px 0px 100% 0px" },
  );
  return ioCerca;
}

function getIoEntra() {
  if (ioEntra || typeof IntersectionObserver === "undefined") return ioEntra;
  ioEntra = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("hr-in");
        if (entry.intersectionRatio > 0.3) entry.target.classList.add("hr-tarde");
        ioEntra?.unobserve(entry.target);
      }
      soltarSiVacios();
    },
    { threshold: 0, rootMargin: "0px 0px 12% 0px" },
  );
  return ioEntra;
}

export function useFilaReveal<T extends HTMLElement>(primera = false) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || primera) return;
    const cerca = getIoCerca();
    const entra = getIoEntra();
    if (!cerca || !entra) {
      el.classList.add("hr-in");
      return;
    }
    filasObservadas.add(el);
    cerca.observe(el);
    entra.observe(el);
    return () => {
      filasObservadas.delete(el);
      cerca.unobserve(el);
      entra.unobserve(el);
      soltarSiVacios();
    };
  }, [primera]);
  return ref;
}
