import { cn } from "@/lib/utils";

/** Portada con desvanecido orgánico: el color de la foto se disuelve en el fondo continuo sin bordes rectos. */
export function FadeOrganic({ src, alt, className, imgClassName }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  return (
    <div className={cn("fade-organic", className)}>
      <div aria-hidden="true" className="fade-organic__spill"><img src={src} alt="" /></div>
      <img src={src} alt={alt} className={cn("fade-organic__sharp", imgClassName)} />
      <div aria-hidden="true" className="fade-organic__grain" />
    </div>
  );
}
