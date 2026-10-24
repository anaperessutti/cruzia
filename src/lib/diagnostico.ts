// DIAGNÓSTICO (solo con ?x=fps). Inerte sin el parámetro: no crea nodos ni registra requestAnimationFrame.
function iniciarFps() {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText =
    "position:fixed;top:0;left:0;z-index:2147483647;background:rgba(0,0,0,.7);color:#fff;font:11px/1.3 monospace;padding:4px 6px;pointer-events:none;";
  document.body.appendChild(el);
  const frames: number[] = [];
  let prev = performance.now();
  const tick = (t: number) => {
    frames.push(t);
    prev = t;
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
    void prev;
  }, 500);
}

if (typeof window !== "undefined") {
  const valores = (new URLSearchParams(window.location.search).get("x") ?? "").split(",").map((v) => v.trim());
  if (valores.includes("fps")) {
    // Espera a la hidratación para no insertar nodos en <body> antes que React.
    const esperar = () => {
      if (document.documentElement.hasAttribute("data-hydrated")) iniciarFps();
      else setTimeout(esperar, 200);
    };
    esperar();
  }
}
