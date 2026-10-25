import { useEffect, useRef } from "react";

/** Home rows: shared proximity/entry observers and one passive scroll listener.
 * Pending rows own the listener; activation releases them without timers or rAF.
 * The first row stays CSS-only. Photo readiness is coordinated by row-level :has().
 */
declare global {
  interface Window {
    __hrUltimo?: { vel: number; dur: number };
  }
}

let ioCerca: IntersectionObserver | null = null;
let ioEntra: IntersectionObserver | null = null;
const filasObservadas = new Set<Element>();
let escuchando = false;
let yAnterior = 0;
let tAnterior = 0;
let velocidad = 0;
let medida = false;
let mostrarFps = false;

function medirVelocidad() {
  const ahora = performance.now();
  const dt = ahora - tAnterior;
  if (dt <= 0) return;
  const vInst = Math.abs(window.scrollY - yAnterior) / dt;
  velocidad = dt > 150 ? vInst : 0.6 * velocidad + 0.4 * vInst;
  yAnterior = window.scrollY;
  tAnterior = ahora;
  medida = true;
}

function velocidadActual() {
  return performance.now() - tAnterior > 150 ? 0 : velocidad;
}

function iniciarScroll() {
  if (escuchando) return;
  yAnterior = window.scrollY;
  tAnterior = performance.now();
  velocidad = 0;
  medida = false;
  mostrarFps = (new URLSearchParams(window.location.search).get("x") ?? "")
    .split(",").some((valor) => valor.trim() === "fps");
  window.addEventListener("scroll", medirVelocidad, { passive: true });
  escuchando = true;
}

function soltarSiVacios() {
  if (filasObservadas.size !== 0) return;
  ioCerca?.disconnect();
  ioEntra?.disconnect();
  if (escuchando) window.removeEventListener("scroll", medirVelocidad);
  escuchando = false;
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
        if (!entry.isIntersecting || !filasObservadas.has(entry.target)) continue;
        const el = entry.target;
        const vel = velocidadActual();
        let dur = 1100;
        if (medida && el instanceof HTMLElement) {
          const f = entry.intersectionRatio > 0.3 ? 0 : Math.min(1, Math.max(0, (1.2 - vel) / 1.0));
          dur = 300 + 800 * f;
          el.style.setProperty("--hr-dur-op", `${dur}ms`);
          el.style.setProperty("--hr-dur-tr", `${250 + 650 * f}ms`);
          el.style.setProperty("--hr-paso", `${20 + 50 * f}ms`);
        }
        if (mostrarFps) window.__hrUltimo = { vel, dur };
        el.classList.add("hr-in");
        ioEntra?.unobserve(el);
        ioCerca?.unobserve(el);
        filasObservadas.delete(el);
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
    if (!el || primera || el.classList.contains("hr-in")) return;
    const cerca = getIoCerca();
    const entra = getIoEntra();
    if (!cerca || !entra) {
      el.classList.add("hr-in");
      return;
    }
    filasObservadas.add(el);
    iniciarScroll();
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
