import { useEffect } from "react";

const SELECTOR = ".sd-reveal-text, .sd-reveal, .sd-reveal-card, main.theme-gift section > *";

/** Fade-in por IntersectionObserver solo donde no existe animation-timeline. Incluye elementos que se cargan después. */
export function ScrollRevealFallback() {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const vistos = new WeakSet<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("sd-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    const registrar = () => document.querySelectorAll(SELECTOR).forEach((el) => {
      if (vistos.has(el)) return;
      vistos.add(el);
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("sd-in"); else io.observe(el);
    });
    registrar();
    document.documentElement.classList.add("sd-io");
    const mo = new MutationObserver(registrar);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); document.documentElement.classList.remove("sd-io"); };
  }, []);
  return null;
}
