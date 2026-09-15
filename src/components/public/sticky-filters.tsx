import { Check, ChevronDown, MapPin, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { usePublicDirectory } from "./public-directory-provider";

export function StickyFilters() {
  const { data, filters, setLocalidadIds, setRubroId, setSoloCupon } = usePublicDirectory();
  const localityLabel = filters.localidadIds.length === 0 ? "Toda La Costa" : filters.localidadIds.length === 1 ? data.localidades.find((item) => item.id === filters.localidadIds[0])?.nombre ?? "1 localidad" : `${filters.localidadIds.length} localidades`;
  const rubroLabel = data.rubros.find((item) => item.id === filters.rubroId)?.nombre ?? "Todos los rubros";

  return (
    <div className="sticky top-16 z-30 border-y border-border/70 bg-background/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" className="h-10 shrink-0 justify-between gap-3"><MapPin className="text-secondary" /><span>{localityLabel}</span><ChevronDown className="text-muted-foreground" /></Button></PopoverTrigger>
          <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] p-2">
            <div className="flex items-center justify-between px-2 py-2"><p className="font-display font-semibold">Localidades</p>{filters.localidadIds.length > 0 ? <Button variant="ghost" size="sm" onClick={() => setLocalidadIds([])}>Ver todas</Button> : null}</div>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {data.localidades.map((item) => {
                const checked = filters.localidadIds.includes(item.id);
                return <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"><Checkbox checked={checked} onCheckedChange={() => setLocalidadIds(checked ? filters.localidadIds.filter((id) => id !== item.id) : [...filters.localidadIds, item.id])} /><span>{item.nombre}</span></label>;
              })}
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" className="h-10 shrink-0 justify-between gap-3"><Tag className="text-secondary" /><span>{rubroLabel}</span><ChevronDown className="text-muted-foreground" /></Button></PopoverTrigger>
          <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] p-2">
            <Button variant="ghost" className="w-full justify-between" onClick={() => setRubroId("")}>Todos los rubros{!filters.rubroId ? <Check /> : null}</Button>
            {data.rubros.map((item) => <Button key={item.id} variant="ghost" className="h-auto w-full justify-between whitespace-normal py-2.5 text-left" onClick={() => setRubroId(item.id)}>{item.nombre}{filters.rubroId === item.id ? <Check /> : null}</Button>)}
          </PopoverContent>
        </Popover>
        <label className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold"><Switch checked={filters.soloCupon} onCheckedChange={setSoloCupon} /><span>⭐ Solo con Cupón</span></label>
      </div>
    </div>
  );
}