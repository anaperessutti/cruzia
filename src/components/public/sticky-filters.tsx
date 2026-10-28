import { ChevronDown, Crosshair, MapPin, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { usePublicDirectory } from "./public-directory-provider";

export function StickyFilters() {
  const { data, filters, geoStatus, detectedLocalidadId, detectLocation, setLocalidadIds, setColeccionIds, setSoloCupon } = usePublicDirectory();
  const localityLabel = filters.localidadIds.length === 0 ? "Toda La Costa" : filters.localidadIds.length === 1 ? data.localidades.find((item) => item.id === filters.localidadIds[0])?.nombre ?? "1 localidad" : `${data.localidades.find((item) => item.id === filters.localidadIds[0])?.nombre ?? "Localidades"} +${filters.localidadIds.length - 1}`;
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
    <div className="min-w-0 text-foreground">
      <div className="glass flex items-center gap-0 overflow-x-auto rounded-full p-0.5 sm:gap-0.5 sm:p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Popover>
          <PopoverTrigger asChild><Button variant="ghost" aria-label={localityLabel} className="h-9 shrink-0 gap-1 rounded-full px-1 font-normal hover:bg-card/60 sm:gap-1.5 sm:px-3"><MapPin className="size-4" /><span className="hidden max-w-[9rem] truncate md:inline">{localityLabel}</span><ChevronDown className="hidden text-muted-foreground sm:block" /></Button></PopoverTrigger>
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
          <PopoverTrigger asChild><Button variant="ghost" aria-label={coleccionLabel} className="h-9 shrink-0 gap-1 rounded-full px-1 font-normal hover:bg-card/60 sm:gap-1.5 sm:px-3"><Tag className="size-4" /><span className="hidden max-w-[9rem] truncate md:inline">{coleccionLabel}</span><ChevronDown className="hidden text-muted-foreground sm:block" /></Button></PopoverTrigger>
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
        <label className="flex h-9 shrink-0 cursor-pointer items-center gap-0.5 rounded-full px-0.5 text-sm sm:gap-2 sm:px-2"><Switch checked={filters.soloCupon} onCheckedChange={setSoloCupon} className="data-[state=checked]:bg-[#DF3B25]" aria-label="Solo cupones" /><span className="hidden text-[12px] font-medium text-[#1F1E1E] min-[390px]:inline">Solo cupón</span></label>
      </div>
    </div>
  );
}
