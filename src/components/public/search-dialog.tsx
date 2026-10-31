import { Link, linkOptions } from "@tanstack/react-router";
import { MapPin, Search, Store } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { coincide, normalizar } from "@/lib/busqueda";
import { usePublicDirectory } from "./public-directory-provider";

export function SearchDialog({ className }: { className?: string | undefined }) {
  const { data, setLocalidadIds, setColeccionIds } = usePublicDirectory();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const normalized = normalizar(term);
  const comerciosBuscables = useMemo(() => {
    const rubros = new Map(data.rubros.map((item) => [item.id, item.nombre]));
    const colecciones = new Map(data.colecciones.map((item) => [item.id, item.nombre]));
    const coleccionesPorComercio = new Map<string, string[]>();
    const cuponesPorComercio = new Map<string, string[]>();
    for (const relacion of data.comercioColecciones) {
      const nombres = coleccionesPorComercio.get(relacion.comercio_id) ?? [];
      nombres.push(colecciones.get(relacion.coleccion_id) ?? "");
      coleccionesPorComercio.set(relacion.comercio_id, nombres);
    }
    for (const cupon of data.cupones) {
      const textos = cuponesPorComercio.get(cupon.comercio_id) ?? [];
      textos.push([cupon.titulo, cupon.descripcion, cupon.oferta_corta].filter(Boolean).join(" "));
      cuponesPorComercio.set(cupon.comercio_id, textos);
    }
    return data.comercios.map((item) => {
      const rubro = item.rubro_id ? (rubros.get(item.rubro_id) ?? "") : "";
      const clasificacion = [rubro, ...(coleccionesPorComercio.get(item.id) ?? [])].join(" ");
      const detalle = [item.descripcion, ...(cuponesPorComercio.get(item.id) ?? [])]
        .filter(Boolean)
        .join(" ");
      return { item, rubro, clasificacion, detalle };
    });
  }, [data]);
  /** Cada resultado lleva su propio destino validado por el router (to + params). */
  const results = useMemo(() => {
    if (normalized.length < 2) return [];
    return [
      ...comerciosBuscables
        .map((registro) => ({
          ...registro,
          prioridad: coincide(normalized, registro.item.nombre)
            ? 0
            : coincide(normalized, registro.clasificacion)
              ? 1
              : coincide(
                    normalized,
                    [registro.item.nombre, registro.clasificacion, registro.detalle].join(" "),
                  )
                ? 2
                : 3,
        }))
        .filter((registro) => registro.prioridad < 3)
        .sort((a, b) => a.prioridad - b.prioridad)
        .slice(0, 5)
        .map(({ item, rubro }) => ({
          id: item.id,
          label: item.nombre,
          kind: "Comercio",
          subtitle: rubro || "Comercio",
          icon: Store,
          action: () => undefined,
          link: linkOptions({ to: "/comercio/$comercioId", params: { comercioId: item.id } }),
        })),
      ...data.colecciones
        .filter((item) => normalizar(item.nombre).includes(normalized))
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          label: item.nombre,
          kind: "Categoría",
          subtitle: "Categoría",
          icon: Search,
          action: () => setColeccionIds([item.id]),
          link: linkOptions({ to: "/categorias" }),
        })),
      ...data.localidades
        .filter((item) => normalizar(item.nombre).includes(normalized))
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          label: item.nombre,
          kind: "Localidad",
          subtitle: "Localidad",
          icon: MapPin,
          action: () => setLocalidadIds([item.id]),
          link: linkOptions({ to: "/" }),
        })),
    ];
  }, [data, comerciosBuscables, normalized, setColeccionIds, setLocalidadIds]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Buscar" className={className}>
          <Search />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-[12%] translate-y-0 border-border/70 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">¿Qué estás buscando?</DialogTitle>
          <DialogDescription>Encontrá comercios, categorías o localidades.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Probá con cenas y tragos, Mar de Ajó..."
            className="h-11 pl-10"
          />
        </div>
        <div className="max-h-[45vh] space-y-1 overflow-y-auto">
          {normalized.length >= 2 && results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No encontramos coincidencias.
            </p>
          ) : null}
          {results.map((result) => (
            <Button
              key={`${result.kind}-${result.id}`}
              asChild
              variant="ghost"
              className="h-auto w-full justify-start px-3 py-3"
            >
              <Link
                {...result.link}
                onClick={() => {
                  result.action();
                  setOpen(false);
                  setTerm("");
                }}
              >
                <result.icon className="size-5 shrink-0 text-foreground" />
                <span className="min-w-0 text-left">
                  <span className="block truncate font-semibold">{result.label}</span>
                  <span className="block text-xs text-muted-foreground">{result.subtitle}</span>
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
