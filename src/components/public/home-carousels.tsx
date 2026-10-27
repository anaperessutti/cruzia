import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { getClimaCosta } from "@/lib/clima.functions";
import { distanciaAComercio, estaCerca } from "@/lib/geo";
import { minutosArgentina, ordenarColecciones } from "@/lib/orden-colecciones";
import { CarruselSeccion } from "./carrusel-seccion";
import { CommerceCard, nivelDeTarjeta } from "./commerce-card";
import { EventoCard } from "./evento-card";
import { usePublicDirectory, type TarjetaGrilla } from "./public-directory-provider";

function vigente(fechaInicio: string, fechaFin: string) {
  const hoy = new Date().toISOString().slice(0, 10);
  return fechaInicio <= hoy && fechaFin >= hoy;
}

export function HomeCarousels() {
  const { data, filters, isLoading, userCoords, coleccionesDeCupon, coleccionesDeEvento } =
    usePublicDirectory();
  // Clima leído en el servidor (cacheado 20 min) para decidir el orden de las filas.
  const pedirClima = useServerFn(getClimaCosta);
  const climaQuery = useQuery({
    queryKey: ["clima-costa"],
    queryFn: () => pedirClima(),
    staleTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const malClima = climaQuery.data?.malClima ?? false;
  // Se fija una sola vez por carga del Home: no cambia mientras se navega.
  const minutosDelDia = useMemo(() => minutosArgentina(), []);
  const planById = useMemo(
    () => new Map(data.planes.map((plan) => [plan.id, plan])),
    [data.planes],
  );
  const comercioById = useMemo(
    () => new Map(data.comercios.map((comercio) => [comercio.id, comercio])),
    [data.comercios],
  );
  const rubroById = useMemo(
    () => new Map(data.rubros.map((item) => [item.id, item])),
    [data.rubros],
  );
  const localidadById = useMemo(
    () => new Map(data.localidades.map((item) => [item.id, item])),
    [data.localidades],
  );
  const cuponesActivos = useMemo(
    () =>
      data.cupones.filter(
        (cupon) => cupon.activo && vigente(cupon.vigencia_inicio, cupon.vigencia_fin),
      ),
    [data.cupones],
  );

  const localidadesQuery =
    filters.localidadIds.length > 0
      ? `&localidades=${encodeURIComponent(filters.localidadIds.join(","))}`
      : "";
  const favoritos: TarjetaGrilla[] = [
    ...cuponesActivos.flatMap<TarjetaGrilla>((cupon) => {
      const comercio = comercioById.get(cupon.comercio_id);
      const plan = comercio ? planById.get(comercio.plan_id) : undefined;
      return comercio?.activo && cupon.es_favorita_home && (plan?.tiene_modulo_promocion ?? false)
        ? [{ tipo: "comercio", key: cupon.id, comercio, cupon }]
        : [];
    }),
    ...data.eventos
      .filter((evento) => evento.es_favorita_home)
      .map<TarjetaGrilla>((evento) => ({ tipo: "evento", key: `evento-${evento.id}`, evento })),
  ];

  const renderTarjeta = (tarjeta: TarjetaGrilla, compacta = false) =>
    tarjeta.tipo === "evento" ? (
      <EventoCard
        key={tarjeta.key}
        evento={tarjeta.evento}
        localidad={localidadById.get(tarjeta.evento.localidad_id ?? "")}
        compacta={compacta}
      />
    ) : (
      <CommerceCard
        key={tarjeta.key}
        comercio={tarjeta.comercio}
        cupon={tarjeta.cupon}
        plan={planById.get(tarjeta.comercio.plan_id)}
        localidad={localidadById.get(tarjeta.comercio.localidad_id ?? "")}
        rubro={rubroById.get(tarjeta.comercio.rubro_id ?? "")}
        compacta={compacta}
      />
    );
  /** Premium con cupón activo: va ~6% más ancha. */
  const anchasDe = (tarjetas: TarjetaGrilla[]) =>
    tarjetas
      .slice(0, 6)
      .map(
        (t) =>
          t.tipo === "comercio" &&
          nivelDeTarjeta(planById.get(t.comercio.plan_id), t.cupon) === "premium",
      );
  /** Coordenadas usadas para el orden por cercanía de cada tarjeta. */
  const puntoDe = (tarjeta: TarjetaGrilla) =>
    tarjeta.tipo === "evento"
      ? { lat: tarjeta.evento.lat, lng: tarjeta.evento.lng }
      : tarjeta.comercio;

  const filas = data.colecciones
    .map((coleccion) => {
      const comercioIds = new Set(
        data.comercioColecciones
          .filter((relacion) => relacion.coleccion_id === coleccion.id)
          .map((relacion) => relacion.comercio_id),
      );
      const tarjetas: TarjetaGrilla[] = [];
      for (const comercio of data.comercios) {
        if (!comercio.activo) continue;
        const promociones = cuponesActivos.filter(
          (cupon) =>
            cupon.comercio_id === comercio.id && coleccionesDeCupon(cupon).includes(coleccion.id),
        );
        if (promociones.length > 0) {
          promociones.forEach((cupon) =>
            tarjetas.push({ tipo: "comercio", key: cupon.id, comercio, cupon }),
          );
        } else if (comercioIds.has(comercio.id)) {
          tarjetas.push({ tipo: "comercio", key: comercio.id, comercio, cupon: null });
        }
      }
      for (const evento of data.eventos) {
        if (coleccionesDeEvento(evento.id).includes(coleccion.id)) {
          tarjetas.push({ tipo: "evento", key: `evento-${evento.id}`, evento });
        }
      }
      // Con mal clima, dentro de "Juegos y Entretenimiento" van primero los lugares bajo techo.
      const prioridadIndoor = malClima && coleccion.nombre === "Juegos y Entretenimiento";
      const indoor = (tarjeta: TarjetaGrilla) =>
        prioridadIndoor && tarjeta.tipo === "comercio" && tarjeta.comercio.es_indoor ? 0 : 1;
      // Primero lo que está dentro del radio de cercanía; después el resto, para no vaciar la fila.
      const ordenadas = tarjetas.slice().sort((a, b) => {
        const dif = indoor(a) - indoor(b);
        if (dif !== 0) return dif;
        const cercaA = estaCerca(userCoords, puntoDe(a)) ? 0 : 1;
        const cercaB = estaCerca(userCoords, puntoDe(b)) ? 0 : 1;
        if (cercaA !== cercaB) return cercaA - cercaB;
        const da = distanciaAComercio(userCoords, puntoDe(a));
        const db = distanciaAComercio(userCoords, puntoDe(b));
        if (da !== null && db !== null) return da - db;
        return 0;
      });
      return { coleccion, tarjetas: ordenadas };
    })
    .filter(({ tarjetas }) => tarjetas.length > 0);

  // Orden dinámico de las filas temáticas: manda el clima; si está bueno, la franja horaria.
  const filasOrdenadas = ordenarColecciones(
    filas.map((fila) => ({ ...fila, id: fila.coleccion.id, nombre: fila.coleccion.nombre })),
    { malClima, minutosDelDia },
  );

  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className="invisible mx-auto max-w-7xl space-y-4 px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="h-8 w-56" />
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] w-[72%] shrink-0 sm:w-[44%] lg:w-[23%]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-10 sm:space-y-14 sm:py-14">
      {favoritos.length > 0 ? (
        <CarruselSeccion
          titulo="Favoritos de la Costa"
          rotulo="Elegidos para vos"
          destacada
          primera
          anchas={anchasDe(favoritos)}
          destinoUrl={`/cupones?soloCupon=true&favoritos=true${localidadesQuery}`}
          tarjetas={favoritos.map((tarjeta) => renderTarjeta(tarjeta))}
        />
      ) : null}
      {filasOrdenadas.map(({ coleccion, tarjetas }, index) => (
        <CarruselSeccion
          key={coleccion.id}
          titulo={coleccion.nombre}
          rotulo="Colección"
          primera={favoritos.length === 0 && index === 0}
          compacta
          destinoUrl={`/categorias?coleccion=${encodeURIComponent(coleccion.id)}${localidadesQuery}`}
          tarjetas={tarjetas.map((tarjeta) => renderTarjeta(tarjeta, true))}
        />
      ))}
    </div>
  );
}
