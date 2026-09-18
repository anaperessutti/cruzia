import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { CommerceGrid } from "@/components/public/commerce-grid";
import { StickyFilters } from "@/components/public/sticky-filters";
import { usePublicDirectory } from "@/components/public/public-directory-provider";

export const Route = createFileRoute("/cupones")({
  head: () => ({ meta: [
    { title: "Cupones activos | AUNA" }, { name: "description", content: "Encontrá promociones y cupones vigentes en comercios del Partido de la Costa." },
    { property: "og:title", content: "Cupones activos | AUNA" }, { property: "og:description", content: "Beneficios vigentes para disfrutar La Costa." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CuponesPage,
});

function CuponesPage() {
  const { setSoloCupon } = usePublicDirectory();
  useEffect(() => { setSoloCupon(true); }, [setSoloCupon]);
  return <main><section className="bg-secondary text-secondary-foreground"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase">Beneficios vigentes</p><h1 className="mt-3 font-display text-4xl font-extrabold sm:text-6xl">Cupones que hacen rendir tu verano.</h1></div></section><StickyFilters /><CommerceGrid title="Comercios con cupón" /></main>;
}