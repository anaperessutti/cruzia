import lockup from "@/assets/brand/cruzia-lockup.png.asset.json";
import isotype from "@/assets/brand/cruzia-isotipo.png.asset.json";
import wordmark from "@/assets/brand/cruzia-logotipo.png.asset.json";
import { cn } from "@/lib/utils";

/** Archivos de marca centralizados: reemplazá aquí por SVG/PNG nuevos sin tocar nada más. */
const ARCHIVOS = {
  wordmark: { src: wordmark.url, ratio: 1473 / 437 },
  isotype: { src: isotype.url, ratio: 1265 / 763 },
  lockup: { src: lockup.url, ratio: 1557 / 1220 },
} as const;

export type LogoVariant = keyof typeof ARCHIVOS;

interface LogoProps {
  variant?: LogoVariant;
  /** light = fondo claro (logo negro). dark = fondo oscuro (logo invertido). */
  tone?: "light" | "dark";
  /** Alto en px. El wordmark nunca baja de 28px. */
  height?: number;
  className?: string;
  decorative?: boolean;
}

export function Logo({ variant = "wordmark", tone = "light", height, className, decorative = false }: LogoProps) {
  const archivo = ARCHIVOS[variant];
  const alto = variant === "wordmark" ? Math.max(height ?? 28, 28) : height ?? 40;
  return (
    <img
      src={archivo.src}
      alt={decorative ? "" : "Cruzia"}
      aria-hidden={decorative || undefined}
      width={Math.round(alto * archivo.ratio)}
      height={alto}
      draggable={false}
      style={{ height: alto, width: "auto" }}
      className={cn(
        "select-none object-contain",
        tone === "dark" ? "invert mix-blend-screen" : "mix-blend-multiply",
        className,
      )}
    />
  );
}
