import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  cambiarActivoGiftboxItem,
  eliminarGiftboxItem,
  getCatalogos,
  getComerciosAdmin,
  getGiftboxItemsAdmin,
  guardarGiftboxItem,
  subirImagen,
  type Comercio,
  type GiftboxCategoriaAdmin,
  type GiftboxItemAdmin,
  type GiftboxItemForm,
  type Localidad,
} from "@/lib/admin-cms";
import { formatearPrecio } from "@/lib/giftbox";
import { MensajesGiftbox, PedidosGiftbox, useContadorPedidosNuevos } from "@/components/admin/giftbox-pedidos";

type Vista = "experiencias" | "pedidos" | "mensajes";

export const Route = createFileRoute("/admin/gift-box")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { vista: Vista } => ({
    vista: search["vista"] === "pedidos" || search["vista"] === "mensajes" ? search["vista"] : "experiencias",
  }),
  head: () => ({
    meta: [
      { title: "Gift Box | Panel Cruzia" },
      { name: "description", content: "Alta y edición de las experiencias de Gift Box de Cruzia." },
      { property: "og:title", content: "Gift Box | Panel Cruzia" },
      { property: "og:description", content: "Gestión de experiencias de Gift Box de Cruzia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GiftBoxAdmin,
});

const CATEGORIAS: GiftboxCategoriaAdmin[] = ["Noche", "Sabor", "Relax", "Diversión"];
const REDES = ["instagram", "facebook", "tiktok", "web"] as const;

const VACIO: GiftboxItemForm = {
  categoria: "Noche",
  nombre: "",
  precio: 0,
  comercio_id: null,
  lugar: null,
  descripcion: null,
  imagen_url: null,
  galeria: [],
  vigencia_inicio: null,
  vigencia_fin: null,
  direccion: null,
  localidad_id: null,
  horarios: null,
  lat: null,
  lng: null,
  whatsapp: null,
  redes_sociales: {},
  orden: 0,
  activo: true,
};

function formDesde(i: GiftboxItemAdmin): GiftboxItemForm {
  return {
    categoria: i.categoria,
    nombre: i.nombre,
    precio: Number(i.precio),
    comercio_id: i.comercio_id,
    lugar: i.lugar,
    descripcion: i.descripcion,
    imagen_url: i.imagen_url,
    galeria: i.galeria ?? [],
    vigencia_inicio: i.vigencia_inicio,
    vigencia_fin: i.vigencia_fin,
    direccion: i.direccion,
    localidad_id: i.localidad_id,
    horarios: i.horarios,
    lat: i.lat === null ? null : Number(i.lat),
    lng: i.lng === null ? null : Number(i.lng),
    whatsapp: i.whatsapp,
    redes_sociales: (i.redes_sociales ?? {}) as Record<string, string>,
    orden: i.orden,
    activo: i.activo,
  };
}

const vacioANull = (v: string) => (v.trim() === "" ? null : v);
const numONull = (v: string) => (v.trim() === "" || Number.isNaN(Number(v)) ? null : Number(v));

function Campo({ label, htmlFor, full, children }: { label: string; htmlFor?: string; full?: boolean; children: ReactNode }) {
  return (
    <div className={full ? "space-y-2 sm:col-span-2" : "space-y-2"}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

const VISTAS: { valor: Vista; etiqueta: string }[] = [
  { valor: "experiencias", etiqueta: "Experiencias" },
  { valor: "pedidos", etiqueta: "Pedidos" },
  { valor: "mensajes", etiqueta: "Mensajes" },
];

function GiftBoxAdmin() {
  const { vista } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { nuevos, refrescar } = useContadorPedidosNuevos();
  const [items, setItems] = useState<GiftboxItemAdmin[] | null>(null);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<GiftboxItemForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [giftBoxVisible, setGiftBoxVisible] = useState<boolean | null>(null);
  const [guardandoGiftBox, setGuardandoGiftBox] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [lista, cs, cat] = await Promise.all([getGiftboxItemsAdmin(), getComerciosAdmin(), getCatalogos()]);
      setItems(lista);
      setComercios(cs);
      setLocalidades(cat.localidades);
    } catch {
      setError("No pudimos cargar las experiencias.");
    }
  }, []);

  useEffect(() => {
    void cargar();
    void (async () => {
      const { data } = await supabase.from("configuracion_global").select("gift_box_visible").limit(1).maybeSingle();
      setGiftBoxVisible(data?.gift_box_visible ?? false);
    })();
  }, [cargar]);

  async function onToggleGiftBox(valor: boolean) {
    setGuardandoGiftBox(true);
    setAviso(null);
    const { data: fila } = await supabase.from("configuracion_global").select("id").limit(1).maybeSingle();
    if (!fila) {
      setError("No encontramos la configuración general.");
      setGuardandoGiftBox(false);
      return;
    }
    const { error: errUpd } = await supabase
      .from("configuracion_global")
      .update({ gift_box_visible: valor })
      .eq("id", fila.id);
    if (errUpd) {
      setError("No pudimos guardar el cambio de Gift Box.");
    } else {
      setGiftBoxVisible(valor);
      setAviso(valor ? "Gift Box ahora es visible en la app." : "Gift Box quedó oculta en la app.");
    }
    setGuardandoGiftBox(false);
  }

  function set<K extends keyof GiftboxItemForm>(campo: K, valor: GiftboxItemForm[K]) {
    setForm((f) => (f ? { ...f, [campo]: valor } : f));
  }

  function nuevo() {
    setEditando("nuevo");
    setForm({ ...VACIO });
  }

  function editar(i: GiftboxItemAdmin) {
    setEditando(i.id);
    setForm(formDesde(i));
  }

  async function onSubirPortada(file: File | undefined) {
    if (!file) return;
    setSubiendo(true);
    setError(null);
    try {
      set("imagen_url", await subirImagen(file, "giftbox"));
    } catch {
      setError("No pudimos subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  async function onSubirGaleria(files: FileList | null) {
    if (!files || files.length === 0 || !form) return;
    setSubiendo(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await subirImagen(f, "giftbox"));
      setForm((prev) => (prev ? { ...prev, galeria: [...prev.galeria, ...urls] } : prev));
    } catch {
      setError("No pudimos subir alguna imagen de la galería.");
    } finally {
      setSubiendo(false);
    }
  }

  async function onGuardar() {
    if (!form) return;
    if (!form.nombre.trim()) {
      setError("Escribí el nombre de la experiencia.");
      return;
    }
    if (!(form.precio >= 0)) {
      setError("Revisá el precio.");
      return;
    }
    if (form.vigencia_inicio && form.vigencia_fin && form.vigencia_fin < form.vigencia_inicio) {
      setError("La vigencia «hasta» no puede ser anterior a «desde».");
      return;
    }
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      const redes = Object.fromEntries(
        Object.entries(form.redes_sociales).filter(([, v]) => v && v.trim() !== ""),
      );
      await guardarGiftboxItem(editando === "nuevo" ? null : editando, {
        ...form,
        nombre: form.nombre.trim(),
        redes_sociales: redes,
      });
      setEditando(null);
      setForm(null);
      await cargar();
      setAviso("Experiencia guardada.");
    } catch {
      setError("No pudimos guardar la experiencia.");
    } finally {
      setGuardando(false);
    }
  }

  async function onToggleActivo(i: GiftboxItemAdmin) {
    try {
      await cambiarActivoGiftboxItem(i.id, !i.activo);
      await cargar();
    } catch {
      setError("No pudimos cambiar el estado.");
    }
  }

  async function onEliminar(i: GiftboxItemAdmin) {
    if (!window.confirm(`¿Eliminar «${i.nombre}»? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarGiftboxItem(i.id);
      await cargar();
      setAviso("Experiencia eliminada.");
    } catch {
      setError("No pudimos eliminar la experiencia.");
    }
  }

  const comercioDe = (id: string | null) => comercios.find((c) => c.id === id);
  const lugarDe = (i: GiftboxItemAdmin) => i.lugar || comercioDe(i.comercio_id)?.nombre || "—";
  const conComercio = Boolean(form?.comercio_id);
  const ayuda = conComercio ? (
    <p className="text-xs text-muted-foreground">Se usa el dato del comercio si lo dejás vacío.</p>
  ) : null;

  return (
    <AdminShell titulo="Gift Box">
      <div role="tablist" className="flex flex-wrap gap-2">
        {VISTAS.map((v) => (
          <Button
            key={v.valor}
            role="tab"
            aria-selected={vista === v.valor}
            variant={vista === v.valor ? "default" : "outline"}
            onClick={() => void navigate({ search: { vista: v.valor }, replace: true })}
          >
            {v.etiqueta}
            {v.valor === "pedidos" && nuevos > 0 && (
              <Badge variant="secondary" className="ml-2">
                {nuevos}
              </Badge>
            )}
          </Button>
        ))}
      </div>
      {vista === "pedidos" && <PedidosGiftbox onCambio={() => void refrescar()} />}
      {vista === "mensajes" && <MensajesGiftbox />}
      {vista === "experiencias" && (
      <>
      <Card>
        <CardHeader>
          <CardTitle>Visibilidad de Gift Box</CardTitle>
          <CardDescription>
            Mientras esté oculta, la sección no aparece en el menú ni en la app, y quien entre por la
            dirección directa vuelve al inicio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              id="gift-box-visible"
              checked={giftBoxVisible ?? false}
              disabled={giftBoxVisible === null || guardandoGiftBox}
              onCheckedChange={(v) => void onToggleGiftBox(v)}
            />
            <Label htmlFor="gift-box-visible">{giftBoxVisible ? "Visible para el público" : "Oculta"}</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Experiencias</CardTitle>
            <CardDescription>
              Las experiencias que se pueden elegir al armar una Gift Box. Solo las activas se ven en la app.
            </CardDescription>
          </div>
          <Button onClick={nuevo}>Nueva experiencia</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {aviso && <p className="text-sm text-muted-foreground">{aviso}</p>}
          {!items && <p className="text-sm text-muted-foreground">Cargando…</p>}
          {items && items.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no hay experiencias cargadas.</p>
          )}
          <div className="space-y-3">
            {(items ?? []).map((i) => (
              <div key={i.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                {i.imagen_url && <img src={i.imagen_url} alt={i.nombre} className="h-16 w-20 rounded object-cover" />}
                <div className="min-w-[180px] flex-1">
                  <p className="font-medium">{i.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.categoria} · {lugarDe(i)} · {formatearPrecio(Number(i.precio))}
                  </p>
                </div>
                <Badge variant={i.activo ? "default" : "outline"}>{i.activo ? "Activa" : "Inactiva"}</Badge>
                <Button size="sm" variant="outline" onClick={() => editar(i)}>
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => void onToggleActivo(i)}>
                  {i.activo ? "Desactivar" : "Activar"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void onEliminar(i)}>
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
            <CardTitle>{editando === "nuevo" ? "Nueva experiencia" : "Editar experiencia"}</CardTitle>
            <CardDescription>
              Portada y galería recomendadas: 1200 × 800 px (3:2, horizontal), hasta 300 KB, JPG o WebP.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Campo label="Categoría">
              <Select value={form.categoria} onValueChange={(v) => set("categoria", v as GiftboxCategoriaAdmin)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>

            <Campo label="Precio (ARS) *" htmlFor="gb-precio">
              <Input id="gb-precio" type="number" min={0} value={form.precio} onChange={(e) => set("precio", Number(e.target.value))} />
            </Campo>

            <Campo label="Nombre / título *" htmlFor="gb-nombre" full>
              <Input id="gb-nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
            </Campo>

            <Campo label="Comercio vinculado (opcional)">
              <Select value={form.comercio_id ?? "ninguno"} onValueChange={(v) => set("comercio_id", v === "ninguno" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Sin comercio</SelectItem>
                  {comercios.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>

            <Campo label="Lugar" htmlFor="gb-lugar">
              <Input id="gb-lugar" value={form.lugar ?? ""} onChange={(e) => set("lugar", vacioANull(e.target.value))} />
              {ayuda}
            </Campo>

            <Campo label="Descripción" htmlFor="gb-desc" full>
              <Textarea id="gb-desc" rows={3} value={form.descripcion ?? ""} onChange={(e) => set("descripcion", vacioANull(e.target.value))} />
              {ayuda}
            </Campo>

            <Campo label="Vigencia desde" htmlFor="gb-desde">
              <Input id="gb-desde" type="date" value={form.vigencia_inicio ?? ""} onChange={(e) => set("vigencia_inicio", vacioANull(e.target.value))} />
            </Campo>

            <Campo label="Vigencia hasta" htmlFor="gb-hasta">
              <Input id="gb-hasta" type="date" value={form.vigencia_fin ?? ""} onChange={(e) => set("vigencia_fin", vacioANull(e.target.value))} />
            </Campo>

            <Campo label="Portada" htmlFor="gb-portada" full>
              {form.imagen_url && (
                <div className="flex items-center gap-3">
                  <img src={form.imagen_url} alt="Portada" className="h-24 w-36 rounded object-cover" />
                  <Button size="sm" variant="ghost" onClick={() => set("imagen_url", null)}>Quitar</Button>
                </div>
              )}
              <Input id="gb-portada" type="file" accept="image/*" disabled={subiendo} onChange={(e) => void onSubirPortada(e.target.files?.[0])} />
              <p className="text-xs text-muted-foreground">1200 × 800 px (3:2), hasta 300 KB.</p>
              {ayuda}
            </Campo>

            <Campo label="Galería" htmlFor="gb-galeria" full>
              {form.galeria.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.galeria.map((url, idx) => (
                    <div key={url} className="relative">
                      <img src={url} alt={`Foto ${idx + 1}`} className="h-20 w-28 rounded object-cover" />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute right-1 top-1 h-6 px-2 text-xs"
                        onClick={() => set("galeria", form.galeria.filter((u) => u !== url))}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Input id="gb-galeria" type="file" accept="image/*" multiple disabled={subiendo} onChange={(e) => void onSubirGaleria(e.target.files)} />
              <p className="text-xs text-muted-foreground">
                {subiendo ? "Subiendo…" : "1200 × 800 px (3:2), hasta 300 KB cada una."}
              </p>
              {ayuda}
            </Campo>

            <Campo label="Dirección" htmlFor="gb-dir">
              <Input id="gb-dir" value={form.direccion ?? ""} onChange={(e) => set("direccion", vacioANull(e.target.value))} />
              {ayuda}
            </Campo>

            <Campo label="Localidad">
              <Select value={form.localidad_id ?? "ninguna"} onValueChange={(v) => set("localidad_id", v === "ninguna" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">Sin localidad</SelectItem>
                  {localidades.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ayuda}
            </Campo>

            <Campo label="Horarios" htmlFor="gb-horarios" full>
              <Input id="gb-horarios" value={form.horarios ?? ""} onChange={(e) => set("horarios", vacioANull(e.target.value))} />
              {ayuda}
            </Campo>

            <Campo label="Mapa: latitud" htmlFor="gb-lat">
              <Input id="gb-lat" type="number" step="any" value={form.lat ?? ""} onChange={(e) => set("lat", numONull(e.target.value))} />
              {ayuda}
            </Campo>

            <Campo label="Mapa: longitud" htmlFor="gb-lng">
              <Input id="gb-lng" type="number" step="any" value={form.lng ?? ""} onChange={(e) => set("lng", numONull(e.target.value))} />
              {ayuda}
            </Campo>

            <Campo label="WhatsApp" htmlFor="gb-wa">
              <Input id="gb-wa" value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", vacioANull(e.target.value))} />
              {ayuda}
            </Campo>

            <Campo label="Orden" htmlFor="gb-orden">
              <Input id="gb-orden" type="number" value={form.orden} onChange={(e) => set("orden", Number(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Menor número = aparece antes.</p>
            </Campo>

            {REDES.map((r) => (
              <Campo key={r} label={`Redes: ${r}`} htmlFor={`gb-${r}`}>
                <Input
                  id={`gb-${r}`}
                  value={form.redes_sociales[r] ?? ""}
                  onChange={(e) => set("redes_sociales", { ...form.redes_sociales, [r]: e.target.value })}
                />
                {ayuda}
              </Campo>
            ))}

            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch id="gb-activo" checked={form.activo} onCheckedChange={(v) => set("activo", v)} />
              <Label htmlFor="gb-activo">{form.activo ? "Activa (visible en la app)" : "Inactiva"}</Label>
            </div>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button onClick={() => void onGuardar()} disabled={guardando || subiendo}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
              <Button variant="outline" onClick={() => { setEditando(null); setForm(null); }}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </>
      )}
    </AdminShell>
  );
}
