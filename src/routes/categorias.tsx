import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

import { CommerceGrid } from "@/components/public/commerce-grid";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { StickyFilters } from "@/components/public/sticky-filters";

export const Route = createFileRoute("/categorias")({
  validateSearch: (search: Record<string, unknown>) => ({
    coleccion: typeof search.coleccion === "string" ? search.coleccion : "",
    localidades: typeof search.localidades === "string" ? search.localidades : "",
  }),
  head: () => ({ meta: [
    { title: "Categorías de comercios | AUNA" }, { name: "description", content: "Explorá gastronomía, alojamiento, playa, compras y servicios en La Costa." },
    { property: "og:title", content: "Categorías de comercios | AUNA" }, { property: "og:description", content: "Todo lo que buscás en el Partido de la Costa, por categoría." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const search = Route.useSearch();
  const { data, setRubroId, setColeccionId, setLocalidadIds } = usePublicDirectory();
  useEffect(() => {
    setColeccionId(search.coleccion);
    if (search.localidades) setLocalidadIds(search.localidades.split(",").filter(Boolean));
    return () => setColeccionId("");
  }, [search.coleccion, search.localidades, setColeccionId, setLocalidadIds]);
  return <main><section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase text-secondary">Explorá a tu manera</p><h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-primary sm:text-6xl">Todo lo que te gusta, cerca.</h1><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.rubros.map((item, index) => <Link key={item.id} to="/categorias" onClick={() => setRubroId(item.id)} className="group flex min-h-32 items-end justify-between rounded-md border border-border bg-card p-5 transition-colors hover:border-secondary hover:bg-muted"><span><span className="block text-xs font-bold text-secondary">0{index + 1}</span><span className="mt-2 block font-display text-xl font-bold text-primary">{item.nombre}</span></span><ArrowRight className="text-secondary transition-transform group-hover:translate-x-1" /></Link>)}</div></section><StickyFilters /><CommerceGrid title="Descubrí por categoría" /></main>;
}