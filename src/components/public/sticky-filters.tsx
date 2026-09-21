import { ChevronDown, Crosshair, MapPin, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { usePublicDirectory } from "./public-directory-provider";

export function StickyFilters() {
  const { data, filters, geoStatus, detectedLocalidadId, detectLocation, setLocalidadIds, setColeccionIds, setSoloCupon } = usePublicDirectory();
  const localityLabel = filters.localidadIds.length === 0 ? "Toda La Costa" : filters.localidadIds.length === 1 ? data.localidades.find((item) => item.id === filters.localidadIds[0])?.nombre ?? "1 localidad" : `${filters.localidadIds.length} localidades`;
  const coleccionLabel = filters.coleccionIds.length === 0
    ? "Todas las categorías"
    : filters.coleccionIds.length === 1
      ? data.colecciones.find((item) => item.id === filters.coleccionIds[0])?.nombre ?? "1 categoría"
      : `${filters.coleccionIds.length} categorías`;
  const detectedName = data.localidades.find((item) => item.id === detectedLocalidadId)?.nombre;
  const geoMessage =
    geoStatus === "solicitando" ? "Buscando tu ubicación…"
      : geoStatus === "detectada" && detectedName ? `Estás cerca de ${detectedName}`
      : geoStatus === "denegada" ? "Ubicación desactivada: mostramos toda La Costa"
      : geoStatus === "no-disponible" ? "No pudimos detectar tu ubicación"
      : null;

  return (
    <div className="sticky top-16 z-30 border-y border-border/70 bg-background/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" className="h-10 shrink-0 justify-between gap-3"><MapPin className="text-secondary" /><span>{localityLabel}</span><ChevronDown className="text-muted-foreground" /></Button></PopoverTrigger>
          <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] p-2">
            <div className="flex items-center justify-between px-2 py-2"><p className="font-display font-semibold">Localidades</p>{filters.localidadIds.length > 0 ? <Button variant="ghost" size="sm" onClick={() => setLocalidadIds([])}>Ver todas</Button> : null}</div>
            <Button variant="ghost" size="sm" className="mb-1 w-full justify-start gap-2" onClick={detectLocation} disabled={geoStatus === "solicitando"}>
              <Crosshair className="text-secondary" />{geoStatus === "solicitando" ? "Buscando tu ubicación…" : "Usar mi ubicación"}
            </Button>
            {geoMessage && geoStatus !== "solicitando" ? <p className="px-3 pb-2 text-xs text-muted-foreground">{geoMessage}</p> : null}
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {data.localidades.map((item) => {
                const checked = filters.localidadIds.includes(item.id);
               return <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"><Checkbox checked={checked} onCheckedChange={() => setLocalidadIds(checked ? filters.localidadIds.filter((id) => id !== item.id) : [...filters.localidadIds, item.id])} /><span className="min-w-0 flex-1 truncate" title={item.nombre}>{item.nombre}</span>{item.id === detectedLocalidadId ? <span className="shrink-0 text-xs text-muted-foreground">cerca tuyo</span> : null}</label>;
              })}
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" className="h-10 shrink-0 justify-between gap-3"><Tag className="text-secondary" /><span>{coleccionLabel}</span><ChevronDown className="text-muted-foreground" /></Button></PopoverTrigger>
          <PopoverContent align="start" className="max-h-80 w-[min(22rem,calc(100vw-2rem))] overflow-y-auto p-2">
            <div className="flex items-center justify-between px-2 py-2"><p className="font-display font-semibold">Categorías</p>{filters.coleccionIds.length > 0 ? <Button variant="ghost" size="sm" onClick={() => setColeccionIds([])}>Ver todas</Button> : null}</div>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {data.colecciones.map((item) => {
                const checked = filters.coleccionIds.includes(item.id);
                return <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"><Checkbox checked={checked} onCheckedChange={() => setColeccionIds(checked ? filters.coleccionIds.filter((id) => id !== item.id) : [...filters.coleccionIds, item.id])} /><span className="min-w-0 flex-1 whitespace-normal">{item.nombre}</span></label>;
              })}
            </div>
          </PopoverContent>
        </Popover>
        <label className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold"><Switch checked={filters.soloCupon} onCheckedChange={setSoloCupon} /><span>⭐ Solo con Cupón</span></label>
      </div>
    </div>
  );
}
