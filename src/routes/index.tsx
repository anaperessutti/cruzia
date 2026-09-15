import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { CommerceGrid } from "@/components/public/commerce-grid";
import { PremiumHero } from "@/components/public/premium-hero";
import { StickyFilters } from "@/components/public/sticky-filters";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "OLA! | Cupones y beneficios en La Costa" },
    { name: "description", content: "Descubrí comercios, cupones y experiencias en el Partido de la Costa con OLA!." },
    { property: "og:title", content: "OLA! | Beneficios en La Costa" },
    { property: "og:description", content: "Todo lo bueno del Partido de la Costa, más cerca." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const navigate = useNavigate();

  // Si el link de confirmación de email cae en la home, lo llevamos a la
  // pantalla que finaliza el alta de administradora.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const marcas = window.location.hash + window.location.search;
    if (/access_token|type=signup|type=recovery|[?&]code=/.test(marcas)) {
      navigate({ to: "/admin/confirmado", replace: true });
    }
  }, [navigate]);

  return <main><PremiumHero /><StickyFilters /><CommerceGrid /></main>;
}
