import { useEffect, useRef } from "react";
import { optimizarImagen } from "@/lib/imagen";
import { cn } from "@/lib/utils";

/** Portada con desvanecido orgánico: el color de la foto se disuelve en el fondo continuo sin bordes rectos. */
export function FadeOrganic({ src, alt, className, imgClassName, prioridad = false, zoomInterno = false }: { src: string; alt: string; className?: string; imgClassName?: string; prioridad?: boolean; zoomInterno?: boolean }) {
  const url = optimizarImagen(src);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!zoomInterno) return;
    const el = ref.current;
    if (!el) return;
    const start = (event: TransitionEvent) => {
      if (event.propertyName === "transform" && event.target instanceof HTMLElement) event.target.classList.add("slider-zoom-running");
    };
    const end = (event: TransitionEvent) => {
      if (event.propertyName === "transform" && event.target instanceof HTMLElement) event.target.classList.remove("slider-zoom-running");
    };
    el.addEventListener("transitionrun", start);
    el.addEventListener("transitionend", end);
    el.addEventListener("transitioncancel", end);
    return () => { el.removeEventListener("transitionrun", start); el.removeEventListener("transitionend", end); el.removeEventListener("transitioncancel", end); };
  }, [zoomInterno]);
  const carga = prioridad ? ({ loading: "eager", fetchPriority: "high" } as const) : ({ loading: "lazy" } as const);
  return (
    <div ref={ref} className={cn("fade-organic", className)}>
      <div aria-hidden="true" className="fade-organic__spill"><img src={url} alt="" decoding="async" {...carga} /></div>
      {zoomInterno ? <div className="fade-organic__sharp slider-static-mask"><div className="slider-entry-zoom"><img src={url} alt={alt} decoding="async" {...carga} className={cn("slider-image", imgClassName)} /></div></div> : <img src={url} alt={alt} decoding="async" {...carga} className={cn("fade-organic__sharp", imgClassName)} />}
      <div aria-hidden="true" className="fade-organic__grain" />
    </div>
  );
}
