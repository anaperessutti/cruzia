import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { CommerceGrid } from "@/components/public/commerce-grid";
import { StickyFilters } from "@/components/public/sticky-filters";
import { usePublicDirectory } from "@/components/public/public-directory-provider";

type CuponesSearch = { soloCupon?: boolean | undefined; favoritos?: boolean | undefined; localidades?: string | undefined; coleccion?: string | undefined };

export const Route = createFileRoute("/cupones")({
  validateSearch: (search: Record<string, unknown>): CuponesSearch => ({
    soloCupon: search["soloCupon"] === true || search["soloCupon"] === "true" ? true : undefined,
    favoritos: search["favoritos"] === true || search["favoritos"] === "true" ? true : undefined,
    localidades: typeof search["localidades"] === "string" ? search["localidades"] : undefined,
    coleccion: typeof search["coleccion"] === "string" ? search["coleccion"] : undefined,
  }),
  head: () => ({ meta: [
    { title: "Cupones activos | Cruzia" }, { name: "description", content: "Encontrá promociones y cupones vigentes en comercios del Partido de la Costa." },
    { property: "og:title", content: "Cupones activos | Cruzia" }, { property: "og:description", content: "Beneficios vigentes para disfrutar La Costa." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CuponesPage,
});

function CuponesPage() {
  const search = Route.useSearch();
  const { setSoloCupon, setLocalidadIds, setColeccionIds } = usePublicDirectory();
  useEffect(() => {
    setSoloCupon(true);
    setColeccionIds(search.coleccion?.split(",").filter(Boolean) ?? []);
    if (search.localidades) setLocalidadIds(search.localidades.split(",").filter(Boolean));
    return () => setColeccionIds([]);
  }, [search.coleccion, search.localidades, setColeccionIds, setLocalidadIds, setSoloCupon]);
  return <main><section><div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8"><p className="text-pill text-primary">Beneficios vigentes</p><h1 className="mt-3 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-foreground sm:text-7xl"><span className="font-light">Cupones que hacen rendir </span><span className="font-bold">tu verano.</span></h1></div></section><StickyFilters /><CommerceGrid title={search.favoritos ? "Favoritos de la Costa" : "Comercios con cupón"} /></main>;
}