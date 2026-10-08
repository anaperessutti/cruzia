import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Clock, Crown, Instagram, MapPin, MessageCircle, Ticket } from "lucide-react";

import { CuponCard } from "@/components/public/cupon-card";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { registrarInteraccionComercio } from "@/lib/cupones";
import { getDeviceId } from "@/lib/device-id";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/comercio/$comercioId")({
  head: () => ({ meta: [
    { title: "Comercio | Cruzia" },
    { name: "description", content: "Ficha del comercio: promociones, contacto, horarios y ubicación en el Partido de la Costa." },
    { property: "og:title", content: "Comercio | Cruzia" },
    { property: "og:description", content: "Promociones, contacto y ubicación de comercios de La Costa." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FichaComercio,
});


function FichaComercio() {
  const { comercioId } = Route.useParams();
  const { data, isLoading } = usePublicDirectory();
  const registrado = useRef<string | null>(null);

  useEffect(() => {
    if (registrado.current === comercioId) return;
    registrado.current = comercioId;
    void registrarInteraccionComercio(comercioId, getDeviceId()).catch(() => {
      /* métrica silenciosa: nunca debe afectar la navegación */
    });
  }, [comercioId]);

  const comercio = data.comercios.find((item) => item.id === comercioId);
  const plan = comercio ? data.planes.find((item) => item.id === comercio.plan_id) : undefined;
  const localidad = data.localidades.find((item) => item.id === comercio?.localidad_id);
  const hoy = new Date().toISOString().slice(0, 10);
  const cupones = data.cupones.filter(
    (item) => item.comercio_id === comercioId && item.activo && item.vigencia_inicio <= hoy && item.vigencia_fin >= hoy,
  );

  if (isLoading) return <main className="mx-auto max-w-5xl px-4 py-20"><div className="h-80 animate-pulse rounded-md bg-muted" /></main>;

  if (!comercio) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold text-foreground">No encontramos este comercio.</h1>
        <p className="mt-3 text-muted-foreground">Puede que ya no esté publicado.</p>
        <Button asChild className="mt-6"><Link to="/">Volver al inicio</Link></Button>
      </main>
    );
  }

  // Sedes: la principal son los campos de la ficha; el resto vienen de comercio_sedes.
  const adicionales = data.comercioSedes.filter((s) => s.comercio_id === comercioId);
  const sedes = adicionales.length
    ? [
        {
          key: "principal",
          direccion: comercio.direccion,
          localidad: localidad?.nombre ?? null,
          horarios: comercio.horarios,
          lat: comercio.lat,
          lng: comercio.lng,
        },
        ...adicionales.map((s) => ({
          key: s.id,
          direccion: s.direccion,
          localidad: data.localidades.find((l) => l.id === s.localidad_id)?.nombre ?? null,
          horarios: s.horarios,
          lat: s.lat,
          lng: s.lng,
        })),
      ]
    : [];
  /** Solo las promociones con sedes elegidas a mano: sin fila, aplican a todas. */
  const sedesDeCupon = new Map<string, Set<string>>();
  for (const cs of data.cuponSedes) {
    const set = sedesDeCupon.get(cs.cupon_id) ?? new Set<string>();
    set.add(cs.sede_id ?? "principal");
    sedesDeCupon.set(cs.cupon_id, set);
  }

  const conPromocion = plan?.tiene_modulo_promocion ?? false;
  const exclusivo = plan?.aparece_en_hero_banner ?? false;
  const redes = (comercio.redes_sociales ?? {}) as Record<string, string>;
  const mapQuery = comercio.lat != null && comercio.lng != null
    ? `${comercio.lat},${comercio.lng}`
    : encodeURIComponent(`${comercio.direccion ?? comercio.nombre}, ${localidad?.nombre ?? "Partido de la Costa"}, Argentina`);

  return (
    <main>
      {/* Galería a sangre completa; el header flota encima y el borde inferior se disuelve en el lienzo. */}
      <section className="mask-fade-bottom relative h-[62svh] min-h-[420px] max-h-[640px] w-full overflow-hidden bg-ink text-primary-foreground">
        {comercio.galeria[0] ? <img src={comercio.galeria[0]} alt={`Foto de ${comercio.nombre}`} className="absolute inset-0 size-full object-cover" /> : <div className="bg-orb absolute inset-0 opacity-80" />}
        {comercio.galeria[0] ? <img src={comercio.galeria[0]} alt="" aria-hidden="true" className="glass-progressive absolute inset-0 size-full object-cover" /> : null}
        <div className="absolute inset-0 bg-linear-to-t from-ink/30 via-transparent to-ink/25" />
        <div className="text-shadow-soft relative mx-auto flex h-full max-w-5xl flex-col justify-end px-5 pb-24 sm:px-6 sm:pb-28">
          {exclusivo && plan ? <span className="mb-4 inline-flex w-fit items-center gap-1 rounded-full bg-card px-3 py-1 text-pill text-foreground [text-shadow:none]"><Crown className="size-3 fill-current" /> {plan.nombre}</span> : null}
          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl">{comercio.nombre}</h1>
          {localidad ? <p className="mt-3 flex items-center gap-1.5 text-sm text-primary-foreground/90"><MapPin className="size-4" /> {localidad.nombre}{comercio.direccion ? ` · ${comercio.direccion}` : ""}</p> : null}
        </div>
      </section>

      {conPromocion && cupones.length > 0 ? (
        <section className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:px-6">
          <div className="glass rounded-[32px] p-4 sm:p-6">
          <p className="text-pill text-primary">Módulo de promoción</p>
          <div className="mt-3 grid gap-4">
            {cupones.map((cupon) => (
              <CuponCard
                key={cupon.id}
                comercio={comercio}
                cupon={cupon}
                puedeWhatsapp={plan?.puede_reservar_whatsapp ?? false}
              />
            ))}
          </div>
          </div>
        </section>
      ) : null}

      {comercio.galeria.length > 1 ? (
        <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {comercio.galeria.slice(1).map((url) => (
              <img key={url} src={url} alt={`Foto de ${comercio.nombre}`} loading="lazy" className="aspect-[4/3] w-full rounded-[28px] object-cover shadow-warm" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div>
          {comercio.descripcion ? <p className="text-base leading-relaxed text-foreground">{comercio.descripcion}</p> : null}
          {comercio.horarios ? <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground"><Clock className="mt-0.5 size-4" /> {comercio.horarios}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {comercio.whatsapp ? (
              <Button asChild variant="outline"><a href={`https://wa.me/${comercio.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-1.5 size-4" /> WhatsApp</a></Button>
            ) : null}
            {Object.entries(redes).map(([nombre, url]) => (
              typeof url === "string" && url ? (
                <Button key={nombre} asChild variant="outline"><a href={url} target="_blank" rel="noreferrer"><Instagram className="mr-1.5 size-4" /> {nombre}</a></Button>
              ) : null
            ))}
            {cupones.length > 0 && conPromocion ? <Button asChild variant="ghost"><Link to="/cupones" search={{}}><Ticket className="mr-1.5 size-4" /> Ver más cupones</Link></Button> : null}
          </div>
        </div>
        <div className="glass overflow-hidden rounded-[32px] p-1.5">
          <iframe
            title={`Mapa de ${comercio.nombre}`}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            loading="lazy"
            className="h-72 w-full rounded-[26px]"
          />
        </div>
      </section>

      {sedes.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
          <h2 className="font-display text-2xl font-extrabold text-foreground">Nuestras sedes</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {sedes.map((sede) => {
              const promos = cupones.filter((c) => {
                const soloEn = sedesDeCupon.get(c.id);
                return !soloEn || soloEn.has(sede.key);
              });
              const parciales = promos.filter((c) => sedesDeCupon.has(c.id));
              const q =
                sede.lat != null && sede.lng != null
                  ? `${sede.lat},${sede.lng}`
                  : encodeURIComponent(
                      `${sede.direccion ?? comercio.nombre}, ${sede.localidad ?? "Partido de la Costa"}, Argentina`,
                    );
              return (
                <article key={sede.key} className="overflow-hidden rounded-md border border-border">
                  <div className="space-y-2 p-4">
                    <p className="font-semibold text-foreground">
                      {sede.direccion?.trim() ? sede.direccion : comercio.nombre}
                    </p>
                    {sede.localidad ? (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-4" /> {sede.localidad}
                      </p>
                    ) : null}
                    {sede.horarios ? (
                      <p className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Clock className="mt-0.5 size-4" /> {sede.horarios}
                      </p>
                    ) : null}
                    {parciales.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {parciales.map((c) => (
                          <Badge key={c.id} variant="secondary">
                            <Ticket className="mr-1 size-3" /> {c.titulo}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <iframe
                    title={`Mapa de ${sede.direccion ?? comercio.nombre}`}
                    src={`https://www.google.com/maps?q=${q}&output=embed`}
                    loading="lazy"
                    className="h-56 w-full border-t border-border"
                  />
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
