import { useEffect, useRef } from "react";

import {
  REPOSO_SCROLL_RAPIDO,
  TIEMPOS,
  UMBRAL_SCROLL_RAPIDO,
  sigueRapido,
  suavizarVelocidad,
} from "./motion";

/**
 * Filas de Inicio: misma entrada que las tarjetas de Gift Box.
 * - La cabecera (rótulo + título) y la tira de tarjetas se revelan por separado, cada una cuando ella
 *   misma entra en pantalla (umbral 0.12, margen inferior −8 %: el mismo observer de Reveal/RevealGroup).
 *   Nada se muestra antes de que el elemento esté a la vista.
 * - Hay dos modos, elegidos en el instante de entrada: lento (curva completa de Gift Box) y rápido
 *   (un fundido corto, sin movimiento ni blur). La velocidad se mide una vez por frame, con las mismas
 *   funciones que usa motion.tsx, y no depende de la separación entre eventos de scroll.
 * - Clases que se agregan a la <section>: hr-cab / hr-cab-fast (cabecera), hr-in / hr-in-fast (tarjetas)
 *   y hr-run (solo mientras dura la cascada, para devolver el retraso de los hijos a 0).
 * La primera fila no usa observers: entra solo con CSS al cargar.
 */
declare global {
  interface Window {
    __hrUltimo?: { vel: number; dur: number };
  }
}

const DUR_RAPIDO = 220;
const MARGEN_VISIBLE = "0px 0px -8% 0px";
const UMBRAL_VISIBLE = 0.12;
/** Un frame más corto que esto se acumula en el siguiente: evita picos por tiempos casi nulos. */
const MIN_MUESTRA_MS = 8;

type Abrir = (rapido: boolean) => void;

const pendientes = new Map<Element, Abrir>();
let io: IntersectionObserver | null = null;
let escuchando = false;
let frame = 0;
let yAnterior = 0;
let tAnterior = 0;
let velocidad = 0;
let ultimoRapido = -Infinity;
let mostrarFps = false;

function muestrear() {
  frame = 0;
  const ahora = performance.now();
  const ms = ahora - tAnterior;
  if (ms < MIN_MUESTRA_MS) return;
  if (ms > REPOSO_SCROLL_RAPIDO) velocidad = 0;
  velocidad = suavizarVelocidad(velocidad, window.scrollY - yAnterior, ms);
  yAnterior = window.scrollY;
  tAnterior = ahora;
  if (velocidad > UMBRAL_SCROLL_RAPIDO) ultimoRapido = ahora;
}

function alScroll() {
  if (!frame) frame = requestAnimationFrame(muestrear);
}

function iniciarScroll() {
  if (escuchando) return;
  yAnterior = window.scrollY;
  tAnterior = performance.now();
  velocidad = 0;
  ultimoRapido = -Infinity;
  mostrarFps = (new URLSearchParams(window.location.search).get("x") ?? "")
    .split(",")
    .some((valor) => valor.trim() === "fps");
  window.addEventListener("scroll", alScroll, { passive: true });
  escuchando = true;
}

function soltarSiVacio() {
  if (pendientes.size !== 0) return;
  io?.disconnect();
  if (escuchando) window.removeEventListener("scroll", alScroll);
  cancelAnimationFrame(frame);
  frame = 0;
  escuchando = false;
}

function velocidadActual() {
  const ahora = performance.now();
  const vel = ahora - tAnterior > REPOSO_SCROLL_RAPIDO ? 0 : velocidad;
  return { vel, rapido: sigueRapido(vel, ahora, ultimoRapido) };
}

function getIo() {
  if (io || typeof IntersectionObserver === "undefined") return io;
  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const abrir = pendientes.get(entry.target);
        if (!abrir) continue;
        // Una fila que ya quedó por encima de la pantalla (carga tardía, scroll restaurado) se muestra sin animar.
        const pasada = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        if (!entry.isIntersecting && !pasada) continue;
        pendientes.delete(entry.target);
        io?.unobserve(entry.target);
        const { vel, rapido } = pasada ? { vel: 0, rapido: true } : velocidadActual();
        if (mostrarFps) window.__hrUltimo = { vel, dur: rapido ? DUR_RAPIDO : TIEMPOS.dur };
        abrir(rapido);
      }
      soltarSiVacio();
    },
    { threshold: UMBRAL_VISIBLE, rootMargin: MARGEN_VISIBLE },
  );
  return io;
}

function observar(el: Element, abrir: Abrir) {
  const observer = getIo();
  if (!observer) {
    abrir(true);
    return;
  }
  pendientes.set(el, abrir);
  iniciarScroll();
  observer.observe(el);
}

function soltar(el: Element) {
  pendientes.delete(el);
  io?.unobserve(el);
  soltarSiVacio();
}

export function useFilaReveal<T extends HTMLElement>(primera = false) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const fila = ref.current;
    if (!fila || primera) return;
    let timer = 0;
    const abrirCabecera: Abrir = (rapido) => {
      if (rapido) fila.classList.add("hr-cab-fast");
      fila.classList.add("hr-cab");
    };
    const abrirTarjetas: Abrir = (rapido) => {
      if (rapido) fila.classList.add("hr-in-fast");
      fila.classList.add("hr-in", "hr-run");
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => fila.classList.remove("hr-run"),
        rapido ? DUR_RAPIDO + 200 : TIEMPOS.dur + 5 * TIEMPOS.stagger + 300,
      );
    };
    const cabecera = fila.querySelector<HTMLElement>('[data-hr-obs="cab"]') ?? fila;
    const tarjetas = fila.querySelector<HTMLElement>('[data-hr-obs="tarjetas"]') ?? fila;
    const registrados: Element[] = [];
    const pideCabecera = !fila.classList.contains("hr-cab");
    const pideTarjetas = !fila.classList.contains("hr-in");
    if (cabecera === tarjetas) {
      // Sin los marcadores esperados, la fila entera dispara ambas partes a la vez.
      if (pideCabecera || pideTarjetas) {
        observar(fila, (rapido) => {
          abrirCabecera(rapido);
          abrirTarjetas(rapido);
        });
        registrados.push(fila);
      }
    } else {
      if (pideCabecera) {
        observar(cabecera, abrirCabecera);
        registrados.push(cabecera);
      }
      if (pideTarjetas) {
        observar(tarjetas, abrirTarjetas);
        registrados.push(tarjetas);
      }
    }
    return () => {
      for (const el of registrados) soltar(el);
      window.clearTimeout(timer);
    };
  }, [primera]);
  return ref;
}
