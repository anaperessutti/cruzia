import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock, Instagram, MapPin, MessageCircle } from "lucide-react";

import { FadeOrganic } from "@/components/public/fade-organic";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { Reveal, RevealGroup } from "@/components/public/motion";
import { Button } from "@/components/ui/button";
import { formatearPrecio, getGiftboxItems } from "@/lib/giftbox";
import { optimizarImagen } from "@/lib/imagen";

export const Route = createFileRoute("/gift-box_/$itemId")({
  head: () => ({
    meta: [
      { title: "Experiencia Gift Box | Cruzia" },
      { name: "description", content: "Detalle de una experiencia para regalar con Gift Box de Cruzia en el Partido de la Costa." },
      { property: "og:title", content: "Experiencia Gift Box | Cruzia" },
      { property: "og:description", content: "Una experiencia local para sumar a tu Gift Box." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

const fecha = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-AR");
const lleno = (v: string | null | undefined) => (v && v.trim() ? v : null);

function Page() {
  const { data, isLoading } = usePublicDirectory();
  if (isLoading) return <main className="theme-gift bg-gift min-h-[60vh]" />;
  if (!data.giftBoxVisible) return <Navigate to="/" replace />;
  return <Ficha />;
}

function Ficha() {
  const { itemId } = Route.useParams();
  const { data } = usePublicDirectory();
  const items = useQuery({ queryKey: ["giftbox-items"], queryFn: getGiftboxItems, staleTime: 60_000 });

  if (items.isLoading) return <main className="theme-gift bg-gift min-h-[60vh]" />;
  const item = (items.data ?? []).find((i) => i.id === itemId);
  if (!item) return <Navigate to="/gift-box" replace />;

  const comercio = item.comercio_id ? data.comercios.find((c) => c.id === item.comercio_id) : undefined;
  const lugar = lleno(item.lugar) ?? comercio?.nombre ?? null;
  const galeria = item.galeria?.length ? item.galeria : (comercio?.galeria ?? []);
  const portada = item.imagen_url ?? galeria[0] ?? null;
  const resto = item.imagen_url ? galeria : galeria.slice(1);
  const direccion = lleno(item.direccion) ?? lleno(comercio?.direccion);
  const localidadId = item.localidad_id ?? comercio?.localidad_id ?? null;
  const localidad = data.localidades.find((l) => l.id === localidadId)?.nombre ?? null;
  const horarios = lleno(item.horarios) ?? lleno(comercio?.horarios);
  const whatsapp = lleno(item.whatsapp) ?? lleno(comercio?.whatsapp);
  const redesItem = (item.redes_sociales ?? {}) as Record<string, string>;
  const redes = Object.keys(redesItem).length ? redesItem : ((comercio?.redes_sociales ?? {}) as Record<string, string>);
  const lat = item.lat ?? comercio?.lat ?? null;
  const lng = item.lng ?? comercio?.lng ?? null;
  const mapQuery =
    lat != null && lng != null
      ? `${lat},${lng}`
      : direccion || localidad
        ? encodeURIComponent(`${direccion ?? lugar ?? ""}, ${localidad ?? "Partido de la Costa"}, Argentina`)
        : null;

  const sedes = comercio
    ? data.comercioSedes
        .filter((s) => s.comercio_id === comercio.id)
        .map((s) => ({
          id: s.id,
          direccion: s.direccion,
          localidad: data.localidades.find((l) => l.id === s.localidad_id)?.nombre ?? null,
          horarios: s.horarios,
        }))
    : [];

  return (
    <main className="theme-gift bg-gift text-gift-foreground">
      <section className="relative h-[62svh] min-h-[420px] max-h-[640px] w-full overflow-clip text-primary-foreground">
        {portada ? (
          <FadeOrganic src={optimizarImagen(portada)} alt={item.nombre} prioridad />
        ) : (
          <div className="frost-neutral absolute inset-0 [mask-image:radial-gradient(ellipse_125%_95%_at_38%_8%,#000_40%,transparent_94%)]" />
        )}
        <div aria-hidden="true" className="veil-radial absolute inset-0" />
        <div className="text-shadow-soft relative mx-auto flex h-full max-w-5xl flex-col justify-end px-5 pb-[46%] sm:px-6 sm:pb-[22%]">
          <p className="mb-3 text-sobretitulo font-medium text-gift-accent">{item.categoria}</p>
          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.035em] break-words sm:text-6xl">
            {lugar ?? item.nombre}
          </h1>
          {localidad || direccion ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-primary-foreground/90">
              <MapPin className="size-4 shrink-0" /> {[localidad, direccion].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:px-6">
        <Reveal>
          <article className="glass-dark rounded-[28px] p-5 sm:p-7">
            <h2 className="font-display text-2xl font-bold leading-tight text-primary-foreground sm:text-3xl">{item.nombre}</h2>
            <p className="mt-2 text-lg font-semibold text-gift-accent">{formatearPrecio(Number(item.precio))}</p>
            {item.vigencia_inicio && item.vigencia_fin ? (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-primary-foreground/80">
                <CalendarDays className="size-4" /> Vigente del {fecha(item.vigencia_inicio)} al {fecha(item.vigencia_fin)}
              </p>
            ) : null}
          </article>
        </Reveal>
      </section>

      {resto.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <RevealGroup className="grid gap-3 sm:grid-cols-3">
            {resto.map((url) => (
              <img key={url} src={optimizarImagen(url)} alt={item.nombre} loading="lazy" decoding="async" width={800} height={600} className="aspect-[4/3] w-full rounded-[28px] object-cover" />
            ))}
          </RevealGroup>
        </section>
      ) : null}

      <Reveal as="section" className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div>
          {item.descripcion ? <p className="text-base leading-relaxed text-primary-foreground">{item.descripcion}</p> : null}
          {horarios ? (
            <p className="mt-5 flex items-start gap-2 text-sm text-primary-foreground/75"><Clock className="mt-0.5 size-4 shrink-0" /> {horarios}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {whatsapp ? (
              <Button asChild variant="outline"><a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-1.5 size-4" /> WhatsApp</a></Button>
            ) : null}
            {Object.entries(redes).map(([nombre, url]) =>
              typeof url === "string" && url ? (
                <Button key={nombre} asChild variant="outline"><a href={url} target="_blank" rel="noreferrer"><Instagram className="mr-1.5 size-4" /> {nombre}</a></Button>
              ) : null,
            )}
            <Button asChild variant="ghost"><Link to="/gift-box"><ArrowLeft className="mr-1.5 size-4" /> Volver a Gift Box</Link></Button>
          </div>
        </div>
        {mapQuery ? (
          <div className="glass-dark overflow-hidden rounded-[32px] p-1.5">
            <iframe title={`Mapa de ${lugar ?? item.nombre}`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" className="h-72 w-full rounded-[26px]" />
          </div>
        ) : null}
      </Reveal>

      {sedes.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
          <Reveal><h2 className="font-display text-2xl font-extrabold text-primary-foreground">Otras sedes de {comercio?.nombre}</h2></Reveal>
          <RevealGroup className="mt-5 grid gap-4 lg:grid-cols-2">
            {sedes.map((s) => (
              <article key={s.id} className="glass-dark space-y-2 rounded-[24px] p-4">
                <p className="font-semibold text-primary-foreground">{s.direccion ?? comercio?.nombre}</p>
                {s.localidad ? <p className="flex items-center gap-1.5 text-sm text-primary-foreground/75"><MapPin className="size-4" /> {s.localidad}</p> : null}
                {s.horarios ? <p className="flex items-start gap-1.5 text-sm text-primary-foreground/75"><Clock className="mt-0.5 size-4" /> {s.horarios}</p> : null}
              </article>
            ))}
          </RevealGroup>
        </section>
      ) : null}
    </main>
  );
}
