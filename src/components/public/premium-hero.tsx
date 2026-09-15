import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";

import heroImage from "@/assets/ola-costa-hero.jpg";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { usePublicDirectory } from "./public-directory-provider";

export function PremiumHero() {
  const { data } = usePublicDirectory();
  const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
  const premium = data.comercios.filter((item) => planById.get(item.plan_id)?.aparece_en_hero_banner).sort((a, b) => (planById.get(a.plan_id)?.prioridad_orden ?? 99) - (planById.get(b.plan_id)?.prioridad_orden ?? 99));
  const slides = premium.length > 0 ? premium : [null];

  return (
    <section aria-label="Destacados de OLA!" className="bg-primary">
      <Carousel opts={{ loop: slides.length > 1 }} className="mx-auto max-w-[1600px]">
        <CarouselContent className="ml-0">
          {slides.map((item, index) => <CarouselItem key={item?.id ?? `brand-${index}`} className="relative h-[68vh] min-h-[430px] max-h-[680px] pl-0"><img src={item?.galeria[0] ?? heroImage} alt={item ? `${item.nombre}, comercio destacado` : "Playa del Partido de la Costa"} width={1600} height={900} className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-hero-overlay" /><div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8"><div className="max-w-2xl text-primary-foreground"><div className="mb-4 inline-flex items-center gap-2 border-l-2 border-accent pl-3 text-xs font-bold uppercase"><Star className="size-4 fill-current" />{item ? "Elegido Premium" : "Viví La Costa"}</div><h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">{item?.nombre ?? "Beneficios que te llevan más lejos."}</h1><p className="mt-4 max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg">{item?.descripcion ?? "Descubrí comercios, experiencias y cupones en cada rincón del Partido de la Costa."}</p><Button asChild size="lg" className="mt-7 bg-secondary text-secondary-foreground hover:bg-secondary/90"><Link to={item ? "/cupones" : "/subite-a-la-ola"}>{item ? "Ver beneficios" : "Subite a la Ola"}<ArrowRight /></Link></Button></div></div></CarouselItem>)}
          <CarouselItem className="relative h-[68vh] min-h-[430px] max-h-[680px] bg-secondary pl-0"><div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="text-xs font-bold uppercase text-secondary-foreground/70">Comercios de La Costa</p><h2 className="mt-4 font-display text-5xl font-extrabold leading-none text-secondary-foreground sm:text-7xl">Tu negocio también puede ser parte.</h2><Button asChild size="lg" className="mt-8"><Link to="/subite-a-la-ola">Subite a la Ola <ArrowRight /></Link></Button></div></div></CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="bottom-5 left-auto right-16 top-auto z-10 translate-y-0 border-primary-foreground/40 bg-primary/35 text-primary-foreground hover:bg-primary hover:text-primary-foreground" />
        <CarouselNext className="bottom-5 right-5 top-auto z-10 translate-y-0 border-primary-foreground/40 bg-primary/35 text-primary-foreground hover:bg-primary hover:text-primary-foreground" />
      </Carousel>
    </section>
  );
}