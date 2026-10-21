import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { HomeCarousels } from "@/components/public/home-carousels";
import { PremiumHero } from "@/components/public/premium-hero";
import { Secuencia } from "@/components/public/motion";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Cruzia | Cupones y beneficios en La Costa" },
    { name: "description", content: "Descubrí comercios, cupones y experiencias en el Partido de la Costa con Cruzia." },
    { property: "og:title", content: "Cruzia | Beneficios en La Costa" },
    { property: "og:description", content: "Todo lo bueno del Partido de la Costa, más cerca." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:image", content: "https://www.cruzia.ar/__l5e/assets-v1/21f65caf-705c-4c29-96a6-099b342a4202/cruzia-og.jpg" },
    { name: "twitter:image", content: "https://www.cruzia.ar/__l5e/assets-v1/21f65caf-705c-4c29-96a6-099b342a4202/cruzia-og.jpg" },
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
  return (
    <Secuencia as="main" className="relative isolate overflow-clip">
      <PremiumHero />
      {/* Las filas suben sobre el hero que se disuelve: sin cortes entre ambos. */}
      <div className="relative z-10 -mt-16">
        <HomeCarousels />
      </div>
    </Secuencia>
  );
}
