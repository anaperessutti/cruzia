import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { BotonPdf } from "@/components/public/regalo-vista";
import { Button } from "@/components/ui/button";
import { REGALO_EJEMPLO, type Presentacion } from "@/lib/regalo";

/** Mounted only while the dialog is open: each preview snapshots the current materials. */
export function GiftboxPdfPreview({ presentacion }: { presentacion: Presentacion }) {
  const [iphone] = useState(() => /iPhone|iPod/.test(navigator.userAgent));
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (iphone) return;
    let vivo = true;
    let creado: string | null = null;
    setError(false);
    void import("@/lib/regalo-pdf")
      .then(({ generarRegaloPdf }) => generarRegaloPdf(REGALO_EJEMPLO, presentacion))
      .then((blob) => {
        if (!vivo) return;
        creado = URL.createObjectURL(blob);
        setUrl(creado);
      })
      .catch(() => {
        if (vivo) setError(true);
      });
    return () => {
      vivo = false;
      if (creado) URL.revokeObjectURL(creado);
    };
  }, [iphone, presentacion, intento]);

  if (iphone)
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          En iPhone no se muestra el visor PDF. Prepará el archivo y después descargalo para verlo.
        </p>
        <BotonPdf info={REGALO_EJEMPLO} presentacion={presentacion} />
      </div>
    );

  if (error)
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-destructive">
          No pudimos preparar el PDF de ejemplo.
        </p>
        <Button variant="outline" onClick={() => setIntento((i) => i + 1)}>
          Reintentar
        </Button>
      </div>
    );

  if (!url)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Preparando PDF…
      </p>
    );

  return (
    <div className="min-w-0 space-y-3">
      <Button asChild className="h-auto min-h-10 whitespace-normal">
        <a href={url} download={`Cruzia-gift-box-ejemplo-${REGALO_EJEMPLO.codigo}.pdf`}>
          <Download className="size-4 shrink-0" />
          Descargar PDF de ejemplo
        </a>
      </Button>
      <iframe
        title="PDF de ejemplo de Gift Box"
        src={`${url}#view=FitH`}
        className="h-[60dvh] w-full rounded border border-border"
      />
    </div>
  );
}
