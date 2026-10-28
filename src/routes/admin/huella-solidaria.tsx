import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { HuellaFormulario } from "@/components/admin/huella-formulario";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { hoyISO } from "@/lib/admin-cms";
import { archivarFase, cargarHuellaAdmin, eliminarHuella, guardarFase, publicarFase, type FaseAdmin, type FaseForm, type PostulacionAdmin } from "@/lib/huella-admin";
import { optimizarImagen } from "@/lib/imagen";

export const Route = createFileRoute("/admin/huella-solidaria")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({ vista: typeof search["vista"] === "string" ? search["vista"] : "actual" }),
  head: () => ({ meta: [
    { title: "Huella Solidaria | Panel Cruzia" },
    { name: "description", content: "Gestión de causas, aportes y postulaciones de Huella Solidaria en Cruzia." },
    { property: "og:title", content: "Huella Solidaria | Panel Cruzia" },
    { property: "og:description", content: "Administración de causas y acciones solidarias de Cruzia." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: HuellaAdmin,
});

const PESTANAS = [{ valor: "actual", titulo: "Causa actual" }, { valor: "historial", titulo: "Historial" }, { valor: "postulaciones", titulo: "Postulaciones" }] as const;
function vacia(tipo: FaseForm["tipo"]): FaseForm {
  return { titulo: "", descripcion: "", fotos: [], fecha: hoyISO(), publicado: false, tipo };
}
function fecha(valor: string) { return new Date(valor.includes("T") ? valor : `${valor}T12:00:00`).toLocaleDateString("es-AR"); }

function HuellaAdmin() {
  const { vista: parametro } = Route.useSearch();
  const vista = PESTANAS.some((p) => p.valor === parametro) ? parametro : "actual";
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const [fases, setFases] = useState<FaseAdmin[]>([]);
  const [postulaciones, setPostulaciones] = useState<PostulacionAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<{ id: string | null; form: FaseForm } | null>(null);
  const [revision, setRevision] = useState(0);
  const cargar = useCallback(async () => {
    const datos = await cargarHuellaAdmin();
    setFases(datos.fases);
    setPostulaciones(datos.postulaciones);
  }, []);
  useEffect(() => {
    void cargar().catch(() => setError("No pudimos cargar Huella Solidaria.")).finally(() => setCargando(false));
  }, [cargar]);
  const actual = fases.find((f) => f.tipo === "actual");
  const historial = fases.filter((f) => f.tipo === "historial");

  async function ejecutar(accion: () => Promise<unknown>, mensaje: string) {
    setOcupado(true); setError(null); setAviso(null);
    try {
      await accion();
      await cargar();
      await queryClient.invalidateQueries({ queryKey: ["huella-solidaria-fases"] });
      setAviso(mensaje);
      return true;
    } catch (e) {
      const codigo = (e as { code?: string })?.code;
      setError(codigo === "23505" ? "Ya existe una causa actual. Recargá la página para editarla." : "No pudimos completar el cambio. Intentá nuevamente.");
      return false;
    } finally { setOcupado(false); }
  }
  async function guardarActual(form: FaseForm) {
    if (await ejecutar(() => guardarFase(actual?.id ?? null, form), "Causa actual guardada.")) setRevision((r) => r + 1);
  }
  async function guardarHistorial(form: FaseForm) {
    if (!edicion) return;
    if (await ejecutar(() => guardarFase(edicion.id, form), "Acción pasada guardada.")) setEdicion(null);
  }
  async function eliminar(tabla: "huella_solidaria_fases" | "postulaciones_solidarias", id: string) {
    if (!window.confirm(tabla === "postulaciones_solidarias" ? "¿Eliminar esta postulación? Esta acción no se puede deshacer." : "¿Eliminar esta acción pasada? Esta acción no se puede deshacer.")) return;
    await ejecutar(() => eliminarHuella(tabla, id), "Registro eliminado.");
  }
  return (
    <AdminShell titulo="Huella Solidaria">
      <div role="tablist" aria-label="Huella Solidaria" className="grid grid-cols-3 gap-2">
        {PESTANAS.map((p) => <Button key={p.valor} role="tab" aria-selected={vista === p.valor} variant={vista === p.valor ? "default" : "outline"} className="min-w-0 px-2 text-xs sm:text-sm" onClick={() => { setEdicion(null); void navigate({ search: (prev) => ({ ...prev, vista: p.valor }) }); }}>{p.titulo}</Button>)}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {aviso && <p role="status" className="text-sm text-muted-foreground">{aviso}</p>}
      {cargando ? <p className="text-sm text-muted-foreground">Cargando…</p> : vista === "actual" ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <CardTitle>Causa actual</CardTitle>
            {actual && <Button variant="outline" size="sm" disabled={ocupado} onClick={() => {
              if (!window.confirm("¿Pasar la causa guardada al historial? Se conservarán sus datos y fotos; los cambios sin guardar no se incluyen.")) return;
              void ejecutar(() => archivarFase(actual.id), "La causa pasó al historial. Ya podés cargar la nueva causa.").then((ok) => { if (ok) setRevision((r) => r + 1); });
            }}>Pasar al historial</Button>}
          </CardHeader>
          <CardContent><HuellaFormulario key={`${actual?.id ?? "nueva"}-${revision}`} inicial={actual ?? vacia("actual")} ocupado={ocupado} onGuardar={guardarActual} /></CardContent>
        </Card>
      ) : vista === "historial" ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3"><CardTitle>Historial</CardTitle><Button onClick={() => setEdicion({ id: null, form: vacia("historial") })}>Nueva acción pasada</Button></CardHeader>
          <CardContent className="space-y-3">
            {!historial.length && <p className="text-sm text-muted-foreground">Todavía no hay acciones pasadas.</p>}
            {historial.map((fase) => <div key={fase.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
              {fase.fotos[0] && <img src={optimizarImagen(fase.fotos[0])} alt={fase.titulo} className="h-16 w-20 rounded object-cover" />}
              <div className="min-w-0 flex-1 basis-40"><p className="break-words font-medium">{fase.titulo}</p><p className="text-xs text-muted-foreground">{fecha(fase.fecha)}</p><Badge variant={fase.publicado ? "default" : "outline"}>{fase.publicado ? "Publicada" : "No publicada"}</Badge>{!fase.publicado && <p className="mt-1 text-xs text-muted-foreground">No publicada: no se ve en la web</p>}</div>
              <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={ocupado} onClick={() => setEdicion({ id: fase.id, form: fase })}>Editar</Button><Button size="sm" variant="outline" disabled={ocupado} onClick={() => void ejecutar(() => publicarFase(fase.id, !fase.publicado), fase.publicado ? "Acción oculta." : "Acción publicada.")}>{fase.publicado ? "Ocultar" : "Publicar"}</Button><Button size="sm" variant="ghost" disabled={ocupado} onClick={() => void eliminar("huella_solidaria_fases", fase.id)}>Eliminar</Button></div>
            </div>)}
          </CardContent>
        </Card>
      ) : (
        <Card><CardHeader><CardTitle>Postulaciones</CardTitle></CardHeader><CardContent className="space-y-3">
          {!postulaciones.length && <p className="text-sm text-muted-foreground">Todavía no hay postulaciones.</p>}
          {postulaciones.map((p) => <div key={p.id} className="space-y-2 rounded-md border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="break-words font-medium">{p.causa}</p><p className="break-words text-sm">{p.nombre}</p><p className="text-xs text-muted-foreground">{fecha(p.fecha)}{p.localidad ? ` · ${p.localidad}` : ""}</p></div><Button size="sm" variant="ghost" disabled={ocupado} onClick={() => void eliminar("postulaciones_solidarias", p.id)}>Eliminar</Button></div>
            {p.descripcion && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{p.descripcion}</p>}
          </div>)}
        </CardContent></Card>
      )}
      <Sheet open={!!edicion} onOpenChange={(open) => { if (!open && !ocupado) setEdicion(null); }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="mb-6"><SheetTitle>{edicion?.id ? "Editar acción pasada" : "Nueva acción pasada"}</SheetTitle><SheetDescription>Datos del aporte realizado.</SheetDescription></SheetHeader>
          {edicion && <HuellaFormulario key={edicion.id ?? "nueva"} inicial={edicion.form} ocupado={ocupado} onGuardar={guardarHistorial} />}
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}