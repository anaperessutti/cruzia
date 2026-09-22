import { useMemo } from "react";

import { distanciaAComercio, estaCerca } from "@/lib/geo";
import { CarruselSeccion } from "./carrusel-seccion";
import { CommerceCard } from "./commerce-card";
import { EventoCard } from "./evento-card";
import { usePublicDirectory, type TarjetaGrilla } from "./public-directory-provider";

function vigente(fechaInicio: string, fechaFin: string) {
  const hoy = new Date().toISOString().slice(0, 10);
  return fechaInicio <= hoy && fechaFin >= hoy;
}

export function HomeCarousels() {
  const { data, filters, isLoading, userCoords, coleccionesDeCupon, coleccionesDeEvento } = usePublicDirectory();
  const planById = useMemo(() => new Map(data.planes.map((plan) => [plan.id, plan])), [data.planes]);
  const comercioById = useMemo(() => new Map(data.comercios.map((comercio) => [comercio.id, comercio])), [data.comercios]);
  const localidadById = useMemo(() => new Map(data.localidades.map((item) => [item.id, item])), [data.localidades]);
  const cuponesActivos = useMemo(
    () => data.cupones.filter((cupon) => cupon.activo && vigente(cupon.vigencia_inicio, cupon.vigencia_fin)),
    [data.cupones],
  );

  const localidadesQuery = filters.localidadIds.length > 0
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

  const renderTarjeta = (tarjeta: TarjetaGrilla) =>
    tarjeta.tipo === "evento" ? (
      <EventoCard key={tarjeta.key} evento={tarjeta.evento} localidad={localidadById.get(tarjeta.evento.localidad_id ?? "")} />
    ) : (
      <CommerceCard
        key={tarjeta.key}
        comercio={tarjeta.comercio}
        cupon={tarjeta.cupon}
        plan={planById.get(tarjeta.comercio.plan_id)}
        localidad={localidadById.get(tarjeta.comercio.localidad_id ?? "")}
      />
    );
  const imagenesDe = (tarjetas: TarjetaGrilla[]) =>
    tarjetas.map((tarjeta) =>
      tarjeta.tipo === "evento"
        ? tarjeta.evento.imagen_url
        : tarjeta.cupon?.flyer_url ?? tarjeta.comercio.galeria[0] ?? null,
    );
  /** Coordenadas usadas para el orden por cercanía de cada tarjeta. */
  const puntoDe = (tarjeta: TarjetaGrilla) =>
    tarjeta.tipo === "evento" ? { lat: tarjeta.evento.lat, lng: tarjeta.evento.lng } : tarjeta.comercio;

  const filas = data.colecciones.map((coleccion) => {
    const comercioIds = new Set(
      data.comercioColecciones
        .filter((relacion) => relacion.coleccion_id === coleccion.id)
        .map((relacion) => relacion.comercio_id),
    );
    const tarjetas: TarjetaGrilla[] = [];
    for (const comercio of data.comercios) {
      if (!comercio.activo) continue;
      const promociones = cuponesActivos.filter(
        (cupon) => cupon.comercio_id === comercio.id && coleccionesDeCupon(cupon).includes(coleccion.id),
      );
      if (promociones.length > 0) {
        promociones.forEach((cupon) => tarjetas.push({ tipo: "comercio", key: cupon.id, comercio, cupon }));
      } else if (comercioIds.has(comercio.id)) {
        tarjetas.push({ tipo: "comercio", key: comercio.id, comercio, cupon: null });
      }
    }
    for (const evento of data.eventos) {
      if (coleccionesDeEvento(evento.id).includes(coleccion.id)) {
        tarjetas.push({ tipo: "evento", key: `evento-${evento.id}`, evento });
      }
    }
    // Primero lo que está dentro del radio de cercanía; después el resto, para no vaciar la fila.
    const ordenadas = tarjetas.slice().sort((a, b) => {
      const cercaA = estaCerca(userCoords, puntoDe(a)) ? 0 : 1;
      const cercaB = estaCerca(userCoords, puntoDe(b)) ? 0 : 1;
      if (cercaA !== cercaB) return cercaA - cercaB;
      const da = distanciaAComercio(userCoords, puntoDe(a));
      const db = distanciaAComercio(userCoords, puntoDe(b));
      if (da !== null && db !== null) return da - db;
      return 0;
    });
    return { coleccion, tarjetas: ordenadas };
  }).filter(({ tarjetas }) => tarjetas.length > 0);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="h-72 animate-pulse rounded-md bg-muted" /></div>;
  }

  return (
    <div className="space-y-12 py-10 sm:space-y-16 sm:py-14">
      {favoritos.length > 0 ? (
        <CarruselSeccion
          titulo="Favoritos de la Costa"
          destinoUrl={`/cupones?soloCupon=true&favoritos=true${localidadesQuery}`}
          tarjetas={favoritos.map(renderTarjeta)}
          imagenes={imagenesDe(favoritos)}
        />
      ) : null}
      {filas.map(({ coleccion, tarjetas }) => (
        <CarruselSeccion
          key={coleccion.id}
          titulo={coleccion.nombre}
          destinoUrl={`/categorias?coleccion=${encodeURIComponent(coleccion.id)}${localidadesQuery}`}
          tarjetas={tarjetas.map(renderTarjeta)}
          imagenes={imagenesDe(tarjetas)}
        />
      ))}
    </div>
  );
}
