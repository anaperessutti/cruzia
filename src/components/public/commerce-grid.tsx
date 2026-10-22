import { CommerceCard } from "./commerce-card";
import { EventoCard } from "./evento-card";
import { usePublicDirectory } from "./public-directory-provider";
import { CardReveal, SplitWords, useRevealCabecera } from "./motion";

export function CommerceGrid({ title = "Para disfrutar La Costa" }: { title?: string }) {
  const { data, tarjetas, isLoading } = usePublicDirectory();
  const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
  const localidadById = new Map(data.localidades.map((item) => [item.id, item]));
  const cabeceraRef = useRevealCabecera<HTMLDivElement>();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div ref={cabeceraRef} data-m-head="" className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p data-m-head-el="eyebrow" className="text-sobretitulo font-bold text-secondary">Elegidos para vos</p><SplitWords as="h2" enCabecera className="mt-2 text-subtitulo text-foreground" text={title} /></div><span data-m-head-el="cta" className="shrink-0 text-sm text-muted-foreground">{tarjetas.length} {tarjetas.length === 1 ? "lugar" : "lugares"}</span></div>
      {isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-80 animate-pulse rounded-md bg-muted" />)}</div> : null}
      {!isLoading && tarjetas.length === 0 ? <CardReveal><div className="border-y border-border py-16 text-center"><p className="font-display text-2xl font-bold text-foreground">Todavía no hay resultados para esta combinación.</p><p className="mt-2 text-sm text-muted-foreground">Probá sumando otra localidad o cambiando la categoría.</p></div></CardReveal> : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((tarjeta) => tarjeta.tipo === "evento" ? (
          <CardReveal key={tarjeta.key}><EventoCard evento={tarjeta.evento} localidad={localidadById.get(tarjeta.evento.localidad_id ?? "")} /></CardReveal>
        ) : (
          <CardReveal key={tarjeta.key}><CommerceCard comercio={tarjeta.comercio} cupon={tarjeta.cupon} plan={planById.get(tarjeta.comercio.plan_id)} localidad={localidadById.get(tarjeta.comercio.localidad_id ?? "")} /></CardReveal>
        ))}
      </div>
    </section>
  );
}
