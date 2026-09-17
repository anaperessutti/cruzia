import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  eliminarCupon,
  enDiasISO,
  getComerciosAdmin,
  getCuponesAdmin,
  guardarCupon,
  hoyISO,
  subirImagen,
  type Comercio,
  type Cupon,
  type CuponForm,
  type Modalidad,
} from "@/lib/admin-cms";

type Busqueda = { comercio?: string | undefined };

export const Route = createFileRoute("/admin/cupones")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): Busqueda => ({
    comercio: typeof search['comercio'] === "string" ? (search['comercio'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Promociones | Panel OLA!" },
      { name: "description", content: "Edición rápida de cupones y promociones de OLA!." },
      { property: "og:title", content: "Promociones | Panel OLA!" },
      { property: "og:description", content: "Edición rápida de cupones y promociones de OLA!." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CuponesAdmin,
});

function formDesde(c: Cupon): CuponForm {
  return {
    comercio_id: c.comercio_id,
    titulo: c.titulo,
    descripcion: c.descripcion,
    flyer_url: c.flyer_url,
    vigencia_inicio: c.vigencia_inicio,
    vigencia_fin: c.vigencia_fin,
    modalidad: c.modalidad,
    cooldown_dias: c.cooldown_dias,
    activo: c.activo,
  };
}

function CuponesAdmin() {
  const { comercio } = useSearch({ from: "/admin/cupones" });
  const navigate = useNavigate();
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cupones, setCupones] = useState<Cupon[] | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<CuponForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [cs, lista] = await Promise.all([getComerciosAdmin(), getCuponesAdmin(comercio)]);
      setComercios(cs);
      setCupones(lista);
    } catch {
      setError("No pudimos cargar las promociones.");
    }
  }, [comercio]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const nombreComercio = (id: string) => comercios.find((c) => c.id === id)?.nombre ?? "—";

  function nuevo() {
    setEditando("nuevo");
    setForm({
      comercio_id: comercio ?? comercios[0]?.id ?? "",
      titulo: "",
      descripcion: "",
      flyer_url: null,
      vigencia_inicio: hoyISO(),
      vigencia_fin: enDiasISO(30),
      modalidad: "presencial",
      cooldown_dias: 7,
      activo: true,
    });
  }

  function set<K extends keyof CuponForm>(campo: K, valor: CuponForm[K]) {
    setForm((f) => (f ? { ...f, [campo]: valor } : f));
  }

  async function onSubirFlyer(file: File | undefined) {
    if (!file) return;
    setSubiendo(true);
    setError(null);
    try {
      set("flyer_url", await subirImagen(file, "cupones"));
    } catch {
      setError("No pudimos subir el flyer.");
    } finally {
      setSubiendo(false);
    }
  }

  async function onGuardar() {
    if (!form) return;
    if (!form.comercio_id || !form.titulo.trim()) {
      setError("Elegí el comercio y escribí un título.");
      return;
    }
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      await guardarCupon(editando === "nuevo" ? null : editando, {
        ...form,
        titulo: form.titulo.trim(),
      });
      setEditando(null);
      setForm(null);
      await cargar();
      setAviso("Promoción guardada.");
    } catch {
      setError("No pudimos guardar la promoción.");
    } finally {
      setGuardando(false);
    }
  }

  async function onEliminar(id: string) {
    if (!window.confirm("¿Eliminar esta promoción?")) return;
    try {
      await eliminarCupon(id);
      await cargar();
      setAviso("Promoción eliminada.");
    } catch {
      setError("No pudimos eliminarla (puede tener activaciones registradas).");
    }
  }

  async function onToggleActivo(c: Cupon, valor: boolean) {
    try {
      await guardarCupon(c.id, { ...formDesde(c), activo: valor });
      await cargar();
    } catch {
      setError("No pudimos cambiar el estado de la promoción.");
    }
  }

  return (
    <AdminShell titulo="Promociones">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Promociones y cupones</CardTitle>
            <CardDescription>
              Editá el flyer, el texto, la vigencia y la modalidad de cada promoción sin tocar la
              ficha del comercio.
            </CardDescription>
          </div>
          <Button onClick={nuevo} disabled={comercios.length === 0}>
            Nueva promoción
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Label>Filtrar por comercio</Label>
            <Select
              value={comercio ?? "todos"}
              onValueChange={(v) =>
                navigate({
                  to: "/admin/cupones",
                  search: v === "todos" ? {} : { comercio: v },
                })
              }
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los comercios</SelectItem>
                {comercios.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {aviso && <p className="text-sm text-muted-foreground">{aviso}</p>}

          {!cupones && <p className="text-sm text-muted-foreground">Cargando…</p>}
          {cupones && cupones.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no hay promociones cargadas.</p>
          )}

          <div className="space-y-3">
            {(cupones ?? []).map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                {c.flyer_url && (
                  <img src={c.flyer_url} alt={c.titulo} className="h-16 w-14 rounded object-cover" />
                )}
                <div className="min-w-[180px] flex-1">
                  <p className="font-medium">{c.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {nombreComercio(c.comercio_id)} · {c.modalidad} · hasta{" "}
                    {new Date(`${c.vigencia_fin}T00:00:00`).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <Badge variant={c.activo ? "default" : "outline"}>
                  {c.activo ? "Activa" : "Pausada"}
                </Badge>
                <Switch
                  checked={c.activo}
                  onCheckedChange={(v) => void onToggleActivo(c, v)}
                  aria-label="Activar o pausar la promoción"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditando(c.id);
                    setForm(formDesde(c));
                  }}
                >
                  Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void onEliminar(c.id)}>
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
            <CardTitle>{editando === "nuevo" ? "Nueva promoción" : "Editar promoción"}</CardTitle>
            <CardDescription>
              Flyer recomendado: 1200 × 800 px (3:2, horizontal), hasta 300 KB — la misma medida
              que la foto de portada de los comercios, porque el flyer se usa como portada de la
              tarjeta en la grilla.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Comercio *</Label>
              <Select value={form.comercio_id} onValueChange={(v) => set("comercio_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí el comercio" />
                </SelectTrigger>
                <SelectContent>
                  {comercios.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" value={form.titulo} onChange={(e) => set("titulo", e.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="desc-cupon">Descripción</Label>
              <Textarea
                id="desc-cupon"
                rows={3}
                value={form.descripcion ?? ""}
                onChange={(e) => set("descripcion", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inicio">Vigencia desde</Label>
              <Input
                id="inicio"
                type="date"
                value={form.vigencia_inicio}
                onChange={(e) => set("vigencia_inicio", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fin">Vigencia hasta</Label>
              <Input
                id="fin"
                type="date"
                value={form.vigencia_fin}
                onChange={(e) => set("vigencia_fin", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Modalidad</Label>
              <Select
                value={form.modalidad}
                onValueChange={(v) => set("modalidad", v as Modalidad)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial (QR en el local)</SelectItem>
                  <SelectItem value="whatsapp">Reserva por WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooldown">Días de espera entre usos</Label>
              <Input
                id="cooldown"
                type="number"
                min={0}
                value={form.cooldown_dias}
                onChange={(e) => set("cooldown_dias", Number(e.target.value))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="flyer">Flyer (1200 × 800 px, 3:2, hasta 300 KB)</Label>
              <Input
                id="flyer"
                type="file"
                accept="image/*"
                disabled={subiendo}
                onChange={(e) => void onSubirFlyer(e.target.files?.[0])}
              />
              {subiendo && <p className="text-sm text-muted-foreground">Subiendo flyer…</p>}
              {form.flyer_url && (
                <div className="flex items-center gap-3">
                  <img src={form.flyer_url} alt="Flyer" className="h-28 w-24 rounded object-cover" />
                  <Button size="sm" variant="ghost" onClick={() => set("flyer_url", null)}>
                    Quitar flyer
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch id="activa" checked={form.activo} onCheckedChange={(v) => set("activo", v)} />
              <Label htmlFor="activa">{form.activo ? "Activa" : "Pausada"}</Label>
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button onClick={() => void onGuardar()} disabled={guardando || subiendo}>
                {guardando ? "Guardando…" : "Guardar promoción"}
              </Button>
              <Button
                variant="outline"
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
