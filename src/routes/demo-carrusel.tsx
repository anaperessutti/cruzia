import { createFileRoute } from "@tanstack/react-router";

import heroImage from "@/assets/auna-costa-hero.jpg";
import { CarruselSeccion } from "@/components/public/carrusel-seccion";

export const Route = createFileRoute("/demo-carrusel")({
  head: () => ({ meta: [
    { title: "Demo carrusel | AUNA" }, { name: "description", content: "Demo temporal del componente de carrusel horizontal del Home." },
    { property: "og:title", content: "Demo carrusel | AUNA" }, { property: "og:description", content: "Demo temporal del componente de carrusel horizontal del Home." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DemoCarruselPage,
});

const TARJETAS_ALMUERZOS = [
  { nombre: "Parrilla El Muelle", etiqueta: "Gastronomía" },
  { nombre: "La Costa Burgers", etiqueta: "Delivery" },
  { nombre: "Pizzería Don Juan", etiqueta: "Tapeos" },
  { nombre: "Rotisería Mar Azul", etiqueta: "Take away" },
  { nombre: "Cervecería del Faro", etiqueta: "Cenas" },
  { nombre: "Empanadas del Pueblo", etiqueta: "Almuerzos" },
];

const TARJETAS_PLAYA = [
  { nombre: "Parasoles La Costa", etiqueta: "Playa" },
  { nombre: "Kayaks San Sebastián", etiqueta: "Aire libre" },
  { nombre: "Beach Club Arena", etiqueta: "Playa" },
  { nombre: "Surf School Costa", etiqueta: "Aire libre" },
  { nombre: "Frente al Mar Quinchos", etiqueta: "Playa" },
  { nombre: "Fishing La Costa", etiqueta: "Aire libre" },
  { nombre: "Duendes del Camino", etiqueta: "Playa" },
];

function DemoCarruselPage() {
  return (
    <main className="space-y-12 py-10">
      <CarruselSeccion
        titulo="Almuerzos y tapeos"
        destinoUrl="/categorias"
        tarjetas={TARJETAS_ALMUERZOS.map((item) => <TarjetaDemo key={item.nombre} {...item} />)}
      />
      <CarruselSeccion
        titulo="Playa y Aire Libre"
        destinoUrl="/categorias"
        tarjetas={TARJETAS_PLAYA.map((item) => <TarjetaDemo key={item.nombre} {...item} />)}
      />
    </main>
  );
}

function TarjetaDemo({ nombre, etiqueta }: { nombre: string; etiqueta: string }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-premium">
      <img
        src={heroImage}
        alt={nombre}
        className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-secondary">{etiqueta}</p>
        <h3 className="mt-1 font-display text-sm font-bold text-primary">{nombre}</h3>
      </div>
    </article>
  );
}
