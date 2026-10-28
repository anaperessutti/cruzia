import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { subirImagen } from "@/lib/admin-cms";
import { optimizarImagen } from "@/lib/imagen";
import type { FaseForm } from "@/lib/huella-admin";

export function HuellaFormulario({
  inicial,
  ocupado,
  onGuardar,
}: {
  inicial: FaseForm;
  ocupado: boolean;
  onGuardar: (form: FaseForm) => Promise<void>;
}) {
  const [form, setForm] = useState<FaseForm>(() => ({ ...inicial, fotos: [...inicial.fotos] }));
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function set<K extends keyof FaseForm>(campo: K, valor: FaseForm[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }
  async function subir(files: File[]) {
    if (!files.length) return;
    setSubiendo(true);
    setError(null);
    try {
      // Upload sequentially so completed photos are preserved if a later upload fails.
      for (const file of files) {
        const url = await subirImagen(file, "huella");
        setForm((prev) => ({ ...prev, fotos: [...prev.fotos, url] }));
      }
    } catch {
      setError("No pudimos subir una foto. Las fotos anteriores se conservaron.");
    } finally {
      setSubiendo(false);
    }
  }
  function mover(indice: number, direccion: number) {
    setForm((prev) => {
      const fotos = [...prev.fotos];
      const destino = indice + direccion;
      if (destino < 0 || destino >= fotos.length) return prev;
      const origen = fotos[indice];
      const siguiente = fotos[destino];
      if (origen === undefined || siguiente === undefined) return prev;
      fotos[indice] = siguiente;
      fotos[destino] = origen;
      return { ...prev, fotos };
    });
  }
  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!form.titulo.trim() || !form.fecha) {
      setError("Completá el título y la fecha.");
      return;
    }
    setError(null);
    await onGuardar(form);
  }
  const bloqueado = ocupado || subiendo;
  return (
    <form onSubmit={(e) => void enviar(e)} className="space-y-5">
      <fieldset disabled={bloqueado} className="min-w-0 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="huella-titulo">Título *</Label>
          <Input
            id="huella-titulo"
            required
            value={form.titulo}
            onChange={(e) => set("titulo", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="huella-descripcion">Descripción</Label>
          <Textarea
            id="huella-descripcion"
            rows={5}
            value={form.descripcion ?? ""}
            onChange={(e) => set("descripcion", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="huella-fecha">
            {form.tipo === "actual" ? "Fecha" : "Fecha en que se realizó el aporte"} *
          </Label>
          <Input
            id="huella-fecha"
            type="date"
            required
            value={form.fecha}
            onChange={(e) => set("fecha", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="huella-fotos">Fotos</Label>
          <p className="text-xs text-muted-foreground">
            Recomendadas: 1200 × 800 px (3:2), hasta 300 KB. JPG o WebP.
          </p>
          <Input
            id="huella-fotos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              void subir(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          {form.fotos.map((foto, i) => (
            <div key={`${foto}-${i}`} className="flex items-center gap-2 rounded-md border p-2">
              <img
                src={optimizarImagen(foto)}
                alt={`Foto ${i + 1}`}
                className="h-16 w-20 shrink-0 rounded object-cover"
              />
              <span className="mr-auto text-xs text-muted-foreground">{i + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Subir foto en el orden"
                aria-label={`Subir foto ${i + 1}`}
                disabled={i === 0}
                onClick={() => mover(i, -1)}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Bajar foto en el orden"
                aria-label={`Bajar foto ${i + 1}`}
                disabled={i === form.fotos.length - 1}
                onClick={() => mover(i, 1)}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Quitar foto"
                aria-label={`Quitar foto ${i + 1}`}
                onClick={() =>
                  set(
                    "fotos",
                    form.fotos.filter((_, j) => j !== i),
                  )
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="huella-publicada"
            checked={form.publicado}
            onCheckedChange={(v) => set("publicado", v)}
          />
          <Label htmlFor="huella-publicada">
            {form.tipo === "actual" ? "Publicada en la web" : "Publicada"}
          </Label>
        </div>
        {!form.publicado && (
          <p className="text-sm text-muted-foreground">No publicada: no se ve en la web</p>
        )}
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {subiendo && (
        <p role="status" className="text-sm text-muted-foreground">
          Subiendo fotos…
        </p>
      )}
      <Button type="submit" disabled={bloqueado}>
        {ocupado ? "Guardando…" : "Guardar causa"}
      </Button>
    </form>
  );
}
