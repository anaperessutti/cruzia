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
    { title: "Comercio | OLA!" },
    { name: "description", content: "Ficha del comercio: promociones, contacto, horarios y ubicación en el Partido de la Costa." },
    { property: "og:title", content: "Comercio | OLA!" },
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
  const rubro = data.rubros.find((item) => item.id === comercio?.rubro_id);
  const localidad = data.localidades.find((item) => item.id === comercio?.localidad_id);
  const cupones = data.cupones.filter((item) => item.comercio_id === comercioId);

  if (isLoading) return <main className="mx-auto max-w-5xl px-4 py-20"><div className="h-80 animate-pulse rounded-md bg-muted" /></main>;

  if (!comercio) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold text-primary">No encontramos este comercio.</h1>
        <p className="mt-3 text-muted-foreground">Puede que ya no esté publicado.</p>
        <Button asChild className="mt-6"><Link to="/">Volver al inicio</Link></Button>
      </main>
    );
  }

  const conPromocion = plan?.tiene_modulo_promocion ?? false;
  const exclusivo = plan?.aparece_en_hero_banner ?? false;
  const redes = (comercio.redes_sociales ?? {}) as Record<string, string>;
  const mapQuery = comercio.lat != null && comercio.lng != null
    ? `${comercio.lat},${comercio.lng}`
    : encodeURIComponent(`${comercio.direccion ?? comercio.nombre}, ${localidad?.nombre ?? "Partido de la Costa"}, Argentina`);

  return (
    <main>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <p className="text-xs font-bold uppercase text-accent">{rubro?.nombre ?? "Comercio local"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{comercio.nombre}</h1>
            {exclusivo && plan ? <Badge className="bg-secondary text-secondary-foreground"><Crown className="mr-1 size-3 fill-current" /> {plan.nombre}</Badge> : null}
          </div>
          {localidad ? <p className="mt-3 flex items-center gap-1.5 text-sm opacity-90"><MapPin className="size-4" /> {localidad.nombre}{comercio.direccion ? ` · ${comercio.direccion}` : ""}</p> : null}
        </div>
      </section>

      {conPromocion && cupones.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <p className="text-xs font-bold uppercase text-secondary">Módulo de promoción</p>
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
        </section>
      ) : null}

      {comercio.galeria.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {comercio.galeria.map((url) => (
              <img key={url} src={url} alt={`Foto de ${comercio.nombre}`} loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" />
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
            {cupones.length > 0 && conPromocion ? <Button asChild variant="ghost"><Link to="/cupones"><Ticket className="mr-1.5 size-4" /> Ver más cupones</Link></Button> : null}
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <iframe
            title={`Mapa de ${comercio.nombre}`}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            loading="lazy"
            className="h-72 w-full"
          />
        </div>
      </section>
    </main>
  );
}
