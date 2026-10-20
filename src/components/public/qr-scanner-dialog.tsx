import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type BarcodeDetectorLike = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };

export function QrScannerDialog({
  open,
  onOpenChange,
  onDetected,
  titulo,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onDetected: (codigo: string) => void;
  titulo: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    let detector: BarcodeDetectorLike | null = null;

    const Detector = (globalThis as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector;
    if (Detector) {
      try {
        detector = new Detector({ formats: ["qr_code"] });
      } catch {
        detector = null;
      }
    }

    const tick = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!cancelled && video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          let value: string | null = null;
          if (detector) {
            try {
              const [first] = await detector.detect(canvas);
              value = first?.rawValue ?? null;
            } catch {
              detector = null;
            }
          }
          if (!value) {
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            value = (await import("jsqr")).default(image.data, image.width, image.height)?.data ?? null;
          }
          if (value && !cancelled) {
            cancelled = true;
            onDetected(value.trim());
            return;
          }
        }
      }
      if (!cancelled) raf = requestAnimationFrame(() => void tick());
    };

    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        void tick();
      } catch {
        setError("No pudimos abrir la cámara. Revisá el permiso o ingresá el código del local a mano.");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [open, onDetected]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Escaneá el QR del local</DialogTitle>
          <DialogDescription>Apuntá la cámara al código que está en {titulo}.</DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{error}</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-black">
            <video ref={videoRef} playsInline muted className="aspect-square w-full object-cover" />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (manual.trim()) onDetected(manual.trim());
          }}
        >
          <Input value={manual} onChange={(event) => setManual(event.target.value)} placeholder="O ingresá el código" />
          <Button type="submit" variant="outline">Validar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
