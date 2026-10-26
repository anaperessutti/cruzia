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
 * - Fotos: las tarjetas que se ven al entrar (2 en celular, 4 desde 640 px) esperan sus fotos JUNTAS, hasta
 *   ESPERA_FOTOS ms; así entran siempre en orden y con 110 ms de diferencia. En modo rápido no se espera:
 *   la tarjeta entra con su fondo neutro y la foto se funde sola al llegar. Cada tarjeta recibe la clase
 *   hr-listo cuando sus fotos están listas (reemplaza a los selectores :has()).
 * - Clases que se agregan a la <section>: hr-cab / hr-cab-fast (cabecera), hr-in / hr-in-fast (la fila está a la
 *   vista), hr-go (arranca la cascada de tarjetas) y hr-run (solo mientras dura, para devolver el retraso a 0).
 * La primera fila no usa observers de scroll: espera sus fotos al montarse y arranca con hr-go.
 */
declare global {
  interface Window {
    __hrUltimo?: { vel: number; dur: number };
  }
}

const DUR_RAPIDO = 220;
/** Tope de espera de las fotos de las tarjetas visibles antes de arrancar la cascada. */
const ESPERA_FOTOS = 700;
const ESPERA_FOTOS_PRIMERA = 1000;
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

function tarjetasDe(fila: HTMLElement) {
  return Array.from(fila.querySelectorAll<HTMLElement>('[data-hr="card"]'));
}

/** Marca hr-listo en las tarjetas cuyas fotos ya están decodificadas (o que no tienen foto). */
function marcarListas(fila: HTMLElement) {
  for (const card of tarjetasDe(fila)) {
    if (card.classList.contains("hr-listo")) continue;
    const fotos = Array.from(card.querySelectorAll<HTMLImageElement>("img[data-m-card-image]"));
    if (fotos.every((foto) => foto.dataset["ready"] === "true")) card.classList.add("hr-listo");
  }
}

export function useFilaReveal<T extends HTMLElement>(primera = false) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const fila = ref.current;
    if (!fila) return;
    let timer = 0;
    let timerEspera = 0;
    let lanzado = fila.classList.contains("hr-go");
    let alCambiarFotos: (() => void) | null = null;

    marcarListas(fila);
    const vigia =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(() => {
            marcarListas(fila);
            alCambiarFotos?.();
          });
    vigia?.observe(fila, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-ready"],
    });

    const lanzar = () => {
      if (lanzado) return;
      lanzado = true;
      alCambiarFotos = null;
      window.clearTimeout(timerEspera);
      fila.classList.add("hr-go", "hr-run");
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => fila.classList.remove("hr-run"),
        (fila.classList.contains("hr-in-fast") ? DUR_RAPIDO : TIEMPOS.dur + 5 * TIEMPOS.stagger) +
          300 +
          (primera ? 300 : 0),
      );
    };
    /** Espera las fotos de las tarjetas visibles (juntas) hasta el tope, o arranca ya si no hace falta. */
    const esperarFotosYLanzar = (rapido: boolean) => {
      if (lanzado) return;
      marcarListas(fila);
      if (rapido) {
        for (const card of tarjetasDe(fila)) card.classList.add("hr-listo");
        lanzar();
        return;
      }
      const visibles = window.matchMedia?.("(min-width: 640px)").matches ? 4 : 2;
      const grupo = tarjetasDe(fila).slice(0, visibles);
      const lista = () => grupo.every((card) => card.classList.contains("hr-listo"));
      if (lista()) {
        lanzar();
        return;
      }
      alCambiarFotos = () => {
        if (lista()) lanzar();
      };
      timerEspera = window.setTimeout(lanzar, primera ? ESPERA_FOTOS_PRIMERA : ESPERA_FOTOS);
    };

    if (primera) {
      esperarFotosYLanzar(false);
      return () => {
        vigia?.disconnect();
        window.clearTimeout(timer);
        window.clearTimeout(timerEspera);
      };
    }

    const abrirCabecera: Abrir = (rapido) => {
      if (rapido) fila.classList.add("hr-cab-fast");
      fila.classList.add("hr-cab");
    };
    const abrirTarjetas: Abrir = (rapido) => {
      if (rapido) fila.classList.add("hr-in-fast");
      fila.classList.add("hr-in");
      esperarFotosYLanzar(rapido);
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
      vigia?.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(timerEspera);
    };
  }, [primera]);
  return ref;
}
