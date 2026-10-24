// DIAGNÓSTICO (solo con ?x=fps). Inerte sin el parámetro: no crea nodos ni registra requestAnimationFrame.
function iniciarFps() {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.setAttribute("data-diagnostico", "fps");
  el.style.cssText = [
    "position:fixed",
    "top:calc(env(safe-area-inset-top, 0px) + 8px)",
    "left:8px",
    "z-index:2147483647",
    "background:rgb(0 0 0 / 0.75)",
    "color:#fff",
    "font:11px/1.3 monospace",
    "padding:4px 8px",
    "border-radius:6px",
    "pointer-events:none",
  ].join(";");
  el.textContent = "diag fps…";
  // Fuera de <body>: React no lo administra y no puede quitarlo al re-renderizar.
  document.documentElement.appendChild(el);
  console.info("[diagnostico] contador iniciado");

  const frames: number[] = [];
  const tick = (t: number) => {
    frames.push(t);
    while (frames.length && t - frames[0]! > 2000) frames.shift();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  setInterval(() => {
    let peor = 0;
    for (let i = 1; i < frames.length; i++) peor = Math.max(peor, frames[i]! - frames[i - 1]!);
    const span = frames.length > 1 ? frames[frames.length - 1]! - frames[0]! : 0;
    const fps = span > 0 ? Math.round(((frames.length - 1) * 1000) / span) : 0;
    el.textContent = `fps ${fps} | peor frame ${Math.round(peor)} ms`;
  }, 500);
}

let iniciado = false;

/** Idempotente. Sin ?x=fps no hace nada ni registra requestAnimationFrame. */
export function iniciarDiagnostico() {
  if (iniciado || typeof window === "undefined") return;
  const valores = (new URLSearchParams(window.location.search).get("x") ?? "").split(",").map((v) => v.trim());
  if (!valores.includes("fps")) return;
  iniciado = true;
  if (document.readyState === "complete") iniciarFps();
  else window.addEventListener("load", iniciarFps, { once: true });
}
