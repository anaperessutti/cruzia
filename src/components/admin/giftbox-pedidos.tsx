import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BotonPdf } from "@/components/public/regalo-vista";
import { getPresentacion, getRegalo, type Presentacion, type RegaloOk } from "@/lib/regalo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { formatearPrecio } from "@/lib/giftbox";
import {
  armarMensaje,
  linkWhatsapp,
  normalizarWhatsappAR,
  NOTA_FISICO,
  VARIABLES_PLANTILLA,
} from "@/lib/whatsapp-ar";

export type Pedido = Database["public"]["Tables"]["giftbox_pedidos"]["Row"];
export type EstadoPedido = Database["public"]["Enums"]["giftbox_estado"];

export const ESTADOS: { valor: EstadoPedido; etiqueta: string }[] = [
  { valor: "pendiente", etiqueta: "Nuevo" },
  { valor: "contactado", etiqueta: "Esperando pago" },
  { valor: "confirmado", etiqueta: "Pagado" },
  { valor: "entregado", etiqueta: "Entregado" },
  { valor: "cancelado", etiqueta: "Cancelado" },
];
const etiquetaEstado = (e: EstadoPedido) => ESTADOS.find((x) => x.valor === e)?.etiqueta ?? e;

type ItemPedido = { id?: string; nombre?: string; precio?: number | string; categoria?: string };
const itemsDe = (p: Pedido): ItemPedido[] =>
  Array.isArray(p.items_seleccionados) ? (p.items_seleccionados as ItemPedido[]) : [];

const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

type Plantillas = { id: string; pago: string; regalo: string };

async function getPlantillas(): Promise<Plantillas | null> {
  const { data } = await supabase
    .from("configuracion_global")
    .select("id, giftbox_plantilla_pago, giftbox_plantilla_regalo")
    .limit(1)
    .maybeSingle();
  return data ? { id: data.id, pago: data.giftbox_plantilla_pago, regalo: data.giftbox_plantilla_regalo } : null;
}

function mensajePago(plantilla: string, p: Pedido, origen: string) {
  return armarMensaje(plantilla, {
    nombre: p.contacto_nombre ?? "",
    link_pago: p.link_pago ?? "",
    link_formulario: `${origen}/gift-box/datos/${p.token_formulario}`,
    nota_fisico: p.formato === "fisico" ? NOTA_FISICO : "",
  });
}

export function useContadorPedidosNuevos() {
  const [n, setN] = useState(0);
  const refrescar = useCallback(async () => {
    const { count } = await supabase
      .from("giftbox_pedidos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "pendiente");
    setN(count ?? 0);
  }, []);
  useEffect(() => {
    void refrescar();
  }, [refrescar]);
  return { nuevos: n, refrescar };
}

export function PedidosGiftbox({ onCambio }: { onCambio: () => void }) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [filtro, setFiltro] = useState<EstadoPedido | "todos">("todos");
  const [abierto, setAbierto] = useState<Pedido | null>(null);
  const [plantilla, setPlantilla] = useState("");
  const [plantillaRegalo, setPlantillaRegalo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data, error: e } = await supabase.from("giftbox_pedidos").select("*").order("fecha", { ascending: false });
    if (e) setError("No pudimos cargar los pedidos.");
    else setPedidos(data);
  }, []);

  useEffect(() => {
    void cargar();
    void getPlantillas().then((p) => {
      setPlantilla(p?.pago ?? "");
      setPlantillaRegalo(p?.regalo ?? "");
    });
  }, [cargar]);

  const visibles = useMemo(
    () => (pedidos ?? []).filter((p) => filtro === "todos" || p.estado === filtro),
    [pedidos, filtro],
  );

  async function actualizado() {
    await cargar();
    onCambio();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>Del más nuevo al más viejo. Tocá uno para gestionarlo.</CardDescription>
        </div>
        <Select value={filtro} onValueChange={(v) => setFiltro(v as EstadoPedido | "todos")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {ESTADOS.map((e) => (
              <SelectItem key={e.valor} value={e.valor}>
                {e.etiqueta}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {pedidos === null ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : visibles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay pedidos para mostrar.</p>
        ) : (
          <ul className="divide-y divide-border">
            {visibles.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setAbierto(p)}
                  className="grid w-full gap-1 py-3 text-left text-sm hover:bg-muted/40 sm:grid-cols-[110px_1fr_140px_80px_110px_130px] sm:items-center sm:gap-3"
                >
                  <span className="text-muted-foreground">{fechaCorta(p.fecha)}</span>
                  <span className="font-medium">{p.contacto_nombre || "Sin nombre"}</span>
                  <span>{p.contacto_whatsapp || "—"}</span>
                  <span>{p.formato === "fisico" ? "Física" : "Digital"}</span>
                  <span>{formatearPrecio(Number(p.precio_total))}</span>
                  <span>
                    <Badge variant={p.estado === "pendiente" ? "default" : "secondary"}>{etiquetaEstado(p.estado)}</Badge>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <Sheet open={!!abierto} onOpenChange={(o) => !o && setAbierto(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {abierto && (
            <DetallePedido key={abierto.id} pedido={abierto} plantilla={plantilla} plantillaRegalo={plantillaRegalo} onGuardado={actualizado} />
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}

function DetallePedido({
  pedido,
  plantilla,
  plantillaRegalo,
  onGuardado,
}: {
  pedido: Pedido;
  plantilla: string;
  plantillaRegalo: string;
  onGuardado: () => Promise<void>;
}) {
  const [p, setP] = useState(pedido);
  const [numero, setNumero] = useState(normalizarWhatsappAR(pedido.contacto_whatsapp));
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const origen = typeof window !== "undefined" ? window.location.origin : "";
  const mensaje = mensajePago(plantilla, p, origen);
  const puedeEnviar = !!p.link_pago?.trim() && numero.length >= 12;

  async function guardar(cambios: Partial<Pedido>, ok: string) {
    setGuardando(true);
    setError(null);
    const { data, error: e } = await supabase
      .from("giftbox_pedidos")
      .update(cambios)
      .eq("id", p.id)
      .select("*")
      .single();
    setGuardando(false);
    if (e || !data) {
      setError("No pudimos guardar el pedido.");
      return false;
    }
    setP(data);
    setAviso(ok);
    await onGuardado();
    return true;
  }

  function enviarPago() {
    if (!puedeEnviar) return;
    window.open(linkWhatsapp(numero, mensaje), "_blank", "noopener");
    void guardar(
      {
        link_pago: p.link_pago,
        notas_internas: p.notas_internas,
        estado: "contactado",
        mensaje_pago_enviado_at: new Date().toISOString(),
      },
      "Mensaje abierto en WhatsApp. Pedido marcado como «Esperando pago».",
    );
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje);
      setAviso("Mensaje copiado.");
    } catch {
      setError("No pudimos copiar el mensaje.");
    }
  }

  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle>{p.contacto_nombre || "Pedido sin nombre"}</SheetTitle>
        <SheetDescription>
          {fechaCorta(p.fecha)} · {p.formato === "fisico" ? "Física" : "Digital"} · {etiquetaEstado(p.estado)}
        </SheetDescription>
      </SheetHeader>

      <section className="space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">WhatsApp: </span>
          {p.contacto_whatsapp || "—"}
        </p>
        {p.mensaje_pago_enviado_at && (
          <p className="text-muted-foreground">Link de pago enviado: {fechaCorta(p.mensaje_pago_enviado_at)}</p>
        )}
        {p.pagado_at && <p className="text-muted-foreground">Pagado: {fechaCorta(p.pagado_at)}</p>}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Experiencias elegidas</h3>
        <ul className="divide-y divide-border rounded-md border border-border text-sm">
          {itemsDe(p).map((i, n) => (
            <li key={i.id ?? n} className="flex justify-between gap-3 px-3 py-2">
              <span>
                {i.nombre ?? "Experiencia"}
                {i.categoria && <span className="text-muted-foreground"> · {i.categoria}</span>}
              </span>
              <span>{formatearPrecio(Number(i.precio ?? 0))}</span>
            </li>
          ))}
          <li className="flex justify-between px-3 py-2 font-medium">
            <span>Total</span>
            <span>{formatearPrecio(Number(p.precio_total))}</span>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Datos del regalo</h3>
        {p.datos_completados_at ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-md border border-border p-3 text-sm">
            {(
              [
                ["Para", p.agasajado_nombre],
                ["WhatsApp", p.agasajado_whatsapp],
                ["Ocasión", p.ocasion],
                ["Dedicatoria", p.dedicatoria],
                ["De parte de", p.remitente_firma],
                ["Fecha", p.fecha_regalo ? new Date(`${p.fecha_regalo}T00:00:00`).toLocaleDateString("es-AR") : null],
                ["Dirección", p.formato === "fisico" ? p.direccion_entrega : null],
                ["Completado", fechaCorta(p.datos_completados_at)],
              ] as [string, string | null][]
            )
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="whitespace-pre-wrap">{v}</dd>
                </div>
              ))}
          </dl>
        ) : (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Falta completar el formulario.</p>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Canjes</h3>
        <ul className="divide-y divide-border rounded-md border border-border text-sm">
          {itemsDe(p).map((i, n) => {
            const canjes = (p.canjes ?? {}) as Record<string, string>;
            const fecha = i.id ? canjes[i.id] : undefined;
            return (
              <li key={i.id ?? n} className="flex items-center gap-3 px-3 py-2">
                <Checkbox
                  id={`canje-${i.id ?? n}`}
                  checked={!!fecha}
                  disabled={!i.id || guardando}
                  onCheckedChange={(v) => {
                    if (!i.id) return;
                    const nuevo = { ...canjes };
                    if (v) nuevo[i.id] = new Date().toISOString();
                    else delete nuevo[i.id];
                    void guardar({ canjes: nuevo }, v ? "Experiencia marcada como canjeada." : "Canje desmarcado.");
                  }}
                />
                <Label htmlFor={`canje-${i.id ?? n}`} className="flex-1 font-normal">
                  {i.nombre ?? "Experiencia"}
                </Label>
                <span className="text-xs text-muted-foreground">{fecha ? `Canjeada ${fechaCorta(fecha)}` : "Canjeada"}</span>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted-foreground">Código de canje: <span className="font-mono">{p.codigo_canje}</span></p>
      </section>

      <PresentacionDigital p={p} plantilla={plantillaRegalo} origen={origen} guardando={guardando} onEnviado={() => void guardar({ regalo_enviado_at: new Date().toISOString() }, "Regalo abierto en WhatsApp.")} />

      <div className="space-y-2">
        <Label>Estado</Label>
        <Select
          value={p.estado}
          onValueChange={(v) => void guardar({ estado: v as EstadoPedido }, "Estado actualizado.")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map((e) => (
              <SelectItem key={e.valor} value={e.valor}>
                {e.etiqueta}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-pago">Link de pago</Label>
        <Input
          id="link-pago"
          placeholder="Pegá acá el link generado"
          value={p.link_pago ?? ""}
          onChange={(e) => setP({ ...p, link_pago: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas internas</Label>
        <Textarea
          id="notas"
          rows={3}
          value={p.notas_internas ?? ""}
          onChange={(e) => setP({ ...p, notas_internas: e.target.value })}
        />
      </div>

      <Button
        variant="outline"
        disabled={guardando}
        onClick={() =>
          void guardar(
            { link_pago: p.link_pago?.trim() || null, notas_internas: p.notas_internas?.trim() || null },
            "Cambios guardados.",
          )
        }
      >
        Guardar link y notas
      </Button>

      <section className="space-y-3 rounded-md border border-border p-3">
        <div className="space-y-2">
          <Label htmlFor="numero">Número para WhatsApp</Label>
          <Input id="numero" inputMode="numeric" value={numero} onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))} />
          <p className="text-xs text-muted-foreground">Formato 549 + área + número, sin 0 ni 15.</p>
        </div>
        <div className="space-y-1">
          <Label>Vista previa del mensaje</Label>
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 font-sans text-sm">{mensaje}</pre>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!puedeEnviar || guardando} onClick={enviarPago}>
            Enviar link de pago por WhatsApp
          </Button>
          <Button variant="outline" onClick={() => void copiar()}>
            Copiar mensaje
          </Button>
        </div>
        {!p.link_pago?.trim() && <p className="text-xs text-muted-foreground">Pegá el link de pago para poder enviarlo.</p>}
      </section>

      <Button
        variant="secondary"
        disabled={guardando || p.estado === "confirmado"}
        onClick={() =>
          void guardar({ estado: "confirmado", pagado_at: new Date().toISOString() }, "Pedido marcado como pagado.")
        }
      >
        Marcar como pagado
      </Button>

      {aviso && <p className="text-sm text-primary">{aviso}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function PresentacionDigital({
  p,
  plantilla,
  origen,
  guardando,
  onEnviado,
}: {
  p: Pedido;
  plantilla: string;
  origen: string;
  guardando: boolean;
  onEnviado: () => void;
}) {
  const tieneAgasajado = !!normalizarWhatsappAR(p.agasajado_whatsapp) && (p.agasajado_whatsapp ?? "").replace(/\D/g, "").length >= 8;
  const [dest, setDest] = useState<"agasajado" | "comprador">(tieneAgasajado ? "agasajado" : "comprador");
  const [datos, setDatos] = useState<{ info: RegaloOk; pres: Presentacion | null } | null>(null);
  const link = `${origen}/regalo/${p.token_regalo}`;
  const numero = normalizarWhatsappAR(dest === "agasajado" ? p.agasajado_whatsapp : p.contacto_whatsapp);
  const mensaje = armarMensaje(plantilla, {
    agasajado: p.agasajado_nombre ?? "",
    remitente: p.remitente_firma || p.contacto_nombre || "",
    nombre: p.contacto_nombre ?? "",
    link_regalo: link,
  });

  useEffect(() => {
    void Promise.all([getRegalo(p.token_regalo), getPresentacion()]).then(([info, pres]) => {
      if (info.estado === "ok") setDatos({ info, pres });
    });
  }, [p.token_regalo, p.canjes]);

  return (
    <section className="space-y-3 rounded-md border border-border p-3">
      <h3 className="text-sm font-medium">Presentación digital</h3>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <a href={link} target="_blank" rel="noreferrer">Ver presentación</a>
        </Button>
        {datos && <BotonPdf info={datos.info} presentacion={datos.pres} />}
      </div>
      <div className="space-y-2">
        <Label>Enviar a</Label>
        <Select value={dest} onValueChange={(v) => setDest(v as "agasajado" | "comprador")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tieneAgasajado && <SelectItem value="agasajado">Quien recibe ({p.agasajado_nombre}) · {p.agasajado_whatsapp}</SelectItem>}
            <SelectItem value="comprador">Quien compró ({p.contacto_nombre}) · {p.contacto_whatsapp}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Vista previa del mensaje</Label>
        <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 font-sans text-sm">{mensaje}</pre>
      </div>
      <Button
        disabled={guardando || numero.length < 12}
        onClick={() => {
          window.open(linkWhatsapp(numero, mensaje), "_blank", "noopener");
          onEnviado();
        }}
      >
        Enviar regalo por WhatsApp
      </Button>
      {p.regalo_enviado_at && <p className="text-xs text-muted-foreground">Regalo enviado: {fechaCorta(p.regalo_enviado_at)}</p>}
      {!p.datos_completados_at && <p className="text-xs text-muted-foreground">Ojo: todavía falta completar el formulario del regalo.</p>}
    </section>
  );
}

const EJEMPLO = {
  nombre: "Lucía",
  link_pago: "https://mpago.la/ejemplo",
  link_formulario: "https://cruzia.ar/gift-box/datos/ejemplo",
  nota_fisico: NOTA_FISICO,
  agasajado: "Martín",
  remitente: "Lucía",
  link_regalo: "https://cruzia.ar/regalo/ejemplo",
};

export function MensajesGiftbox() {
  const [pl, setPl] = useState<Plantillas | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    void getPlantillas().then(setPl);
  }, []);

  async function guardar() {
    if (!pl) return;
    setGuardando(true);
    const { error } = await supabase
      .from("configuracion_global")
      .update({ giftbox_plantilla_pago: pl.pago, giftbox_plantilla_regalo: pl.regalo })
      .eq("id", pl.id);
    setGuardando(false);
    setAviso(error ? "No pudimos guardar las plantillas." : "Plantillas guardadas.");
  }

  if (!pl) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  const bloques: { clave: "pago" | "regalo"; titulo: string }[] = [
    { clave: "pago", titulo: "Mensaje con link de pago" },
    { clave: "regalo", titulo: "Mensaje de regalo" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Variables disponibles</CardTitle>
          <CardDescription>Se reemplazan automáticamente al armar cada mensaje.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {VARIABLES_PLANTILLA.map((v) => (
            <Badge key={v} variant="secondary" className="font-mono normal-case tracking-normal">
              {v}
            </Badge>
          ))}
        </CardContent>
      </Card>
      {bloques.map((b) => (
        <Card key={b.clave}>
          <CardHeader>
            <CardTitle>{b.titulo}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Textarea rows={9} value={pl[b.clave]} onChange={(e) => setPl({ ...pl, [b.clave]: e.target.value })} />
            <div className="space-y-1">
              <Label>Vista previa (datos de ejemplo)</Label>
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 font-sans text-sm">
                {armarMensaje(pl[b.clave], EJEMPLO)}
              </pre>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex items-center gap-3">
        <Button disabled={guardando} onClick={() => void guardar()}>
          Guardar plantillas
        </Button>
        {aviso && <span className="text-sm text-muted-foreground">{aviso}</span>}
      </div>
    </div>
  );
}
