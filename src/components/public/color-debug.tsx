import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/** Temporary, URL-only diagnostics. Does not alter normal-mode styles. */
export function ColorDebug() {
  const href = useRouterState({ select: (state) => state.location.href });

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("debug");
    if (mode === "metrics") return mountMetrics();
    const independentStyles: Record<string, string> = {
      noblend: `.fondo-fijo::after { mix-blend-mode: normal !important; }`,
      nograin: `.fondo-fijo::after { display: none !important; }`,
      nogradient: `.fondo-fijo { background: #D9D5D2 !important; }`,
      nobackdrop: `*, *::before, *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`,
      nofixed: `.site-public > .fondo-fijo { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; }`,
    };
    const independentStyle = mode ? independentStyles[mode] : undefined;
    if (independentStyle) {
      const style = document.createElement("style");
      style.dataset["colorDebugStyle"] = "";
      style.textContent = independentStyle;
      document.head.appendChild(style);
      return () => style.remove();
    }
    if (mode !== "colors") return;

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
        label.style.top = `${Math.max(0, rect.top) + names.indexOf(name) * 16}px`;
        label.style.left = "4px";
        label.hidden = rect.bottom <= 0 || rect.top >= window.innerHeight;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(scan);
    };
    document.head.appendChild(style);
    scan();
    const observer = new MutationObserver((records) => {
      if (records.some((record) => !(record.target instanceof HTMLElement && record.target.hasAttribute("data-color-debug-label")) && (record.type === "attributes" ||
        [...record.addedNodes, ...record.removedNodes].some((node) =>
          !(node instanceof HTMLElement && node.hasAttribute("data-color-debug-label")))))) schedule();
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

/** Read-only measurements; every node and listener is owned by this mode. */
function mountMetrics() {
  const style = document.createElement("style");
  style.dataset["colorDebugStyle"] = "metrics";
  style.textContent = `
    [data-debug-metrics] {
      --metrics-band: rgba(255, 0, 0, .35);
      --metrics-panel: rgba(255, 255, 255, .9);
      --metrics-text: #000000;
      position: fixed !important; z-index: 99999 !important;
      pointer-events: none !important; box-sizing: border-box !important;
      color: var(--metrics-text) !important; margin: 0 !important;
      border: 0 !important; border-radius: 0 !important;
      font: 400 11px/14px monospace !important;
      text-transform: none !important; letter-spacing: 0 !important;
    }
    [data-debug-metrics="band"] {
      bottom: 0 !important; left: 0 !important; right: 0 !important;
      height: 80px !important; padding: 4px !important;
      background: var(--metrics-band) !important;
    }
    [data-debug-metrics="panel"] {
      top: 110px !important; left: 8px !important;
      max-width: calc(100vw - 16px) !important; padding: 6px !important;
      background: var(--metrics-panel) !important;
      white-space: pre-wrap !important; overflow-wrap: anywhere !important;
    }
    [data-debug-metrics="safe-area"] {
      top: 0 !important; left: 0 !important; visibility: hidden !important;
      width: 0 !important; height: 0 !important;
      padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px)
        env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px) !important;
    }
  `;
  const makeNode = (kind: string) => {
    const node = document.createElement("div");
    node.dataset["debugMetrics"] = kind;
    node.setAttribute("aria-hidden", "true");
    return node;
  };
  const band = makeNode("band");
  band.textContent = "bottom:0";
  const panel = makeNode("panel");
  const probe = makeNode("safe-area");
  document.head.appendChild(style);
  document.body.append(band, panel, probe);
  let frame = 0;
  const number = (value: number) => String(Math.round(value * 100) / 100);
  const update = () => {
    frame = 0;
    const html = document.documentElement;
    const viewport = window.visualViewport;
    const safe = getComputedStyle(probe);
    const background = document.querySelector<HTMLElement>(".fondo-fijo");
    const backgroundRect = background?.getBoundingClientRect();
    const siteRect = document.querySelector(".site-public")?.getBoundingClientRect();
    const ua = navigator.userAgent;
    const properties = ["transform", "filter", "backdrop-filter", "perspective", "will-change", "contain", "content-visibility", "overflow", "position", "height"];
    const ancestors: string[] = [];
    let ancestor = background?.parentElement ?? null;
    while (ancestor) {
      const computed = getComputedStyle(ancestor);
      const values = properties.flatMap((property) => {
        const value = computed.getPropertyValue(property).trim();
        return value && !["none", "auto", "normal"].includes(value) ? [`${property}: ${value}`] : [];
      });
      // Safari versions may expose only the prefixed backdrop-filter value.
      if (!values.some((value) => value.startsWith("backdrop-filter:"))) {
        const prefixed = computed.getPropertyValue("-webkit-backdrop-filter").trim();
        if (prefixed && prefixed !== "none") values.push(`backdrop-filter: ${prefixed}`);
      }
      const name = `${ancestor.tagName.toLowerCase()}${ancestor.id ? `#${ancestor.id}` : ""}${[...ancestor.classList].map((item) => `.${item}`).join("")}`;
      ancestors.push(`${name}: ${values.join("; ") || "—"}`);
      ancestor = ancestor.parentElement;
    }
    panel.textContent = [
      `UA (últimos 90): ${ua.slice(-90)}`,
      ["GSA", "Instagram", "FBAN", "CriOS"].map((name) => `${name}: ${ua.includes(name) ? "sí" : "no"}`).join(" | "),
      `inner: ${window.innerWidth} × ${window.innerHeight}; clientHeight: ${html.clientHeight}`,
      viewport ? `visualViewport: width ${number(viewport.width)}, height ${number(viewport.height)}, offsetTop ${number(viewport.offsetTop)}, pageTop ${number(viewport.pageTop)}` : "visualViewport: no disponible",
      `screen: ${screen.width} × ${screen.height}; devicePixelRatio: ${window.devicePixelRatio}`,
      `safe-area: top ${safe.paddingTop}, right ${safe.paddingRight}, bottom ${safe.paddingBottom}, left ${safe.paddingLeft}`,
      `scrollY: ${number(window.scrollY)}; scrollHeight: ${html.scrollHeight}`,
      backgroundRect ? `.fondo-fijo: top ${number(backgroundRect.top)}, bottom ${number(backgroundRect.bottom)}, height ${number(backgroundRect.height)}` : ".fondo-fijo: no disponible",
      siteRect ? `.site-public: bottom ${number(siteRect.bottom)}` : ".site-public: no disponible",
      `background-color: html ${getComputedStyle(html).backgroundColor}; body ${getComputedStyle(document.body).backgroundColor}`,
      `meta viewport: ${document.querySelector('meta[name="viewport"]')?.outerHTML ?? "no disponible"}`,
      "Ancestros de .fondo-fijo → html:",
      ...ancestors,
    ].join("\n");
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("scroll", schedule, { passive: true });
  schedule();
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.visualViewport?.removeEventListener("resize", schedule);
    window.visualViewport?.removeEventListener("scroll", schedule);
    band.remove();
    panel.remove();
    probe.remove();
    style.remove();
  };
}