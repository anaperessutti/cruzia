import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/gift-box_/datos/$token")({
  head: () => ({
    meta: [
      { title: "Datos de tu regalo | Gift Box Cruzia" },
      { name: "description", content: "Completá los datos de quien recibe tu Gift Box de Cruzia." },
      { property: "og:title", content: "Datos de tu regalo | Gift Box Cruzia" },
      { property: "og:description", content: "Formulario para personalizar tu Gift Box." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Page,
});

type Info = {
  estado: "ok" | "cerrado" | "oculta" | "inexistente";
  nombre?: string;
  experiencias?: string[];
  formato?: "digital" | "fisico";
  completado?: boolean;
};

const OCASIONES = [
  { valor: "cumpleaños", etiqueta: "Cumpleaños" },
  { valor: "aniversario", etiqueta: "Aniversario" },
  { valor: "agradecimiento", etiqueta: "Agradecimiento" },
  { valor: "otra", etiqueta: "Otra" },
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Marco({ children }: { children: ReactNode }) {
  return (
    <main className="theme-gift bg-gift min-h-[80vh] px-4 pb-20 pt-28 sm:px-6">
      <div className="glass mx-auto max-w-xl rounded-[32px] p-6 sm:p-8">{children}</div>
    </main>
  );
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Marco>
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <p className="mt-3 text-primary-foreground/70">{texto}</p>
      <Button asChild className="mt-6">
        <Link to="/">Ir a Cruzia</Link>
      </Button>
    </Marco>
  );
}

function Page() {
  const { token } = Route.useParams();
  const info = useQuery({
    queryKey: ["giftbox-formulario", token],
    enabled: UUID.test(token),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("giftbox_formulario_info", { p_token: token });
      if (error) throw error;
      return data as unknown as Info;
    },
  });

  if (!UUID.test(token) || info.data?.estado === "inexistente" || info.isError)
    return <Aviso titulo="No encontramos este regalo" texto="Revisá que el link esté completo o escribinos por WhatsApp y te ayudamos." />;
  if (info.isLoading || !info.data) return <main className="theme-gift bg-gift min-h-[80vh]" />;
  if (info.data.estado === "oculta")
    return <Aviso titulo="Gift Box no está disponible ahora" texto="Volvé a intentarlo más tarde o escribinos por WhatsApp." />;
  if (info.data.estado === "cerrado")
    return <Aviso titulo="Este pedido ya está cerrado" texto="El regalo ya fue entregado o cancelado, así que no se pueden cambiar los datos." />;
  return <Formulario token={token} info={info.data} />;
}

function Campo({ id, label, ayuda, children }: { id: string; label: string; ayuda: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <p className="text-xs text-primary-foreground/70">{ayuda}</p>
    </div>
  );
}

function Formulario({ token, info }: { token: string; info: Info }) {
  const fisico = info.formato === "fisico";
  const [f, setF] = useState({ nombre: "", whatsapp: "", ocasion: "", dedicatoria: "", firma: "", fecha: "", direccion: "" });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const hoy = new Date().toISOString().slice(0, 10);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!f.nombre.trim() || !f.ocasion || !f.firma.trim() || !f.fecha || (fisico && !f.direccion.trim())) {
      setError("Completá los campos obligatorios.");
      return;
    }
    setEnviando(true);
    setError(null);
    const { error: err } = await supabase.rpc("giftbox_guardar_datos", {
      p_token: token,
      p_agasajado_nombre: f.nombre.trim(),
      p_agasajado_whatsapp: f.whatsapp.trim(),
      p_ocasion: f.ocasion,
      p_dedicatoria: f.dedicatoria.trim(),
      p_remitente_firma: f.firma.trim(),
      p_fecha_regalo: f.fecha,
      p_direccion_entrega: fisico ? f.direccion.trim() : "",
    });
    setEnviando(false);
    if (err) setError("No pudimos guardar los datos. Revisalos e intentá de nuevo.");
    else setListo(true);
  }

  if (listo)
    return (
      <Marco>
        <h1 className="text-2xl font-semibold">¡Listo, recibimos los datos! 🎁</h1>
        <p className="mt-3 text-primary-foreground/70">
          Ya tenemos todo para preparar el regalo de {f.nombre.trim()}. Si necesitás cambiar algo, escribinos por WhatsApp.
        </p>
      </Marco>
    );

  return (
    <Marco>
      <p className="text-sobretitulo text-primary font-medium">Gift Box</p>
      <h1 className="mt-2 text-2xl font-semibold">
        {info.nombre ? `${info.nombre}, ` : ""}contanos sobre tu regalo
      </h1>
      {!!info.experiencias?.length && (
        <p className="mt-2 text-sm text-primary-foreground/70">
          {info.experiencias.join(" · ")} · {fisico ? "Presentación física" : "Presentación digital"}
        </p>
      )}
      {info.completado && (
        <p className="mt-3 text-sm text-primary">Ya completaste este formulario. Si lo enviás de nuevo, reemplazamos los datos.</p>
      )}
      <form onSubmit={enviar} className="mt-6 space-y-5">
        <Campo id="nombre" label="Nombre de quien recibe" ayuda="Así lo vamos a saludar en el regalo.">
          <Input id="nombre" required maxLength={80} value={f.nombre} onChange={(e) => set("nombre")(e.target.value)} />
        </Campo>
        <Campo id="wa" label="WhatsApp de quien recibe (opcional)" ayuda="Solo para enviarle el regalo digital o coordinar la entrega.">
          <Input id="wa" inputMode="tel" maxLength={30} value={f.whatsapp} onChange={(e) => set("whatsapp")(e.target.value)} />
        </Campo>
        <Campo id="ocasion" label="Ocasión" ayuda="Nos ayuda a ambientar la presentación.">
          <Select value={f.ocasion} onValueChange={set("ocasion")}>
            <SelectTrigger id="ocasion">
              <SelectValue placeholder="Elegí una ocasión" />
            </SelectTrigger>
            <SelectContent>
              {OCASIONES.map((o) => (
                <SelectItem key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo id="dedicatoria" label="Dedicatoria" ayuda={`Tu mensaje para el regalo. ${f.dedicatoria.length}/400`}>
          <Textarea id="dedicatoria" rows={4} maxLength={400} value={f.dedicatoria} onChange={(e) => set("dedicatoria")(e.target.value)} />
        </Campo>
        <Campo id="firma" label="De parte de…" ayuda="Cómo querés firmar el regalo.">
          <Input id="firma" required maxLength={80} value={f.firma} onChange={(e) => set("firma")(e.target.value)} />
        </Campo>
        <Campo id="fecha" label="¿Cuándo querés que lo reciba?" ayuda={fisico ? "Recordá que la preparación requiere 48 hs de anticipación." : "Elegí el día de la entrega."}>
          <Input id="fecha" type="date" required min={hoy} value={f.fecha} onChange={(e) => set("fecha")(e.target.value)} />
        </Campo>
        {fisico && (
          <Campo id="direccion" label="Dirección de entrega" ayuda="Calle, número, localidad y alguna referencia.">
            <Input id="direccion" required maxLength={200} value={f.direccion} onChange={(e) => set("direccion")(e.target.value)} />
          </Campo>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? "Guardando…" : "Enviar datos del regalo"}
        </Button>
      </form>
    </Marco>
  );
}
