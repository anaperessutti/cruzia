import { useMemo } from "react";

import { distanciaAComercio, estaCerca } from "@/lib/geo";
import { CarruselSeccion } from "./carrusel-seccion";
import { CommerceCard } from "./commerce-card";
import { usePublicDirectory, type TarjetaGrilla } from "./public-directory-provider";

function vigente(fechaInicio: string, fechaFin: string) {
  const hoy = new Date().toISOString().slice(0, 10);
  return fechaInicio <= hoy && fechaFin >= hoy;
}

export function HomeCarousels() {
  const { data, filters, isLoading, userCoords } = usePublicDirectory();
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
  const favoritos = cuponesActivos.flatMap<TarjetaGrilla>((cupon) => {
    const comercio = comercioById.get(cupon.comercio_id);
    const plan = comercio ? planById.get(comercio.plan_id) : undefined;
    return comercio?.activo && cupon.es_favorita_home && (plan?.tiene_modulo_promocion ?? false)
      ? [{ key: cupon.id, comercio, cupon }]
      : [];
  });

  const renderTarjeta = ({ key, comercio, cupon }: TarjetaGrilla) => (
    <CommerceCard
      key={key}
      comercio={comercio}
      cupon={cupon}
      plan={planById.get(comercio.plan_id)}
      localidad={localidadById.get(comercio.localidad_id ?? "")}
    />
  );
  const imagenesDe = (tarjetas: TarjetaGrilla[]) => tarjetas.map(({ comercio, cupon }) => cupon?.flyer_url ?? comercio.galeria[0] ?? null);

  const filas = data.colecciones.map((coleccion) => {
    const comercioIds = new Set(
      data.comercioColecciones
        .filter((relacion) => relacion.coleccion_id === coleccion.id)
        .map((relacion) => relacion.comercio_id),
    );
    const tarjetas: TarjetaGrilla[] = [];
    for (const comercio of data.comercios) {
      if (!comercio.activo || !comercioIds.has(comercio.id)) continue;
      const promociones = cuponesActivos.filter((cupon) => cupon.comercio_id === comercio.id);
      if (promociones.length === 0) tarjetas.push({ key: comercio.id, comercio, cupon: null });
      else promociones.forEach((cupon) => tarjetas.push({ key: cupon.id, comercio, cupon }));
    }
    // Primero lo que está dentro del radio de cercanía; después el resto, para no vaciar la fila.
    const ordenadas = tarjetas.slice().sort((a, b) => {
      const cercaA = estaCerca(userCoords, a.comercio) ? 0 : 1;
      const cercaB = estaCerca(userCoords, b.comercio) ? 0 : 1;
      if (cercaA !== cercaB) return cercaA - cercaB;
      const da = distanciaAComercio(userCoords, a.comercio);
      const db = distanciaAComercio(userCoords, b.comercio);
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