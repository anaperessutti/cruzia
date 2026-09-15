import { MapPin, Star, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { usePublicDirectory } from "./public-directory-provider";

export function CommerceGrid({ title = "Para disfrutar La Costa" }: { title?: string }) {
  const { data, filteredComercios, isLoading } = usePublicDirectory();
  const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
  const localidadById = new Map(data.localidades.map((item) => [item.id, item]));
  const rubroById = new Map(data.rubros.map((item) => [item.id, item]));
  const couponIds = new Set(data.cupones.map((item) => item.comercio_id));

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-secondary">Elegidos para vos</p><h2 className="mt-2 font-display text-3xl font-extrabold text-primary sm:text-4xl">{title}</h2></div><span className="text-sm text-muted-foreground">{filteredComercios.length} lugares</span></div>
      {isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-80 animate-pulse rounded-md bg-muted" />)}</div> : null}
      {!isLoading && filteredComercios.length === 0 ? <div className="border-y border-border py-16 text-center"><p className="font-display text-2xl font-bold text-primary">Todavía no hay resultados para esta combinación.</p><p className="mt-2 text-sm text-muted-foreground">Probá sumando otra localidad o cambiando el rubro.</p></div> : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredComercios.map((item) => {
          const plan = planById.get(item.plan_id);
          const isFeatured = plan?.aparece_en_hero_banner ?? false;
          return <article key={item.id} className={isFeatured ? "group overflow-hidden rounded-md border-2 border-secondary bg-card shadow-premium" : "group overflow-hidden rounded-md border border-border bg-card"}><div className="relative aspect-[4/3] overflow-hidden bg-muted">{item.galeria[0] ? <img src={item.galeria[0]} alt={item.nombre} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="flex size-full items-center justify-center bg-wave-pattern"><span className="font-display text-5xl font-extrabold text-primary/20">OLA!</span></div>}{isFeatured ? <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground"><Star className="mr-1 size-3 fill-current" /> Destacado</Badge> : null}{couponIds.has(item.id) ? <Badge className="absolute bottom-3 right-3 bg-accent text-accent-foreground"><Ticket className="mr-1 size-3" /> Cupón activo</Badge> : null}</div><div className="p-5"><p className="text-xs font-bold uppercase text-secondary">{rubroById.get(item.rubro_id ?? "")?.nombre ?? "Comercio local"}</p><h3 className="mt-1 font-display text-xl font-bold text-primary">{item.nombre}</h3>{item.localidad_id ? <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4" />{localidadById.get(item.localidad_id)?.nombre}</p> : null}</div></article>;
        })}
      </div>
    </section>
  );
}