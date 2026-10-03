import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  eliminarComercio,
  eliminarSede,
  getCatalogos,
  getColeccionesDeComercio,
  getComercio,
  getSedesDeComercio,
  guardarColeccionesDeComercio,
  guardarComercio,
  guardarSede,
  subirImagen,
  type CatalogosCms,
  type ComercioForm,
  type Sede,
} from "@/lib/admin-cms";

export const Route = createFileRoute("/admin/comercios/$comercioId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Editar comercio | Panel Cruzia" },
      { name: "description", content: "Formulario de carga y edición de comercios de Cruzia." },
      { property: "og:title", content: "Editar comercio | Panel Cruzia" },
      { property: "og:description", content: "Formulario de carga y edición de comercios de Cruzia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditorComercio,
});

const VACIO: ComercioForm = {
  nombre: "",
  plan_id: "",
  rubro_id: null,
  localidad_id: null,
  descripcion: "",
  direccion: "",
  lat: null,
  lng: null,
  horarios: "",
  whatsapp: "",
  galeria: [],
  activo: true,
  es_indoor: false,
  hero_alcance_local: false,
};

function EditorComercio() {
  const { comercioId } = useParams({ from: "/admin/comercios/$comercioId" });
  const esNuevo = comercioId === "nuevo";
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ComercioForm>(VACIO);
  const [catalogos, setCatalogos] = useState<CatalogosCms | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [colecciones, setColecciones] = useState<string[]>([]);
  /** Sedes ADICIONALES (la principal son los campos de la ficha de arriba). */
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [guardandoSede, setGuardandoSede] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const cat = await getCatalogos();
        if (!activo) return;
        setCatalogos(cat);
        if (esNuevo) {
          setForm({ ...VACIO, plan_id: cat.planes.at(-1)?.id ?? cat.planes[0]?.id ?? "" });
        } else {
          const [c, cols, seds] = await Promise.all([
            getComercio(comercioId),
            getColeccionesDeComercio(comercioId),
            getSedesDeComercio(comercioId),
          ]);
          if (!activo) return;
          setSedes(seds);
          if (!c) {
            setError("No encontramos ese comercio.");
          } else {
            setColecciones(cols);
            setForm({
              nombre: c.nombre,
              plan_id: c.plan_id,
              rubro_id: c.rubro_id,
              localidad_id: c.localidad_id,
              descripcion: c.descripcion,
              direccion: c.direccion,
              lat: c.lat,
              lng: c.lng,
              horarios: c.horarios,
              whatsapp: c.whatsapp,
              galeria: c.galeria ?? [],
              activo: c.activo,
              es_indoor: c.es_indoor,
              hero_alcance_local: c.hero_alcance_local,
            });
          }
        }
      } catch {
        if (activo) setError("No pudimos cargar los datos.");
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [comercioId, esNuevo]);

  /** Premium es el único plan con presencia en el banner destacado del Home. */
  const esPremium = Boolean(
    catalogos?.planes.find((p) => p.id === form.plan_id)?.aparece_en_hero_banner,
  );

  function set<K extends keyof ComercioForm>(campo: K, valor: ComercioForm[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  /** Guarda la galería en la base al instante (si la ficha ya existe), para que se vea en la app pública. */
  async function aplicarGaleria(galeria: string[], mensaje: string) {
    const siguiente = { ...form, galeria };
    setForm(siguiente);
    if (esNuevo) {
      setAviso("Listo. Acordate de guardar la ficha para publicarla.");
      return;
    }
    try {
      await guardarComercio(comercioId, { ...siguiente, nombre: siguiente.nombre.trim() });
      setAviso(mensaje);
    } catch {
      setError("Subimos la foto pero no pudimos guardarla en la ficha. Probá guardar la ficha.");
    }
  }

  async function onSubirFotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSubiendo(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await subirImagen(file, "comercios"));
      }
      await aplicarGaleria([...form.galeria, ...urls], "Fotos subidas y publicadas.");
    } catch {
      setError("No pudimos subir alguna de las fotos.");
    } finally {
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function moverFoto(indice: number, delta: number) {
    const g = [...form.galeria];
    const destino = indice + delta;
    if (destino < 0 || destino >= g.length) return;
    const actual = g[indice]!;
    g[indice] = g[destino]!;
    g[destino] = actual;
    await aplicarGaleria(g, "Orden de las fotos actualizado.");
  }

  function setSede(id: string, campo: keyof Sede, valor: unknown) {
    setSedes((prev) => prev.map((s) => (s.id === id ? { ...s, [campo]: valor } : s)));
  }

  async function onAgregarSede() {
    setError(null);
    try {
      const id = await guardarSede(null, {
        comercio_id: comercioId,
        direccion: "",
        localidad_id: form.localidad_id,
        lat: null,
        lng: null,
        horarios: "",
      });
      setSedes(await getSedesDeComercio(comercioId));
      setAviso("Sede agregada. Completá sus datos y guardala.");
      return id;
    } catch {
      setError("No pudimos agregar la sede.");
      return null;
    }
  }

  async function onGuardarSede(sede: Sede) {
    setGuardandoSede(sede.id);
    setError(null);
    try {
      await guardarSede(sede.id, {
        comercio_id: comercioId,
        direccion: sede.direccion,
        localidad_id: sede.localidad_id,
        lat: sede.lat,
        lng: sede.lng,
        horarios: sede.horarios,
      });
      setAviso("Sede guardada.");
    } catch {
      setError("No pudimos guardar la sede.");
    } finally {
      setGuardandoSede(null);
    }
  }

  async function onEliminarSede(id: string) {
    if (!window.confirm("¿Eliminar esta sede?")) return;
    try {
      await eliminarSede(id);
      setSedes((prev) => prev.filter((s) => s.id !== id));
      setAviso("Sede eliminada.");
    } catch {
      setError("No pudimos eliminar la sede.");
    }
  }

  async function onGuardar() {
    if (!form.nombre.trim() || !form.plan_id) {
      setError("El nombre y el plan son obligatorios.");
      return;
    }
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      const id = await guardarComercio(esNuevo ? null : comercioId, {
        ...form,
        nombre: form.nombre.trim(),
      });
      await guardarColeccionesDeComercio(id, colecciones);
      if (esNuevo) {
        navigate({ to: "/admin/comercios/$comercioId", params: { comercioId: id }, replace: true });
      }
      setAviso("Ficha guardada.");
    } catch {
      setError("No pudimos guardar la ficha. Revisá los datos e intentá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function onEliminar() {
    if (esNuevo) return;
    if (!window.confirm("¿Eliminar este comercio y todas sus promociones?")) return;
    setGuardando(true);
    try {
      await eliminarComercio(comercioId);
      navigate({ to: "/admin/comercios", replace: true });
    } catch {
      setError("No pudimos eliminarlo (puede tener métricas asociadas).");
      setGuardando(false);
    }
  }

  return (
    <AdminShell titulo={esNuevo ? "Nuevo comercio" : "Editar comercio"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/comercios">← Volver a comercios</Link>
        </Button>
        {!esNuevo && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/cupones" search={{ comercio: comercioId }}>
              Editar promociones de este comercio
            </Link>
          </Button>
        )}
      </div>

      {cargando ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Datos del comercio</CardTitle>
              <CardDescription>
                Todo lo que se ve en la ficha pública. El plan define si aparece en el Top Slider y
                si puede tener cupones.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nombre">Nombre del comercio *</Label>
                <Input id="nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Plan *</Label>
                <Select value={form.plan_id} onValueChange={(v) => set("plan_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogos?.planes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Localidad</Label>
                <Select
                  value={form.localidad_id ?? ""}
                  onValueChange={(v) => set("localidad_id", v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí una localidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogos?.localidades.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (con código de país)</Label>
                <Input
                  id="whatsapp"
                  placeholder="5492246000000"
                  value={form.whatsapp ?? ""}
                  onChange={(e) => set("whatsapp", e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  rows={4}
                  value={form.descripcion ?? ""}
                  onChange={(e) => set("descripcion", e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={form.direccion ?? ""}
                  onChange={(e) => set("direccion", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lat">Latitud (mapa)</Label>
                <Input
                  id="lat"
                  inputMode="decimal"
                  placeholder="-36.5412"
                  value={form.lat ?? ""}
                  onChange={(e) => set("lat", e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lng">Longitud (mapa)</Label>
                <Input
                  id="lng"
                  inputMode="decimal"
                  placeholder="-56.6987"
                  value={form.lng ?? ""}
                  onChange={(e) => set("lng", e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>

              <p className="text-xs text-muted-foreground sm:col-span-2">
                Para obtener la ubicación: abrí Google Maps, tocá el punto exacto del local y copiá
                los dos números que aparecen (el primero es latitud, el segundo longitud).
              </p>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="horarios">Horarios</Label>
                <Textarea
                  id="horarios"
                  rows={3}
                  placeholder="Lunes a viernes de 9 a 13 y de 17 a 21. Sábados de 9 a 13."
                  value={form.horarios ?? ""}
                  onChange={(e) => set("horarios", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch
                  id="activo"
                  checked={form.activo}
                  onCheckedChange={(v) => set("activo", v)}
                />
                <Label htmlFor="activo">
                  {form.activo ? "Publicado en la app" : "Oculto (no se ve en la app)"}
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colecciones y Home</CardTitle>
              <CardDescription>
                Las colecciones agrupan comercios por momento o interés en el Home. Un comercio
                puede estar en varias a la vez.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {catalogos?.colecciones.map((col) => {
                  const elegida = colecciones.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"
                    >
                      <Checkbox
                        checked={elegida}
                        onCheckedChange={(v) =>
                          setColecciones((prev) =>
                            v ? [...prev, col.id] : prev.filter((id) => id !== col.id),
                          )
                        }
                      />
                      <span>{col.nombre}</span>
                    </label>
                  );
                })}
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={form.es_indoor}
                  onCheckedChange={(v) => set("es_indoor", v === true)}
                />
                <span>Es un lugar bajo techo (indoor)</span>
              </label>

              {/* Solo Premium: alcance del Hero cuando se muestra la ficha general
                  (es decir, cuando NO hay ninguna promoción ni evento postulado a mano). */}
              {esPremium ? (
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="alcance-ficha">Alcance de la ficha en el Hero</Label>
                    <Switch
                      id="alcance-ficha"
                      checked={!form.hero_alcance_local}
                      onCheckedChange={(v) => set("hero_alcance_local", !v)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {form.hero_alcance_local
                      ? "Solo cerca del comercio (10 km)."
                      : "Mostrar en todas las localidades."}{" "}
                    Se aplica únicamente cuando el Hero muestra la ficha general de este comercio,
                    es decir cuando no hay ninguna promoción ni evento postulado al Top Slider.
                  </p>
                </div>
              ) : null}



            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sedes adicionales</CardTitle>
              <CardDescription>
                La dirección de arriba es la sede principal. Si el comercio tiene más de un local,
                sumá acá cada sede con su dirección, localidad y horarios. Es opcional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {esNuevo ? (
                <p className="text-sm text-muted-foreground">
                  Guardá primero la ficha para poder cargar sedes adicionales.
                </p>
              ) : (
                <>
                  {sedes.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Este comercio tiene una sola dirección (la principal).
                    </p>
                  )}
                  {sedes.map((sede, i) => (
                    <div key={sede.id} className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                      <p className="text-sm font-medium sm:col-span-2">Sede {i + 2}</p>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`dir-${sede.id}`}>Dirección</Label>
                        <Input
                          id={`dir-${sede.id}`}
                          value={sede.direccion ?? ""}
                          onChange={(e) => setSede(sede.id, "direccion", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Localidad</Label>
                        <Select
                          value={sede.localidad_id ?? ""}
                          onValueChange={(v) => setSede(sede.id, "localidad_id", v || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Elegí una localidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {catalogos?.localidades.map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`lat-${sede.id}`}>Latitud</Label>
                          <Input
                            id={`lat-${sede.id}`}
                            inputMode="decimal"
                            value={sede.lat ?? ""}
                            onChange={(e) =>
                              setSede(sede.id, "lat", e.target.value === "" ? null : Number(e.target.value))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`lng-${sede.id}`}>Longitud</Label>
                          <Input
                            id={`lng-${sede.id}`}
                            inputMode="decimal"
                            value={sede.lng ?? ""}
                            onChange={(e) =>
                              setSede(sede.id, "lng", e.target.value === "" ? null : Number(e.target.value))
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`hor-${sede.id}`}>Horarios de esta sede</Label>
                        <Textarea
                          id={`hor-${sede.id}`}
                          rows={2}
                          value={sede.horarios ?? ""}
                          onChange={(e) => setSede(sede.id, "horarios", e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3 sm:col-span-2">
                        <Button
                          size="sm"
                          onClick={() => void onGuardarSede(sede)}
                          disabled={guardandoSede === sede.id}
                        >
                          {guardandoSede === sede.id ? "Guardando…" : "Guardar sede"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void onEliminarSede(sede.id)}>
                          Eliminar sede
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => void onAgregarSede()}>
                    Agregar sede
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fotos</CardTitle>
              <CardDescription>
                La primera foto es la portada de la tarjeta en la grilla. Medidas recomendadas:
                1200 × 800 px (portada y galería) y 1600 × 900 px para el Hero Banner de Premium.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                disabled={subiendo}
                onChange={(e) => void onSubirFotos(e.target.files)}
              />
              {subiendo && <p className="text-sm text-muted-foreground">Subiendo fotos…</p>}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.galeria.map((url, i) => (
                  <div key={url} className="overflow-hidden rounded-lg border">
                    <img src={url} alt={`Foto ${i + 1}`} className="h-32 w-full object-cover" />
                    <div className="flex items-center justify-between gap-1 p-2">
                      <span className="text-xs text-muted-foreground">
                        {i === 0 ? "Portada" : `Foto ${i + 1}`}
                      </span>
                      <span className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => void moverFoto(i, -1)}>
                          ↑
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void moverFoto(i, 1)}>
                          ↓
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void aplicarGaleria(
                              form.galeria.filter((_, idx) => idx !== i),
                              "Foto eliminada.",
                            )
                          }
                        >
                          ✕
                        </Button>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {aviso && <p className="text-sm text-muted-foreground">{aviso}</p>}

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void onGuardar()} disabled={guardando || subiendo}>
              {guardando ? "Guardando…" : "Guardar ficha"}
            </Button>
            {!esNuevo && (
              <Button variant="outline" onClick={() => void onEliminar()} disabled={guardando}>
                Eliminar comercio
              </Button>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}
