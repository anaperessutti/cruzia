import { FadeOrganic } from "@/components/public/fade-organic";
import { Reveal } from "@/components/public/reveal";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Comercio, Evento, Localidad } from "@/lib/public-data";

export const Route = createFileRoute("/eventos/$eventoId")({
  head: () => ({
    meta: [
      { title: "Evento | Cruzia" },
      { name: "description", content: "Detalle del evento: fechas, lugar y de qué se trata, en el Partido de la Costa." },
      { property: "og:title", content: "Evento | Cruzia" },
      { property: "og:description", content: "Detalle del evento en el Partido de la Costa." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventoPage,
});

type Detalle = { evento: Evento; comercio: Comercio | null; localidad: Localidad | null };

async function getEvento(id: string): Promise<Detalle | null> {
  const { data, error } = await supabase.from("eventos").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [comercio, localidad] = await Promise.all([
    data.comercio_id
      ? supabase.from("comercios").select("*").eq("id", data.comercio_id).maybeSingle()
      : Promise.resolve({ data: null }),
    data.localidad_id
      ? supabase.from("localidades").select("*").eq("id", data.localidad_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return { evento: data, comercio: comercio.data ?? null, localidad: localidad.data ?? null };
}

function fecha(valor: string) {
  return new Date(`${valor}T00:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

function EventoPage() {
  const { eventoId } = useParams({ from: "/eventos/$eventoId" });
  const { data, isLoading } = useQuery({ queryKey: ["evento", eventoId], queryFn: () => getEvento(eventoId) });

  if (isLoading) {
    return <main className="mx-auto max-w-4xl px-4 py-20"><div className="h-72 animate-pulse rounded-md bg-muted" /></main>;
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold text-foreground">Este evento ya no está disponible.</h1>
        <p className="mt-3 text-muted-foreground">Puede que haya terminado. Mirá todo lo que está pasando ahora.</p>
        <Button asChild className="mt-6"><Link to="/">Volver al inicio</Link></Button>
      </main>
    );
  }

  const { evento, comercio, localidad } = data;

  return (
    <main>
      <section className="relative">
        {evento.imagen_url
          ? <div className="relative -mb-14 h-[52svh] min-h-[360px] max-h-[560px] w-full overflow-clip"><FadeOrganic src={evento.imagen_url} alt={evento.titulo} /></div>
          : <div className="aspect-[16/7] w-full overflow-hidden"><div className="flex size-full items-center justify-center bg-wave-pattern"><span className="font-display text-6xl font-extrabold text-foreground/15">Cruzia</span></div></div>}
      </section>
      <Reveal as="section" className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-xs font-bold uppercase text-secondary">Evento</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-foreground sm:text-5xl">{evento.titulo}</h1>
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <CalendarDays className="size-4" />
          {evento.fecha_inicio === evento.fecha_fin ? fecha(evento.fecha_inicio) : `Del ${fecha(evento.fecha_inicio)} al ${fecha(evento.fecha_fin)}`}
        </p>
        {localidad ? <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" />{localidad.nombre}</p> : null}
        {evento.descripcion ? <p className="mt-6 whitespace-pre-line text-base leading-7 text-foreground">{evento.descripcion}</p> : null}
        {comercio ? (
          <div className="mt-8 rounded-md border border-border p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Store className="size-4" /> Organiza</p>
            <p className="mt-1 font-display text-xl font-bold text-foreground">{comercio.nombre}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/comercio/$comercioId" params={{ comercioId: comercio.id }}>Ver el comercio</Link>
            </Button>
          </div>
        ) : null}
      </Reveal>
    </main>
  );
}
