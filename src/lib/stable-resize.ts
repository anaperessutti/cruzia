/** Browser chrome height changes are not layout changes worth remeasuring. */
export function isToolbarResize(previous: { width: number; height: number }, next: { width: number; height: number }) {
  return previous.width === next.width && previous.height !== next.height && Math.abs(next.height - previous.height) < 150;
}

/** One frame for resize bursts; ResizeObserver supplies sizes without forced layout reads. */
export function observeStableResize(callback: () => void, targets: Element[] = []) {
  let viewport = { width: window.innerWidth, height: window.innerHeight };
  let frame = 0;
  const sizes = new WeakMap<Element, { width: number; height: number }>();
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; callback(); });
  };
  const onResize = () => {
    const next = { width: window.innerWidth, height: window.innerHeight };
    if (isToolbarResize(viewport, next)) return;
    if (viewport.width === next.width && viewport.height === next.height) return;
    viewport = next;
    schedule();
  };
  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver((entries) => {
    const nextViewport = { width: window.innerWidth, height: window.innerHeight };
    const toolbar = isToolbarResize(viewport, nextViewport);
    let changed = false;
    for (const entry of entries) {
      const next = { width: entry.contentRect.width, height: entry.contentRect.height };
      const previous = sizes.get(entry.target);
      sizes.set(entry.target, next);
      if (previous && previous.width === next.width && previous.height === next.height) continue;
      if (toolbar && (!previous || isToolbarResize(previous, next))) continue;
      changed = true;
    }
    if (changed) schedule();
  });
  targets.forEach((el) => observer?.observe(el));
  window.addEventListener("resize", onResize, { passive: true });
  window.visualViewport?.addEventListener("resize", onResize, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
  };
}