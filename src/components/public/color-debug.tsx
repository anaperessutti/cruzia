import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/** Temporary, URL-only diagnostic. Does not alter layout or normal-mode styles. */
export function ColorDebug() {
  const href = useRouterState({ select: (state) => state.location.href });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("debug") !== "colors") return;

    const style = document.createElement("style");
    style.dataset["colorDebugStyle"] = "";
    style.textContent = `
      html[data-color-debug-layer] {
        --debug-html: #ff0000; --debug-body: #00ff00; --debug-background: #0000ff;
        --debug-root: #ff8800; --debug-main: #ffff00; --debug-footer: #ff00ff;
        --debug-other: #00ffff; --debug-label: #000000;
      }
      [data-color-debug-layer="other"], [data-color-debug-layer="other"]::before,
      [data-color-debug-layer="other"]::after { background: var(--debug-other) !important; }
      html[data-color-debug-layer="html"] { background: var(--debug-html) !important; }
      body[data-color-debug-layer="body"] { background: var(--debug-body) !important; }
      [data-color-debug-layer="root"] { background: var(--debug-root) !important; }
      [data-color-debug-layer="main"] { background: var(--debug-main) !important; }
      [data-color-debug-layer="footer"] { background: var(--debug-footer) !important; }
      [data-color-debug-layer="fondo-fijo"] { background: var(--debug-background) !important; }
      [data-color-debug-layer="fondo-fijo"]::before,
      [data-color-debug-layer="fondo-fijo"]::after,
      [data-color-debug-layer="fondo-fijo"] * { background: none !important; }
      [data-color-debug-label] {
        position: fixed !important; z-index: 2147483647 !important;
        color: var(--debug-label) !important; background: transparent !important;
        font: 400 12px/16px sans-serif !important; pointer-events: none !important;
        margin: 0 !important; padding: 0 !important; border: 0 !important;
      }
    `;

    const marked = new Set<HTMLElement>();
    const labels = new Map<HTMLElement, HTMLSpanElement>();
    let frame = 0;
    const hasBackground = (el: HTMLElement) => {
      return [undefined, "::before", "::after"].some((pseudo) => {
        const computed = getComputedStyle(el, pseudo);
        return (computed.backgroundImage !== "none" ||
          !["transparent", "rgba(0, 0, 0, 0)"].includes(computed.backgroundColor)) &&
          (!pseudo || computed.content !== "none");
      });
    };
    const scan = () => {
      frame = 0;
      // Read original backgrounds without the diagnostic stylesheet applied.
      style.disabled = true;
      const layers = new Map<HTMLElement, string>();
      layers.set(document.documentElement, "html");
      layers.set(document.body, "body");
      document.querySelectorAll<HTMLElement>("#root, .site-public").forEach((el) => layers.set(el, "root"));
      document.querySelectorAll<HTMLElement>(".fondo-fijo").forEach((el) => layers.set(el, "fondo-fijo"));
      document.querySelectorAll<HTMLElement>("main").forEach((el) => layers.set(el, "main"));
      document.querySelectorAll<HTMLElement>("footer").forEach((el) => layers.set(el, "footer"));
      document.querySelectorAll<HTMLElement>("div, section, article, aside, header, nav, form, ul").forEach((el) => {
        if (!layers.has(el) && !el.closest(".fondo-fijo") && hasBackground(el)) layers.set(el, "other");
      });
      for (const el of marked) {
        if (!layers.has(el)) {
          el.removeAttribute("data-color-debug-layer");
          labels.get(el)?.remove();
          labels.delete(el);
          marked.delete(el);
        }
      }
      for (const [el, name] of layers) {
        el.dataset["colorDebugLayer"] = name;
        marked.add(el);
        if (name !== "other" && !labels.has(el)) {
          const label = document.createElement("span");
          label.dataset["colorDebugLabel"] = name;
          label.textContent = name;
          label.setAttribute("aria-hidden", "true");
          document.body.appendChild(label);
          labels.set(el, label);
        }
      }
      style.disabled = false;
      positionLabels();
    };
    const positionLabels = () => {
      const names = ["html", "body", "fondo-fijo", "root", "main", "footer"];
      for (const [el, label] of labels) {
        const rect = el.getBoundingClientRect();
        const name = label.dataset["colorDebugLabel"] ?? "";
        label.style.top = `${Math.max(0, rect.top)}px`;
        label.style.left = `${4 + names.indexOf(name) * 76}px`;
        label.hidden = rect.bottom <= 0 || rect.top >= window.innerHeight;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(scan);
    };
    document.head.appendChild(style);
    scan();
    const observer = new MutationObserver((records) => {
      if (records.some((record) => record.type === "attributes" ||
        [...record.addedNodes, ...record.removedNodes].some((node) =>
          !(node instanceof HTMLElement && node.hasAttribute("data-color-debug-label"))))) schedule();
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"] });
    window.addEventListener("scroll", positionLabels, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", positionLabels);
      window.removeEventListener("resize", schedule);
      style.remove();
      for (const el of marked) el.removeAttribute("data-color-debug-layer");
      for (const label of labels.values()) label.remove();
    };
  }, [href]);

  return null;
}