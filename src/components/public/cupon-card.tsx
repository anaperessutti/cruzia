import { CalendarClock, CheckCircle2, MessageCircle, QrCode } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { QrScannerDialog } from "@/components/public/qr-scanner-dialog";
import { Button } from "@/components/ui/button";
import type { Comercio, Cupon } from "@/lib/public-data";
import {
  activarCuponPresencial,
  consultarEstadoCupon,
  getCachedEstado,
  mensajeMotivo,
  registrarClickWhatsapp,
  setCachedEstado,
  type EstadoCupon,
} from "@/lib/cupones";
import { getDeviceId } from "@/lib/device-id";

function formatFecha(value: string) {
  return new Date(value).toLocaleDateString("es-AR", { day: "2-digit", month: "long" });
}

export function CuponCard({
  comercio,
  cupon,
  puedeWhatsapp,
}: {
  comercio: Comercio;
  cupon: Cupon;
  puedeWhatsapp: boolean;
}) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoCupon | null>(null);
  const [scannerAbierto, setScannerAbierto] = useState(false);
  const [exito, setExito] = useState<{ cooldown: number } | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  useEffect(() => {
    if (!deviceId || cupon.modalidad !== "presencial") return;
    let activo = true;

    // El caché local solo evita una consulta cuando sabemos que el cooldown sigue corriendo.
    const cache = getCachedEstado(deviceId, cupon.id);
    if (cache?.disponibleDesde && new Date(cache.disponibleDesde) > new Date()) {
      const dias = Math.ceil((new Date(cache.disponibleDesde).getTime() - Date.now()) / 86_400_000);
      setEstado({ permitido: false, motivo: "COOLDOWN_ACTIVO", dias_restantes: dias, cooldown_dias: cache.cooldownDias });
      return;
    }

    void consultarEstadoCupon(cupon.id, deviceId)
      .then((result) => {
        if (!activo) return;
        setEstado(result);
        setCachedEstado(deviceId, cupon.id, {
          disponibleDesde: result.disponible_desde ?? null,
          cooldownDias: result.cooldown_dias ?? cupon.cooldown_dias,
        });
      })
      .catch(() => undefined);

    return () => {
      activo = false;
    };
  }, [cupon.cooldown_dias, cupon.id, cupon.modalidad, deviceId]);

  const handleDetected = useCallback(
    async (codigo: string) => {
      if (!deviceId || procesando) return;
      setProcesando(true);
      setMensaje(null);
      try {
        // La validación de cooldown y del QR ocurre íntegramente en el servidor.
        const result = await activarCuponPresencial(cupon.id, deviceId, codigo);
        setScannerAbierto(false);
        if (result.permitido) {
          const cooldown = result.cooldown_dias ?? cupon.cooldown_dias;
          setExito({ cooldown });
          setEstado({ permitido: false, motivo: "COOLDOWN_ACTIVO", dias_restantes: cooldown, cooldown_dias: cooldown });
          setCachedEstado(deviceId, cupon.id, {
            disponibleDesde: new Date(Date.now() + cooldown * 86_400_000).toISOString(),
            cooldownDias: cooldown,
          });
        } else {
          setMensaje(mensajeMotivo(result));
          setEstado(result);
        }
      } catch {
        setMensaje("No pudimos conectarnos para validar el cupón. Intentá de nuevo.");
      } finally {
        setProcesando(false);
      }
    },
    [cupon.cooldown_dias, cupon.id, deviceId, procesando],
  );

  const whatsappHref = `https://wa.me/${(comercio.whatsapp ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola ${comercio.nombre}, vi su promo ${cupon.titulo} en AUNA y quiero reservar/consultar.`,
  )}`;

  const bloqueado = estado != null && !estado.permitido && estado.motivo === "COOLDOWN_ACTIVO";

  return (
    <article className="rounded-md border-2 border-secondary bg-card p-6 shadow-premium">
      <h2 className="font-display text-2xl font-bold text-primary">{cupon.titulo}</h2>
      {cupon.descripcion ? <p className="mt-2 text-sm text-muted-foreground">{cupon.descripcion}</p> : null}
      <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarClock className="size-4" /> Vigente del {formatFecha(cupon.vigencia_inicio)} al {formatFecha(cupon.vigencia_fin)}
      </p>

      {exito ? (
        <div className="mt-5 rounded-md border border-accent bg-accent/10 p-5 text-center">
          <CheckCircle2 className="mx-auto size-8 text-accent" />
          <p className="mt-2 font-display text-2xl font-extrabold text-primary">¡Ya es tuyo, disfrutalo!</p>
          <p className="mt-1 text-sm text-muted-foreground">Tu próximo cupón se habilitará en {exito.cooldown} días.</p>
          <p className="mt-2 text-xs text-muted-foreground">Mostrale esta pantalla a la persona que te atiende.</p>
        </div>
      ) : cupon.modalidad === "whatsapp" && puedeWhatsapp ? (
        <Button
          asChild
          className="mt-5 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 sm:w-auto"
          onClick={() => {
            if (deviceId) void registrarClickWhatsapp(cupon.id, comercio.id, deviceId).catch(() => undefined);
          }}
        >
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            <MessageCircle className="mr-1.5 size-4" /> Reservar por WhatsApp
          </a>
        </Button>
      ) : (
        <div className="mt-5">
          <Button
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 sm:w-auto"
            disabled={bloqueado || procesando || !deviceId}
            onClick={() => setScannerAbierto(true)}
          >
            <QrCode className="mr-1.5 size-4" /> {procesando ? "Validando..." : "Activar"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            {bloqueado
              ? `Ya usaste este cupón. Vas a poder activarlo de nuevo en ${estado?.dias_restantes ?? cupon.cooldown_dias} días.`
              : "Al activar se abrirá la cámara de tu teléfono para escanear el QR del local."}
          </p>
        </div>
      )}

      {mensaje ? <p className="mt-3 text-sm font-medium text-destructive">{mensaje}</p> : null}

      <QrScannerDialog
        open={scannerAbierto}
        onOpenChange={setScannerAbierto}
        onDetected={(codigo) => void handleDetected(codigo)}
        titulo={comercio.nombre}
      />
    </article>
  );
}
