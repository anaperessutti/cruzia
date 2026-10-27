import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Gift, MapPin, QrCode, Sparkles, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { Reveal, RevealGroup, Secuencia, SplitWords } from "@/components/public/motion";
import { getDeviceId } from "@/lib/device-id";
import {
  CATEGORIAS,
  crearPedidoGiftbox,
  formatearPrecio,
  getGiftboxItems,
  lugarDelItem,
  type GiftboxFormato,
  type GiftboxItem,
} from "@/lib/giftbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gift-box")({
  head: () => ({
    meta: [
      { title: "Gift Box | Cruzia" },
      {
        name: "description",
        content: "Regalá experiencias del Partido de la Costa con Gift Box de Cruzia.",
      },
      { property: "og:title", content: "Gift Box | Cruzia" },
      { property: "og:description", content: "Una caja llena de experiencias locales." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

const PASOS = [
  {
    icon: Sparkles,
    titulo: "Combiná tu pack",
    texto: "Elegí experiencias de Noche, Sabor, Relax y Diversión hasta armar el regalo perfecto.",
  },
  {
    icon: Truck,
    titulo: "Elegí el formato",
    texto:
      "Digital por WhatsApp, al instante. O físico, con 48 hs de anticipación para prepararlo.",
  },
  {
    icon: QrCode,
    titulo: "Canje con QR",
    texto: "Quien lo recibe presenta su QR en cada comercio, dentro de la vigencia del pack.",
  },
];

function Page() {
  const { data, isLoading } = usePublicDirectory();
  if (isLoading) return <main className="min-h-[60vh]" />;
  if (!data.giftBoxVisible) return <Navigate to="/" replace />;
  return <GiftBoxPage />;
}

function GiftBoxPage() {
  const { data } = usePublicDirectory();
  const items = useQuery({
    queryKey: ["giftbox-items"],
    queryFn: getGiftboxItems,
    staleTime: 60_000,
  });
  const [seleccion, setSeleccion] = useState<Record<string, GiftboxItem>>({});
  const [formato, setFormato] = useState<GiftboxFormato>("digital");
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<{
    items: GiftboxItem[];
    total: number;
    formato: GiftboxFormato;
  } | null>(null);

  const centinela = useRef<HTMLDivElement>(null);
  const [barraVisible, setBarraVisible] = useState(false);
  useEffect(() => {
    const el = centinela.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setBarraVisible(true);
      return;
    }
    // Visible cuando el inicio de la sección entra en el 70% inferior de la pantalla (o ya pasó hacia arriba).
    const obs = new IntersectionObserver(([e]) => setBarraVisible(Boolean(e?.isIntersecting)), {
      rootMargin: "0px 0px -30% 0px",
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const elegidos = useMemo(() => Object.values(seleccion), [seleccion]);
  const total = elegidos.reduce((acc, item) => acc + Number(item.precio), 0);

  function toggle(item: GiftboxItem) {
    setSeleccion((prev) => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = item;
      return next;
    });
  }

  async function confirmar() {
    if (elegidos.length === 0) return;
    if (!nombre.trim() || !whatsapp.trim()) {
      setError("Necesitamos tu nombre y tu WhatsApp para coordinar el regalo.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const totalVerificado = await crearPedidoGiftbox({
        items: elegidos,
        formato,
        nombre: nombre.trim(),
        whatsapp: whatsapp.trim(),
        deviceId: getDeviceId(),
      });
      setConfirmado({ items: elegidos, total: totalVerificado, formato });
      setSeleccion({});
      setNombre("");
      setWhatsapp("");
    } catch {
      setError("No pudimos registrar tu Gift Box. Probá de nuevo en unos segundos.");
    } finally {
      setEnviando(false);
    }
  }

  if (confirmado) {
    return (
      <main className="theme-gift bg-gift text-gift-foreground">
        <Reveal as="section" className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Gift className="size-8" />
          </span>
          <h1 className="font-serif-editorial mt-6 text-[52px] leading-[1.02]">
            Tu Gift Box está en camino
          </h1>
          <p className="mt-3 text-primary-foreground/70">
            Te escribimos por WhatsApp con el link de pago y el formulario para personalizar el
            regalo (destinatario, dedicatoria y fecha).
            {confirmado.formato === "fisico"
              ? " Si es física, recordá que la preparación requiere 48 hs de anticipación."
              : ""}
          </p>
          <ul className="mx-auto mt-8 space-y-2 text-left">
            {confirmado.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-md border border-gift-foreground/15 px-4 py-3"
              >
                <span>{item.nombre}</span>
                <span className="shrink-0 text-primary-foreground">
                  {formatearPrecio(Number(item.precio))}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-pill text-primary-foreground/70">Total</p>
          <p className="font-serif-editorial text-5xl text-primary-foreground">
            {formatearPrecio(confirmado.total)}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => setConfirmado(null)}>
              Armar otra caja
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </Reveal>
      </main>
    );
  }

  return (
    <main className="theme-gift bg-gift text-gift-foreground">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <Secuencia pagina>
            <p data-m-seq="eyebrow" className="text-sobretitulo font-bold text-primary-foreground">
              Gift Box · Regalá La Costa
            </p>
            <SplitWords
              as="h1"
              enSecuencia
              preservarSaltos
              className="mt-5 text-titulo"
              text={"Una caja.\nMuchas experiencias."}
            />
            <p data-m-seq="desc" className="mt-6 max-w-xl text-cuerpo text-primary-foreground/80">
              Elegí momentos reales del Partido de la Costa y armá un regalo a medida: una cena, un
              masaje, una tarde de surf. Todo en una sola caja.
            </p>
          </Secuencia>
          <RevealGroup as="ol" alCargar className="space-y-4">
            {PASOS.map((paso, index) => (
              <li key={paso.titulo} className="flex gap-4 glass-dark rounded-[28px] p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gift-accent/15 text-primary-foreground">
                  <paso.icon className="size-5" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold">
                    <span className="text-primary-foreground">0{index + 1}</span> · {paso.titulo}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-primary-foreground/70">{paso.texto}</p>
                </div>
              </li>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="relative border-t border-primary-foreground/10">
        {/* Centinela del alto de la sección: un elemento de 0px se salta al hacer scroll rápido. */}
        <div
          ref={centinela}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 bottom-0 !animate-none"
        />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-subtitulo">Armador de experiencias</h2>
            <p className="mt-2 text-cuerpo text-primary-foreground/80">
              Tocá las tarjetas que quieras incluir. El total se actualiza solo.
            </p>
          </Reveal>

          {items.isLoading ? (
            <p className="mt-10 text-primary-foreground/60">Cargando experiencias…</p>
          ) : (
            <div className="mt-10 space-y-12 pb-16">
              {CATEGORIAS.map((categoria) => {
                const deCategoria = (items.data ?? []).filter(
                  (item) => item.categoria === categoria.id,
                );
                if (deCategoria.length === 0) return null;
                return (
                  <div key={categoria.id}>
                    <Reveal>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h3 className="font-display text-2xl font-bold text-primary-foreground">
                          {categoria.titulo}
                        </h3>
                        <p className="text-sm text-primary-foreground/60">{categoria.detalle}</p>
                      </div>
                    </Reveal>
                    <RevealGroup className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {deCategoria.map((item) => {
                        const activo = Boolean(seleccion[item.id]);
                        const lugar = lugarDelItem(item, data.comercios);
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "relative flex h-full flex-col rounded-[28px] border p-5 transition-all active:scale-[0.99]",
                              activo
                                ? "border-gift-accent bg-gift-accent/15 shadow-premium"
                                : "border-gift-foreground/15 bg-gift-foreground/5 hover:border-gift-accent/50 hover:bg-gift-foreground/10",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => toggle(item)}
                              aria-pressed={activo}
                              className="absolute inset-0 rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gift-accent/70"
                            >
                              <span className="sr-only">
                                {activo ? "Quitar" : "Elegir"} {item.nombre} de la Gift Box
                              </span>
                            </button>
                            <div className="pointer-events-none relative flex h-full flex-col">
                              <span className="text-cuerpo !font-light">{item.nombre}</span>
                              {lugar ? (
                                <span className="mt-1.5 flex items-center gap-1.5 text-sm text-primary-foreground/60">
                                  <MapPin className="size-3.5 shrink-0" />
                                  <span className="min-w-0 truncate">{lugar}</span>
                                </span>
                              ) : null}
                              <Link
                                to="/gift-box/$itemId"
                                params={{ itemId: item.id }}
                                aria-label={`Ver más de ${item.nombre}`}
                                className="pointer-events-auto -mt-1 inline-flex min-h-11 items-center self-start text-sm text-primary-foreground/80 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gift-accent/70"
                              >
                                Ver más →
                              </Link>
                              <span className="mt-auto flex items-center justify-between pt-3">
                                <span className="text-cuerpo !font-semibold tnum text-primary-foreground">
                                  {formatearPrecio(Number(item.precio))}
                                </span>
                                <span
                                  className={cn(
                                    "flex size-7 items-center justify-center rounded-full border",
                                    activo
                                      ? "border-gift-accent bg-gift-accent text-gift"
                                      : "border-gift-foreground/30",
                                  )}
                                >
                                  {activo ? <Check className="size-4" /> : null}
                                </span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </RevealGroup>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div data-visible={barraVisible} className="barra-gift barra-gift-sticky">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative isolate">
                <p className="text-xs uppercase tracking-widest text-primary-foreground/60">
                  {elegidos.length}{" "}
                  {elegidos.length === 1 ? "experiencia elegida" : "experiencias elegidas"}
                </p>
                <p className="text-cuerpo !font-semibold tnum text-primary-foreground">
                  {formatearPrecio(total)}
                </p>
              </div>
              <div className="w-full sm:w-auto">
                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                  {(["digital", "fisico"] as GiftboxFormato[]).map((opcion) => (
                    <button
                      key={opcion}
                      type="button"
                      onClick={() => setFormato(opcion)}
                      className={cn(
                        "min-w-0 rounded-full border px-3 py-2 text-sm font-semibold transition-colors sm:px-4",
                        formato === opcion
                          ? "border-gift-accent bg-gift-accent text-gift"
                          : "border-primary-foreground/25 text-primary-foreground/80 hover:bg-primary-foreground/10",
                      )}
                    >
                      {opcion === "digital" ? "Digital · WhatsApp" : "Física · 48 hs"}
                    </button>
                  ))}
                </div>
                <div className="relative mt-2 min-h-4 text-xs leading-4 text-primary-foreground/70 sm:text-right sm:whitespace-nowrap">
                  <p
                    className={cn(
                      "absolute inset-x-0 top-0",
                      formato !== "digital" && "invisible",
                    )}
                  >
                    Presentación digital en pocas horas por WhatsApp
                  </p>
                  <p className={cn(formato !== "fisico" && "invisible")}>
                    Presentación física lista para regalar - entrega en 48hs
                  </p>
                </div>
              </div>
            </div>

            {elegidos.length > 0 && (
              <>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <div className="space-y-1">
                  <Label htmlFor="gb-nombre" className="text-xs text-primary-foreground/70">
                    Tu nombre
                  </Label>
                  <Input
                    id="gb-nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                    placeholder="Ana"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gb-wsp" className="text-xs text-primary-foreground/70">
                    Tu WhatsApp
                  </Label>
                  <Input
                    id="gb-wsp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                    placeholder="2257 400000"
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full self-end bg-primary text-primary-foreground shadow-glow hover:bg-primary-hover sm:w-auto"
                  onClick={confirmar}
                  disabled={enviando}
                >
                  {enviando ? "Enviando…" : "Confirmar Gift Box"}
                </Button>
                </div>
                <p className="-mt-2 text-xs leading-4 text-primary-foreground/70">
                  💡Recordá ingresar tus datos! En el siguiente paso recibirás el link de pago y el
                  formulario para personalizar el regalo (destinatario, dedicatoria y fecha).
                </p>
              </>
            )}
            {error && <p className="text-sm text-accent">{error}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
