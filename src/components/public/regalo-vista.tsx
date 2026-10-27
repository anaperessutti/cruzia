import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, CheckCircle2, Clock, MapPin } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/public/motion";
import { optimizarImagen } from "@/lib/imagen";
import {
  linkMaps,
  OCASION,
  textoCanjeada,
  textoVigencia,
  tituloBienvenida,
  type Presentacion,
  type RegaloOk,
} from "@/lib/regalo";

export function useQr(texto: string) {
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    void import("qrcode").then((m) =>
      m.toDataURL(texto, { margin: 1, width: 360, color: { dark: "#1a1614", light: "#ffffff" } }).then((u) => vivo && setQr(u)),
    );
    return () => {
      vivo = false;
    };
  }, [texto]);
  return qr;
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Reveal as="section" className="glass rounded-[32px] p-6 sm:p-8">
      <h2 className="text-sobretitulo text-primary font-medium">{titulo}</h2>
      <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-primary-foreground/80">{children}</div>
    </Reveal>
  );
}

export function RegaloVista({
  info,
  presentacion,
  acciones,
}: {
  info: RegaloOk;
  presentacion: Presentacion | null;
  acciones?: ReactNode;
}) {
  const qr = useQr(info.codigo);
  const portada = optimizarImagen(presentacion?.imagen_portada ?? null);
  const logo = optimizarImagen(presentacion?.logo ?? null);
  const fondo = optimizarImagen(presentacion?.imagen_fondo ?? null);
  const ocasion = info.ocasion ? OCASION[info.ocasion] ?? info.ocasion : "";

  return (
    <div className="relative">
      {fondo && (
        <img src={fondo} alt="" aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-20" />
      )}
      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-20 pt-28 sm:px-6">
        <Reveal as="header" className="glass overflow-hidden rounded-[32px]">
          {portada && <img src={portada} alt="" className="aspect-[1200/630] w-full object-cover" />}
          <div className="p-6 sm:p-8">
            {logo && <img src={logo} alt="Cruzia" className="mb-4 h-10 w-auto object-contain" />}
            <h1 className="font-display text-3xl font-extrabold leading-tight text-primary-foreground sm:text-4xl">
              {tituloBienvenida(presentacion?.titulo_bienvenida, info.agasajado)}
            </h1>
            {info.completado ? (
              <>
                {info.firma && <p className="mt-3 text-lg text-primary-foreground/80">De parte de {info.firma}</p>}
                {ocasion && <p className="mt-1 text-sm text-primary-foreground/70">{ocasion}</p>}
                {info.dedicatoria && (
                  <blockquote className="mt-5 whitespace-pre-line border-l-2 border-primary-foreground/40 pl-4 text-base italic leading-relaxed text-primary-foreground/90">
                    {info.dedicatoria}
                  </blockquote>
                )}
              </>
            ) : (
              <p className="mt-3 text-primary-foreground/70">Estamos terminando de preparar los detalles de este regalo.</p>
            )}
            {acciones && <div className="mt-6 flex flex-wrap gap-2">{acciones}</div>}
          </div>
        </Reveal>

        <RevealGroup className="space-y-4">
          {info.experiencias.map((e) => {
            const maps = linkMaps(e);
            const vig = textoVigencia(e);
            return (
              <article key={e.id} className="glass rounded-[32px] p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-display text-2xl font-extrabold text-primary-foreground">{e.titulo}</h2>
                  {e.canjeada_at && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/40 px-3 py-1 text-xs text-primary-foreground">
                      <CheckCircle2 className="size-3.5" /> {textoCanjeada(e.canjeada_at)}
                    </span>
                  )}
                </div>
                {e.lugar && <p className="mt-1 text-sm text-primary-foreground/80">{e.lugar}</p>}
                <div className="mt-4 space-y-2 text-sm text-primary-foreground/75">
                  {e.direccion && (
                    <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> {e.direccion}</p>
                  )}
                  {e.horarios && (
                    <p className="flex items-start gap-2"><Clock className="mt-0.5 size-4 shrink-0" /> {e.horarios}</p>
                  )}
                  {vig && (
                    <p className="flex items-start gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0" /> {vig}</p>
                  )}
                </div>
                {e.descripcion && <p className="mt-4 whitespace-pre-line leading-relaxed text-primary-foreground/90">{e.descripcion}</p>}
                {maps && (
                  <a href={maps} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
                    Ver en Google Maps →
                  </a>
                )}
                {e.como_canjear && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-primary-foreground">Cómo canjear</h3>
                    <p className="mt-1 whitespace-pre-line text-sm text-primary-foreground/75">{e.como_canjear}</p>
                  </div>
                )}
                {e.condiciones && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-primary-foreground">Condiciones</h3>
                    <p className="mt-1 whitespace-pre-line text-sm text-primary-foreground/75">{e.condiciones}</p>
                  </div>
                )}
              </article>
            );
          })}
        </RevealGroup>

        <Reveal as="section" className="glass flex flex-col items-center rounded-[32px] p-6 text-center sm:p-8">
          <h2 className="text-sobretitulo text-primary font-medium">Tu código de canje</h2>
          <p className="mt-3 font-mono text-3xl font-semibold tracking-[0.2em] text-primary-foreground">{info.codigo}</p>
          <div className="mt-5 size-44 overflow-hidden rounded-2xl bg-card">
            {qr && <img src={qr} alt={`Código QR ${info.codigo}`} className="size-full" />}
          </div>
          <p className="mt-3 text-xs text-primary-foreground/70">Mostralo en el lugar al canjear cada experiencia.</p>
        </Reveal>

        {presentacion?.texto_como_canjear && <Bloque titulo="Cómo canjear">{presentacion.texto_como_canjear}</Bloque>}
        {presentacion?.condiciones_generales && <Bloque titulo="Condiciones generales">{presentacion.condiciones_generales}</Bloque>}
        {presentacion?.contacto_soporte && <Bloque titulo="¿Necesitás ayuda?">{presentacion.contacto_soporte}</Bloque>}
      </div>
    </div>
  );
}
