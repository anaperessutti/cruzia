import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Star } from "lucide-react";

import heroImage from "@/assets/auna-costa-hero.jpg";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { estaCerca } from "@/lib/geo";
import type { Comercio, Cupon, Evento } from "@/lib/public-data";
import { usePublicDirectory } from "./public-directory-provider";

function vigente(inicio: string, fin: string) {
  const hoy = new Date().toISOString().slice(0, 10);
  return inicio <= hoy && fin >= hoy;
}

type Slide =
  | { tipo: "comercio"; id: string; comercio: Comercio; promo: Cupon | null }
  | { tipo: "evento"; id: string; evento: Evento };

export function PremiumHero() {
  const { data, userCoords } = usePublicDirectory();
  const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
  const ordenAleatorio = useMemo(
    () => new Map([...data.comercios.map((item) => [item.id, Math.random()] as const), ...data.eventos.map((item) => [item.id, Math.random()] as const)]),
    [data.comercios, data.eventos],
  );
  /** Cupón postulado al Top Slider por ese comercio (uno solo, garantizado por trigger). */
  const cuponTop = (comercioId: string) =>
    data.cupones.find(
      (cupon) => cupon.comercio_id === comercioId && cupon.es_top_slider && cupon.activo && vigente(cupon.vigencia_inicio, cupon.vigencia_fin),
    ) ?? null;

  // Eventos postulados al Top Slider: los independientes no tienen restricción de plan.
  const eventosTop = data.eventos.filter(
    (evento) => evento.es_top_slider && (!evento.hero_alcance_local || estaCerca(userCoords, { lat: evento.lat, lng: evento.lng })),
  );
  const comerciosConEventoTop = new Set(data.eventos.filter((e) => e.es_top_slider && e.comercio_id).map((e) => e.comercio_id));

  // Paso 1: pool elegible para ESTE visitante (alcance global + lo local que le queda dentro de los 10 km).
  const elegiblesParaEsteVisitante: Slide[] = [
    ...data.comercios
      .filter((item) => item.activo && (planById.get(item.plan_id)?.aparece_en_hero_banner ?? false))
      // Si el comercio postuló un evento, su slide es el evento, no la ficha.
      .filter((item) => !comerciosConEventoTop.has(item.id))
      // El alcance sale del anuncio postulado a mano; si no hay ninguno, del propio comercio.
      .filter((item) => {
        const promo = cuponTop(item.id);
        const soloLocal = promo ? promo.hero_alcance_local : item.hero_alcance_local;
        return !soloLocal || estaCerca(userCoords, item);
      })

      .map<Slide>((comercio) => ({ tipo: "comercio", id: comercio.id, comercio, promo: cuponTop(comercio.id) })),
    ...eventosTop.map<Slide>((evento) => ({ tipo: "evento", id: evento.id, evento })),
  ];

  // Paso 2: recién sobre ese pool ya filtrado se sortea y se aplica el tope de 7 slides.
  const seleccion = elegiblesParaEsteVisitante
    .sort((a, b) => (ordenAleatorio.get(a.id) ?? 0) - (ordenAleatorio.get(b.id) ?? 0))
    .slice(0, 7);
  const slides: (Slide | null)[] = seleccion.length > 0 ? seleccion : [null];


  return (
    <section aria-label="Destacados de Cruzia" className="bg-primary">
      <Carousel opts={{ loop: slides.length > 1 }} className="mx-auto max-w-[1600px]">
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => {
            const esEvento = slide?.tipo === "evento";
            const imagen = (esEvento ? slide.evento.imagen_url : slide?.promo?.flyer_url ?? slide?.comercio.galeria[0]) ?? heroImage;
            const titulo = (esEvento ? slide.evento.titulo : slide?.promo?.titulo ?? slide?.comercio.nombre) ?? "Beneficios que te llevan más lejos.";
            const texto = (esEvento ? slide.evento.descripcion : slide?.promo?.descripcion ?? slide?.comercio.descripcion)
              ?? "Descubrí comercios, experiencias y cupones en cada rincón del Partido de la Costa.";
            const etiqueta = esEvento ? "Evento destacado" : slide?.promo ? slide.comercio.nombre : slide ? "Elegido Premium" : "Viví La Costa";
            return (
              <CarouselItem key={slide?.id ?? `brand-${index}`} className="relative h-[68vh] min-h-[430px] max-h-[680px] pl-0">
                <img src={imagen} alt={titulo} width={1600} height={900} className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-hero-overlay" />
                <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
                  <div className="max-w-2xl text-primary-foreground">
                    <div className="mb-4 inline-flex items-center gap-2 border-l-2 border-accent pl-3 text-xs font-bold uppercase"><Star className="size-4 fill-current" />{etiqueta}</div>
                    <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">{titulo}</h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg">{texto}</p>
                    <Button asChild size="lg" className="mt-7 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      {slide?.tipo === "evento"
                        ? <Link to="/eventos/$eventoId" params={{ eventoId: slide.evento.id }}>Ver evento<ArrowRight /></Link>
                        : slide
                          ? <Link to="/comercio/$comercioId" params={{ comercioId: slide.comercio.id }}>{slide.promo ? "Ver promoción" : "Ver comercio"}<ArrowRight /></Link>
                          : <Link to="/sumate-a-auna">Sumate a Cruzia<ArrowRight /></Link>}
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="bottom-5 left-auto right-16 top-auto z-10 translate-y-0 border-primary-foreground/40 bg-primary/35 text-primary-foreground hover:bg-primary hover:text-primary-foreground" />
        <CarouselNext className="bottom-5 right-5 top-auto z-10 translate-y-0 border-primary-foreground/40 bg-primary/35 text-primary-foreground hover:bg-primary hover:text-primary-foreground" />
      </Carousel>
    </section>
  );
}
