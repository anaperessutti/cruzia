import { Link } from "@tanstack/react-router";
import { MapPin, Search, Store } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePublicDirectory } from "./public-directory-provider";

export function SearchDialog() {
  const { data, setLocalidadIds, setColeccionIds } = usePublicDirectory();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const normalized = term.trim().toLocaleLowerCase("es");
  const results = useMemo(() => {
    if (normalized.length < 2) return [];
    return [
      ...data.comercios.filter((item) => item.nombre.toLocaleLowerCase("es").includes(normalized)).slice(0, 5).map((item) => ({ id: item.id, label: item.nombre, kind: "Comercio", icon: Store, action: () => undefined, to: "/" as const })),
      ...data.colecciones.filter((item) => item.nombre.toLocaleLowerCase("es").includes(normalized)).slice(0, 3).map((item) => ({ id: item.id, label: item.nombre, kind: "Categoría", icon: Search, action: () => setColeccionIds([item.id]), to: "/categorias" as const })),
      ...data.localidades.filter((item) => item.nombre.toLocaleLowerCase("es").includes(normalized)).slice(0, 3).map((item) => ({ id: item.id, label: item.nombre, kind: "Localidad", icon: MapPin, action: () => setLocalidadIds([item.id]), to: "/" as const })),
    ];
  }, [data, normalized, setColeccionIds, setLocalidadIds]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Buscar"><Search /></Button></DialogTrigger>
      <DialogContent className="top-[12%] translate-y-0 border-border/70 sm:max-w-xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">¿Qué estás buscando?</DialogTitle><DialogDescription>Encontrá comercios, categorías o localidades.</DialogDescription></DialogHeader>
        <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input autoFocus value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Probá con cenas y tragos, Mar de Ajó..." className="h-11 pl-10" /></div>
        <div className="max-h-[45vh] space-y-1 overflow-y-auto">
          {normalized.length >= 2 && results.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No encontramos coincidencias.</p> : null}
          {results.map((result) => <Button key={`${result.kind}-${result.id}`} asChild variant="ghost" className="h-auto w-full justify-start px-3 py-3"><Link to={result.to} onClick={() => { result.action(); setOpen(false); setTerm(""); }}><result.icon className="size-5 shrink-0 text-foreground" /><span className="min-w-0 text-left"><span className="block truncate font-semibold">{result.label}</span><span className="block text-xs text-muted-foreground">{result.kind}</span></span></Link></Button>)}
        </div>
      </DialogContent>
    </Dialog>
  );
}