import type { MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { posicionValida } from "@/lib/imagen";

const POSICION_DEFECTO = "50% 50%";

interface SelectorEnfoqueProps {
  /** Imagen sobre la que se marca el punto de enfoque. */
  imagen: string;
  /** Valor guardado ("X% Y%") o null (centrado). */
  valor: string | null;
  onChange: (valor: string | null) => void;
  /** Texto de ayuda opcional (ej: aclarar que aplica a la portada). */
  ayuda?: string;
}

/**
 * Punto de enfoque de la foto de tarjeta: tocá/clic en la imagen para marcar
 * qué zona se prioriza al recortar. Se guarda como "X% Y%"; null = centrada.
 */
export function SelectorEnfoque({ imagen, valor, onChange, ayuda }: SelectorEnfoqueProps) {
  const posicion = posicionValida(valor) ? valor : POSICION_DEFECTO;
  const [px, py] = posicion.split(" ");

  function marcar(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onChange(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={marcar}
        className="relative cursor-crosshair overflow-hidden rounded-lg border"
        role="button"
        aria-label="Elegir el punto de enfoque de la imagen"
      >
        <img src={imagen} alt="" className="block w-full select-none" draggable={false} />
        <span
          className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.45)]"
          style={{ left: px, top: py }}
        />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Ficha chica (3/4)</p>
          <div className="aspect-[3/4] w-20 overflow-hidden rounded border">
            <img
              src={imagen}
              alt=""
              className="size-full object-cover"
              style={{ objectPosition: posicion }}
              draggable={false}
            />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Ficha normal (4/5)</p>
          <div className="aspect-[4/5] w-20 overflow-hidden rounded border">
            <img
              src={imagen}
              alt=""
              className="size-full object-cover"
              style={{ objectPosition: posicion }}
              draggable={false}
            />
          </div>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
          Centrar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {ayuda ?? "Tocá la imagen para elegir qué parte se ve en las tarjetas."}
      </p>
    </div>
  );
}
