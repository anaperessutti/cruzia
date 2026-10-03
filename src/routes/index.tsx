import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { HomeCarousels } from "@/components/public/home-carousels";
import { PremiumHero } from "@/components/public/premium-hero";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Cruzia | Cupones y beneficios en La Costa" },
    { name: "description", content: "Descubrí comercios, cupones y experiencias en el Partido de la Costa con Cruzia." },
    { property: "og:title", content: "Cruzia | Beneficios en La Costa" },
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

  // La Barra de Filtros Sticky no se muestra en el Home; el GPS igual corre en el proveedor.
  return <main><PremiumHero /><HomeCarousels /></main>;
}
