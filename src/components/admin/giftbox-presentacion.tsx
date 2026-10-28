import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { RegaloVista } from "@/components/public/regalo-vista";
import { GiftboxFormulario } from "@/components/public/giftbox-formulario";
import { GiftboxPdfPreview } from "@/components/admin/giftbox-pdf-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Gift, ClipboardList } from "lucide-react";
import { subirImagen } from "@/lib/admin-cms";
import { getPresentacion, REGALO_EJEMPLO, type Presentacion } from "@/lib/regalo";

type CampoImagen = "imagen_portada" | "logo" | "imagen_fondo";
const IMAGENES: { campo: CampoImagen; label: string; ayuda: string }[] = [
  { campo: "imagen_portada", label: "Imagen de portada", ayuda: "1200 × 630 px (1.91:1), hasta 300 KB, JPG. También es la vista previa al compartir el link por WhatsApp." },
  { campo: "logo", label: "Logo", ayuda: "PNG con fondo transparente, 600 × 200 px aprox., hasta 150 KB. Usá una versión clara: el fondo es oscuro." },
  { campo: "imagen_fondo", label: "Imagen de fondo", ayuda: "1600 × 2000 px (4:5, vertical), hasta 400 KB, JPG. Se muestra tenue detrás del contenido." },
];

export function PresentacionGiftbox() {
  const [p, setP] = useState<Presentacion | null>(null);
  const [subiendo, setSubiendo] = useState<CampoImagen | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [vista, setVista] = useState<"web" | "pdf" | "formulario" | null>(null);
  const [formato, setFormato] = useState<"digital" | "fisico">("digital");

  useEffect(() => {
    void getPresentacion().then(setP);
  }, []);

  if (!p) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  const set = <K extends keyof Presentacion>(k: K, v: Presentacion[K]) => setP((x) => (x ? { ...x, [k]: v } : x));
  const txt = (v: string) => (v.trim() === "" ? null : v);

  async function subir(campo: CampoImagen, file?: File) {
    if (!file) return;
    setSubiendo(campo);
    setAviso(null);
    try {
      set(campo, await subirImagen(file, "giftbox"));
    } catch {
      setAviso("No pudimos subir la imagen.");
    } finally {
      setSubiendo(null);
    }
  }

  async function guardar() {
    if (!p) return;
    setGuardando(true);
    const { error } = await supabase
      .from("giftbox_presentacion")
      .update({
        imagen_portada: p.imagen_portada,
        logo: p.logo,
        imagen_fondo: p.imagen_fondo,
        titulo_bienvenida: p.titulo_bienvenida.trim() || "¡{agasajado}, tenés un regalo!",
        texto_como_canjear: p.texto_como_canjear,
        condiciones_generales: p.condiciones_generales,
        contacto_soporte: p.contacto_soporte,
      })
      .eq("id", p.id);
    setGuardando(false);
    setAviso(error ? "No pudimos guardar la presentación." : "Presentación guardada.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presentación digital del regalo</CardTitle>
        <CardDescription>Material común a todos los regalos: la página del link y el PDF descargable.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        {IMAGENES.map((i) => (
          <div key={i.campo} className="space-y-2 sm:col-span-2">
            <Label htmlFor={`pr-${i.campo}`}>{i.label}</Label>
            {p[i.campo] && (
              <div className="flex items-center gap-3">
                <img src={p[i.campo] ?? ""} alt="" className="h-20 w-36 rounded bg-muted object-contain" />
                <Button size="sm" variant="ghost" onClick={() => set(i.campo, null)}>Quitar</Button>
              </div>
            )}
            <Input id={`pr-${i.campo}`} type="file" accept="image/*" disabled={subiendo !== null} onChange={(e) => void subir(i.campo, e.target.files?.[0])} />
            <p className="text-xs text-muted-foreground">{subiendo === i.campo ? "Subiendo…" : i.ayuda}</p>
          </div>
        ))}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pr-titulo">Título de bienvenida</Label>
          <Input id="pr-titulo" value={p.titulo_bienvenida} onChange={(e) => set("titulo_bienvenida", e.target.value)} />
          <p className="text-xs text-muted-foreground">Usá {"{agasajado}"} para poner el nombre de quien recibe.</p>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pr-canje">Cómo canjear (texto general)</Label>
          <Textarea id="pr-canje" rows={3} value={p.texto_como_canjear ?? ""} onChange={(e) => set("texto_como_canjear", txt(e.target.value))} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pr-cond">Condiciones generales</Label>
          <Textarea id="pr-cond" rows={4} value={p.condiciones_generales ?? ""} onChange={(e) => set("condiciones_generales", txt(e.target.value))} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pr-contacto">Contacto de soporte</Label>
          <Textarea id="pr-contacto" rows={2} placeholder="Ej.: WhatsApp 2252 123456 · somoscruzia@gmail.com" value={p.contacto_soporte ?? ""} onChange={(e) => set("contacto_soporte", txt(e.target.value))} />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <Button disabled={guardando || subiendo !== null} onClick={() => void guardar()}>
            {guardando ? "Guardando…" : "Guardar presentación"}
          </Button>
          {aviso && <span className="text-sm text-muted-foreground">{aviso}</span>}
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button variant="outline" onClick={() => setVista("web")}><Gift className="size-4" />Ver regalo (web)</Button>
          <Button variant="outline" onClick={() => setVista("pdf")}><FileText className="size-4" />Ver PDF</Button>
          <Button variant="outline" onClick={() => { setFormato("digital"); setVista("formulario"); }}><ClipboardList className="size-4" />Ver formulario</Button>
        </div>
      </CardContent>
      <Dialog open={vista === "web"} onOpenChange={(open) => { if (!open) setVista(null); }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Vista previa del regalo</DialogTitle>
            <DialogDescription>Con datos de ejemplo y lo que cargaste (aunque no lo hayas guardado).</DialogDescription>
          </DialogHeader>
          <div className="theme-gift rounded-lg [&_.pt-28]:pt-6">
            <RegaloVista info={REGALO_EJEMPLO} presentacion={p} />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={vista === "pdf"} onOpenChange={(open) => { if (!open) setVista(null); }}>
        <DialogContent className="max-h-[90dvh] min-w-0 max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista previa del PDF</DialogTitle>
            <DialogDescription>Datos de ejemplo con los materiales actuales, aunque no estén guardados.</DialogDescription>
          </DialogHeader>
          {vista === "pdf" && <GiftboxPdfPreview presentacion={p} />}
        </DialogContent>
      </Dialog>
      <Dialog open={vista === "formulario"} onOpenChange={(open) => { if (!open) setVista(null); }}>
        <DialogContent className="max-h-[90dvh] max-w-[390px] overflow-y-auto p-0">
          <DialogHeader className="px-5 pb-0 pt-6 text-left">
            <DialogTitle>Vista previa del formulario</DialogTitle>
            <DialogDescription>Datos de ejemplo. No se modifica ningún pedido.</DialogDescription>
          </DialogHeader>
          <div role="group" aria-label="Formato del ejemplo" className="flex gap-2 px-5">
            <Button variant={formato === "digital" ? "default" : "outline"} aria-pressed={formato === "digital"} onClick={() => setFormato("digital")}>Digital</Button>
            <Button variant={formato === "fisico" ? "default" : "outline"} aria-pressed={formato === "fisico"} onClick={() => setFormato("fisico")}>Física</Button>
          </div>
          {vista === "formulario" && <GiftboxFormulario vistaPrevia info={{ estado: "ok", nombre: "Ana", experiencias: [REGALO_EJEMPLO.experiencias[0]?.titulo ?? "Cena para dos frente al mar", "Masaje relajante"], formato }} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
