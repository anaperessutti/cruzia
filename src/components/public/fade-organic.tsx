import { optimizarImagen } from "@/lib/imagen";
import { cn } from "@/lib/utils";

/** Portada con desvanecido orgánico: el color de la foto se disuelve en el fondo continuo sin bordes rectos. */
export function FadeOrganic({ src, alt, className, imgClassName, prioridad = false }: { src: string; alt: string; className?: string; imgClassName?: string; prioridad?: boolean }) {
  const url = optimizarImagen(src);
  const carga = prioridad ? ({ loading: "eager", fetchPriority: "high" } as const) : ({ loading: "lazy" } as const);
  return (
    <div className={cn("fade-organic", className)}>
      <div aria-hidden="true" className="fade-organic__spill"><img src={url} alt="" decoding="async" {...carga} fetchPriority="low" /></div>
      <img src={url} alt={alt} decoding="async" {...carga} className={cn("fade-organic__sharp", imgClassName)} />
      <div aria-hidden="true" className="fade-organic__grain" />
    </div>
  );
}
