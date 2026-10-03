import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  eliminarEvento,
  enDiasISO,
  eventoVigente,
  getCatalogos,
  getColeccionesDeEvento,
  getComerciosAdmin,
  getEventosAdmin,
  guardarColeccionesDeEvento,
  guardarEvento,
  hoyISO,
  subirImagen,
  type CatalogosCms,
  type Comercio,
  type Evento,
  type EventoForm,
} from "@/lib/admin-cms";

export const Route = createFileRoute("/admin/eventos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Eventos | Panel Cruzia" },
      { name: "description", content: "Alta y edición de eventos con fecha de inicio y fin de Cruzia." },
      { property: "og:title", content: "Eventos | Panel Cruzia" },
      { property: "og:description", content: "Alta y edición de eventos de Cruzia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EventosAdmin,
});

const VACIO: EventoForm = {
  titulo: "",
  descripcion: "",
  imagen_url: null,
  fecha_inicio: hoyISO(),
  fecha_fin: enDiasISO(7),
  comercio_id: null,
  localidad_id: null,
  lat: null,
  lng: null,
  es_top_slider: false,
  hero_alcance_local: false,
  es_favorita_home: false,
};

function formDesde(e: Evento): EventoForm {
  return {
    titulo: e.titulo,
    descripcion: e.descripcion,
    imagen_url: e.imagen_url,
    fecha_inicio: e.fecha_inicio,
    fecha_fin: e.fecha_fin,
    comercio_id: e.comercio_id,
    localidad_id: e.localidad_id,
    lat: e.lat,
    lng: e.lng,
    es_top_slider: e.es_top_slider,
    hero_alcance_local: e.hero_alcance_local,
    es_favorita_home: e.es_favorita_home,
  };
}

function EventosAdmin() {
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogosCms | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<EventoForm | null>(null);
  const [colecciones, setColecciones] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [lista, cs, cat] = await Promise.all([getEventosAdmin(), getComerciosAdmin(), getCatalogos()]);
      setEventos(lista);
      setComercios(cs);
      setCatalogos(cat);
    } catch {
      setError("No pudimos cargar los eventos.");
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  function set<K extends keyof EventoForm>(campo: K, valor: EventoForm[K]) {
    setForm((f) => (f ? { ...f, [campo]: valor } : f));
  }

  function nuevo() {
    setEditando("nuevo");
    setColecciones([]);
    setForm({ ...VACIO });
  }

  async function editar(e: Evento) {
    setEditando(e.id);
    setForm(formDesde(e));
    setColecciones(await getColeccionesDeEvento(e.id));
  }

  async function onSubirImagen(file: File | undefined) {
    if (!file) return;
    setSubiendo(true);
    setError(null);
    try {
      set("imagen_url", await subirImagen(file, "eventos"));
    } catch {
      setError("No pudimos subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  async function onGuardar() {
    if (!form) return;
    if (!form.titulo.trim() || !form.fecha_fin) {
      setError("Escribí el título y la fecha de finalización.");
      return;
    }
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      const id = await guardarEvento(editando === "nuevo" ? null : editando, {
        ...form,
        titulo: form.titulo.trim(),
      });
      await guardarColeccionesDeEvento(id, colecciones);
      setEditando(null);
      setForm(null);
      await cargar();
      setAviso("Evento guardado.");
    } catch {
      setError("No pudimos guardar el evento.");
    } finally {
      setGuardando(false);
    }
  }

  async function onEliminar(id: string) {
    if (!window.confirm("¿Eliminar este evento?")) return;
    try {
      await eliminarEvento(id);
      await cargar();
      setAviso("Evento eliminado.");
    } catch {
      setError("No pudimos eliminar el evento.");
    }
  }

  const nombreComercio = (id: string | null) => comercios.find((c) => c.id === id)?.nombre ?? "Independiente (Cruzia)";

  return (
    <AdminShell titulo="Eventos">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Eventos</CardTitle>
            <CardDescription>
              Actividades con fecha de inicio y fin, con o sin comercio asociado. Se muestran solas
              mientras estén en fecha y desaparecen sin que tengas que pausarlas.
            </CardDescription>
          </div>
          <Button onClick={nuevo}>Nuevo evento</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {aviso && <p className="text-sm text-muted-foreground">{aviso}</p>}
          {!eventos && <p className="text-sm text-muted-foreground">Cargando…</p>}
          {eventos && eventos.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no hay eventos cargados.</p>
          )}
          <div className="space-y-3">
            {(eventos ?? []).map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                {e.imagen_url && <img src={e.imagen_url} alt={e.titulo} className="h-16 w-20 rounded object-cover" />}
                <div className="min-w-[180px] flex-1">
                  <p className="font-medium">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {nombreComercio(e.comercio_id)} · del{" "}
                    {new Date(`${e.fecha_inicio}T00:00:00`).toLocaleDateString("es-AR")} al{" "}
                    {new Date(`${e.fecha_fin}T00:00:00`).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <Badge variant={eventoVigente(e) ? "default" : "outline"}>
                  {eventoVigente(e) ? "En fecha" : "Finalizado"}
                </Badge>
                {e.es_top_slider && <Badge variant="secondary">Top Slider</Badge>}
                <Button size="sm" variant="outline" onClick={() => void editar(e)}>
                  Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void onEliminar(e.id)}>
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {form && (
        <Card>
          <CardHeader>
            <CardTitle>{editando === "nuevo" ? "Nuevo evento" : "Editar evento"}</CardTitle>
            <CardDescription>
              Imagen recomendada: 1200 × 800 px (3:2, horizontal), hasta 300 KB.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="titulo-evento">Título *</Label>
              <Input id="titulo-evento" value={form.titulo} onChange={(e) => set("titulo", e.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="desc-evento">Descripción</Label>
              <Textarea id="desc-evento" rows={3} value={form.descripcion ?? ""} onChange={(e) => set("descripcion", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ev-inicio">Fecha de inicio</Label>
              <Input id="ev-inicio" type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ev-fin">Fecha de finalización</Label>
              <Input id="ev-fin" type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Comercio asociado (opcional)</Label>
              <Select
                value={form.comercio_id ?? "ninguno"}
                onValueChange={(v) => set("comercio_id", v === "ninguno" ? null : v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Sin comercio (evento de Cruzia)</SelectItem>
                  {comercios.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Localidad</Label>
              <Select
                value={form.localidad_id ?? "ninguna"}
                onValueChange={(v) => set("localidad_id", v === "ninguna" ? null : v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">Sin localidad</SelectItem>
                  {(catalogos?.localidades ?? []).map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ev-lat">Latitud</Label>
              <Input
                id="ev-lat"
                type="number"
                step="any"
                value={form.lat ?? ""}
                onChange={(e) => set("lat", e.target.value === "" ? null : Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ev-lng">Longitud</Label>
              <Input
                id="ev-lng"
                type="number"
                step="any"
                value={form.lng ?? ""}
                onChange={(e) => set("lng", e.target.value === "" ? null : Number(e.target.value))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ev-imagen">Imagen (1200 × 800 px, hasta 300 KB)</Label>
              <Input id="ev-imagen" type="file" accept="image/*" disabled={subiendo} onChange={(e) => void onSubirImagen(e.target.files?.[0])} />
              {subiendo && <p className="text-sm text-muted-foreground">Subiendo imagen…</p>}
              {form.imagen_url && (
                <div className="flex items-center gap-3">
                  <img src={form.imagen_url} alt="Imagen del evento" className="h-24 w-32 rounded object-cover" />
                  <Button size="sm" variant="ghost" onClick={() => set("imagen_url", null)}>Quitar imagen</Button>
                </div>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Colecciones del Home</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {(catalogos?.colecciones ?? []).map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={colecciones.includes(c.id)}
                      onCheckedChange={(v) =>
                        setColecciones((prev) => (v ? [...prev, c.id] : prev.filter((id) => id !== c.id)))
                      }
                    />
                    {c.nombre}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                El evento aparece en las filas del Home y en la grilla de esas categorías.
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center gap-3">
                <Switch id="ev-favorita" checked={form.es_favorita_home} onCheckedChange={(v) => set("es_favorita_home", v)} />
                <Label htmlFor="ev-favorita">Marcar como favorita de la Costa</Label>
              </div>
              <p className="text-xs text-muted-foreground">Se destaca en la fila “Favoritos de la Costa” del Home.</p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center gap-3">
                <Switch id="ev-top" checked={form.es_top_slider} onCheckedChange={(v) => set("es_top_slider", v)} />
                <Label htmlFor="ev-top">Postular al Top Slider</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Si el evento está asociado a un comercio, al marcarlo se desmarca automáticamente su promoción postulada.
                Los eventos sin comercio no tienen ese límite.
              </p>
              {form.es_top_slider && (
                <div className="mt-3 space-y-1 rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="ev-alcance"
                      checked={!form.hero_alcance_local}
                      onCheckedChange={(v) => set("hero_alcance_local", !v)}
                    />
                    <Label htmlFor="ev-alcance">
                      {form.hero_alcance_local ? "Solo cerca del evento (10 km)" : "Mostrar en todas las localidades"}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Para el radio de 10 km hace falta cargar la latitud y la longitud del evento.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button onClick={() => void onGuardar()} disabled={guardando || subiendo}>
                {guardando ? "Guardando…" : "Guardar evento"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditando(null);
                  setForm(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}
