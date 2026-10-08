import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

import { CommerceGrid } from "@/components/public/commerce-grid";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { StickyFilters } from "@/components/public/sticky-filters";

type CategoriasSearch = { coleccion?: string | undefined; localidades?: string | undefined };

export const Route = createFileRoute("/categorias")({
  validateSearch: (search: Record<string, unknown>): CategoriasSearch => ({
    coleccion: typeof search["coleccion"] === "string" ? search["coleccion"] : undefined,
    localidades: typeof search["localidades"] === "string" ? search["localidades"] : undefined,
  }),
  head: () => ({ meta: [
    { title: "Categorías | Cruzia" }, { name: "description", content: "Explorá las 12 categorías de experiencias, comercios y servicios del Partido de la Costa." },
    { property: "og:title", content: "Categorías de comercios | Cruzia" }, { property: "og:description", content: "Todo lo que buscás en el Partido de la Costa, por categoría." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const search = Route.useSearch();
  const { data, filters, setColeccionIds, setLocalidadIds } = usePublicDirectory();
  useEffect(() => {
    setColeccionIds(search.coleccion?.split(",").filter(Boolean) ?? []);
    if (search.localidades) setLocalidadIds(search.localidades.split(",").filter(Boolean));
    return () => setColeccionIds([]);
  }, [search.coleccion, search.localidades, setColeccionIds, setLocalidadIds]);
  const coleccionSeleccionada = filters.coleccionIds.length === 1
    ? data.colecciones.find((item) => item.id === filters.coleccionIds[0])
    : undefined;
  const tituloGrilla = coleccionSeleccionada?.nombre ?? "Elegí tu mejor opción";
  const mostrarCategorias = !search.coleccion && filters.coleccionIds.length === 0;
  return <main>{mostrarCategorias ? <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase text-secondary">Explorá a tu manera</p><h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-foreground sm:text-6xl">Todo lo que te gusta, cerca.</h1><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.colecciones.map((item, index) => <Link key={item.id} to="/categorias" search={{ coleccion: item.id }} className="group flex min-h-32 items-end justify-between rounded-md border border-border bg-card p-5 transition-colors hover:border-secondary hover:bg-muted"><span><span className="block text-xs font-bold text-secondary">{String(index + 1).padStart(2, "0")}</span><span className="mt-2 block font-display text-xl font-bold text-foreground">{item.nombre}</span></span><ArrowRight className="text-secondary transition-transform group-hover:translate-x-1" /></Link>)}</div></section> : null}<StickyFilters /><CommerceGrid title={tituloGrilla} /></main>;
}