import { FadeOrganic } from "@/components/public/fade-organic";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import heroImage from "@/assets/auna-costa-hero.webp";
import { Logo } from "@/components/brand/logo";
import { estaCerca } from "@/lib/geo";
import type { Comercio, Cupon, Evento } from "@/lib/public-data";
import { cn } from "@/lib/utils";
import { usePublicDirectory } from "./public-directory-provider";
import { Secuencia, SplitWords } from "./motion";

function vigente(inicio: string, fin: string) {
  const hoy = new Date().toISOString().slice(0, 10);
  return inicio <= hoy && fin >= hoy;
}

type Slide =
  | { tipo: "comercio"; id: string; comercio: Comercio; promo: Cupon | null }
  | { tipo: "evento"; id: string; evento: Evento };

function BotonFlecha({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 rounded-full bg-card py-1.5 pl-5 pr-1.5 text-sm font-medium text-foreground shadow-warm transition-transform group-hover:-translate-y-0.5">
      {children}
      <span className="grid size-9 place-items-center rounded-full bg-foreground text-background"><ArrowRight className="size-4" /></span>
    </span>
  );
}

const AUTOPLAY_MS = 6000;

export function PremiumHero() {
  const { data, userCoords, isLoading } = usePublicDirectory();
  const planById = new Map(data.planes.map((plan) => [plan.id, plan]));
  const localidadById = new Map(data.localidades.map((l) => [l.id, l.nombre]));
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
  // Mientras cargan los datos no hay slide institucional oscuro: se muestra el fondo claro del sitio.
  const slides: (Slide | null)[] = seleccion.length > 0 ? seleccion : isLoading ? [] : [null];

  // Fundido cruzado con autoplay, pausa al tocar y swipe.
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const toqueX = useRef<number | null>(null);
  const total = slides.length;
  useEffect(() => { if (activo >= total) setActivo(0); }, [activo, total]);
  useEffect(() => {
    if (pausado || total < 2) return;
    const id = window.setTimeout(() => setActivo((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [activo, pausado, total]);
  // Solo se cargan la imagen actual, la siguiente y las ya vistas.
  const [cargadas, setCargadas] = useState<Set<number>>(() => new Set([0, 1]));
  useEffect(() => { setCargadas((prev) => (prev.has(activo) && prev.has((activo + 1) % Math.max(total, 1)) ? prev : new Set([...prev, activo, (activo + 1) % Math.max(total, 1)]))); }, [activo, total]);
  const ir = (paso: number) => setActivo((i) => (i + paso + total) % total);

  // Mientras cargan los datos la sección queda vacía; la Secuencia se monta recién cuando
  // hay slides, así la entrada (sobretítulo → título → descripción → botón) se ve completa.
  if (slides.length === 0) {
    return <section aria-label="Destacados de Cruzia" className="relative h-[86svh] min-h-[540px] max-h-[800px] w-full overflow-clip" />;
  }
  return (
    <Secuencia
      as="section"
      hero
      aria-label="Destacados de Cruzia"
      aria-roledescription="carrusel"
      className="relative h-[86svh] min-h-[540px] max-h-[800px] w-full overflow-clip"
      onTouchStart={(e: React.TouchEvent) => { toqueX.current = e.touches[0]?.clientX ?? null; setPausado(true); }}
      onTouchEnd={(e: React.TouchEvent) => {
        const inicio = toqueX.current;
        const fin = e.changedTouches[0]?.clientX;
        if (inicio !== null && fin !== undefined && Math.abs(fin - inicio) > 40) ir(fin < inicio ? 1 : -1);
        toqueX.current = null;
        setPausado(false);
      }}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {slides.map((slide, index) => {
        const visible = index === activo;
        if (!slide) return <SlideInstitucional key="brand" visible={visible} />;
        const esEvento = slide.tipo === "evento";
        const imagen = (esEvento ? slide.evento.imagen_url : slide.promo?.flyer_url ?? slide.comercio.galeria[0]) ?? heroImage;
        const titulo = (esEvento ? slide.evento.titulo : slide.promo?.titulo ?? slide.comercio.nombre) ?? "";
        const texto = esEvento ? slide.evento.descripcion : slide.promo?.descripcion ?? slide.comercio.descripcion;
        const localidad = localidadById.get((esEvento ? slide.evento.localidad_id : slide.comercio.localidad_id) ?? "");
        const etiqueta = esEvento ? "Evento destacado" : slide.promo ? slide.comercio.nombre : "Elegido Premium";
        return (
          <div key={slide.id} aria-hidden={!visible} className={cn("absolute inset-0 transition-opacity duration-1000 ease-out", visible ? "z-10 opacity-100" : "z-0 opacity-0")}>
            <div className="absolute inset-0"><div data-m-seq="media" className="absolute inset-0">
            {cargadas.has(index) ? <FadeOrganic src={imagen} alt={titulo} prioridad={index === 0} imgClassName={cn("transition-transform duration-[6500ms] ease-out", visible ? "scale-100" : "scale-105")} /> : null}
            </div>
            <div aria-hidden="true" className="veil-radial absolute inset-0" /></div>
            <div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-[52%] sm:px-8 sm:pb-[24%]">
              <div className="max-w-2xl text-primary-foreground">
                <div data-m-seq="eyebrow" className="glass-dark mb-5 inline-flex rounded-full px-3.5 py-1.5 text-slider-eyebrow">{localidad ? `${localidad} · ${etiqueta}` : etiqueta}</div>
                <SplitWords as="h1" enSecuencia className="text-titulo" text={titulo} />
                {texto ? <p data-m-seq="desc" className="mt-4 line-clamp-2 max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg">{texto}</p> : null}
                <Link
                  tabIndex={visible ? 0 : -1}
                  data-m-seq="cta"
                  className="group mt-7 inline-block"
                  {...(esEvento
                    ? { to: "/eventos/$eventoId" as const, params: { eventoId: slide.evento.id } }
                    : { to: "/comercio/$comercioId" as const, params: { comercioId: slide.comercio.id } })}
                >
                  <BotonFlecha>{esEvento ? "Ver evento" : slide.promo ? "Ver promoción" : "Ver comercio"}</BotonFlecha>
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {total > 1 ? (
        <div className="glass-dark absolute top-20 right-5 z-20 sm:top-auto flex items-center gap-1.5 rounded-full px-3 py-2 sm:right-8 sm:bottom-[20%] sm:top-auto">
          {slides.map((slide, index) => (
            <button
              key={slide?.id ?? `brand-${index}`}
              type="button"
              aria-label={`Ir al destacado ${index + 1}`}
              aria-current={index === activo}
              onClick={() => setActivo(index)}
              className={cn("h-1.5 rounded-full transition-all duration-500", index === activo ? "w-6 bg-primary" : "w-1.5 bg-primary-foreground/50")}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/** Slide institucional: isotipo como marca de agua. */
function SlideInstitucional({ visible }: { visible: boolean }) {
  return (
    <div aria-hidden={!visible} className={cn("mask-hero absolute inset-0 overflow-clip bg-ink transition-opacity duration-1000", visible ? "z-10 opacity-100" : "z-0 opacity-0")}>
      <Logo variant="isotype" tone="dark" height={260} decorative className="absolute -left-10 top-24 opacity-[0.06]" />
      <div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-[34%] sm:px-8 sm:pb-[18%]">
        <div className="max-w-2xl text-primary-foreground">
          <div data-m-seq="eyebrow" className="glass-dark mb-5 inline-flex rounded-full px-3.5 py-1.5 text-slider-eyebrow">Viví La Costa</div>
          <SplitWords as="h1" enSecuencia className="text-titulo" text="Beneficios que te llevan más lejos." />
          <p data-m-seq="desc" className="mt-4 max-w-xl text-base leading-7 text-primary-foreground/75 sm:text-lg">Descubrí comercios, experiencias y cupones en cada rincón del Partido de la Costa.</p>
          <Link to="/sumate-a-cruzia" tabIndex={visible ? 0 : -1} data-m-seq="cta" className="group mt-7 inline-block"><BotonFlecha>Sumate a Cruzia</BotonFlecha></Link>
        </div>
      </div>
    </div>
  );
}
