import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Crown, Store, Ticket } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { enviarLeadComercio, linkWhatsappAuna } from "@/lib/formularios";
import type { Plan } from "@/lib/public-data";

export const Route = createFileRoute("/sumate-a-cruzia")({
  head: () => ({
    meta: [
      { title: "Sumate a Cruzia | Sumá tu comercio a Cruzia" },
      { name: "description", content: "Sumá tu comercio a Cruzia y conectá con quienes eligen el Partido de la Costa. Conocé los planes Básico, Pro y Premium." },
      { property: "og:title", content: "Sumate a Cruzia | Sumá tu comercio a Cruzia" },
      { property: "og:description", content: "Vidriera digital, cupones destacados y alto impacto para tu negocio en La Costa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function etiquetaPlan(plan: Plan) {
  if (plan.aparece_en_hero_banner) return { titulo: "Alto Impacto", icono: Crown };
  if (plan.tiene_modulo_promocion) return { titulo: "Cupones Destacados", icono: Ticket };
  return { titulo: "Vidriera Digital", icono: Store };
}

/** Beneficios leídos de los atributos del plan (nunca hardcodeados por nombre). */
function beneficiosPlan(plan: Plan) {
  const beneficios: string[] = [
    "Ficha completa con fotos, horarios, mapa y contacto directo",
  ];
  if (plan.aparece_en_grilla) beneficios.push("Presencia en la grilla de comercios, filtrable por localidad y rubro");
  if (plan.tiene_modulo_promocion) beneficios.push("Insignia destacada en la grilla, módulo de promoción con tu descuento y su vigencia");
  if (plan.max_cupones_activos > 0) beneficios.push(`Hasta ${plan.max_cupones_activos} promociones activas por mes`);
  if (plan.aparece_en_hero_banner) beneficios.push("Lugar exclusivo en el Top Slider de la portada");
  beneficios.push("Posicionamiento SEO y campañas de Google ADS");
  beneficios.push("Reporte mensual de activaciones e interés en tu negocio");
  return beneficios;
}

function Page() {
  const { data } = usePublicDirectory();
  const planes = [...data.planes].sort((a, b) => b.prioridad_orden - a.prioridad_orden);

  const [form, setForm] = useState({ nombre_local: "", rubro: "", localidad: "", whatsapp: "" });
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [linkWa, setLinkWa] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setEstado("enviando");
    const payload = {
      nombre_local: form.nombre_local.trim(),
      rubro: form.rubro || null,
      localidad: form.localidad || null,
      whatsapp: form.whatsapp.trim(),
    };
    const mensaje = `Hola Cruzia!, quiero sumar mi comercio a la app.\n\nLocal: ${payload.nombre_local}\nRubro: ${payload.rubro ?? "-"}\nLocalidad: ${payload.localidad ?? "-"}\nWhatsApp: ${payload.whatsapp}`;
    const url = linkWhatsappAuna(mensaje);
    try {
      await enviarLeadComercio(payload);
      setLinkWa(url);
      setEstado("ok");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setEstado("error");
    }
  }

  return (
    <main>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className="text-xs font-bold uppercase text-accent">Comercios de La Costa</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">Hacé que más personas descubran tu negocio.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/75 sm:text-lg">
            Impulsamos el encuentro entre los comercios que le dan vida a la Costa y las personas que la disfrutan. Cruzia es la red que consolida la oferta local para potenciar el comercio de nuestras localidades, ofreciendo siempre las mejores opciones de precios, eventos y experiencias exclusivas durante todo el año.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8"><a href="#sumarme">Quiero sumarme <ArrowRight /></a></Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-display text-3xl font-extrabold text-foreground">Tres formas de estar en Cruzia</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {planes.map((plan) => {
            const { titulo, icono: Icono } = etiquetaPlan(plan);
            return (
              <article key={plan.id} className={`flex flex-col rounded-3xl border border-border bg-card p-6${plan.aparece_en_hero_banner ? " shadow-premium border-secondary/40" : ""}`}>
                <Icono className={`size-6 ${plan.aparece_en_hero_banner ? "text-secondary" : "text-accent-foreground"}`} />
                <p className="mt-4 text-xs font-bold uppercase text-muted-foreground">Plan {plan.nombre}</p>
                <h3 className="mt-1 font-display text-2xl font-extrabold text-foreground">{titulo}</h3>
                <ul className="mt-5 flex-1 space-y-3">
                  {beneficiosPlan(plan).map((beneficio) => (
                    <li key={beneficio} className="flex gap-2 text-sm leading-6 text-foreground/80">
                      <Check className="mt-0.5 size-4 flex-none text-accent-foreground" />
                      <span>{beneficio}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 hover:brightness-90 hover:shadow-premium transition-all"><a href="#sumarme">Me interesa</a></Button>
              </article>
            );
          })}
        </div>
      </section>

      <section id="sumarme" className="bg-muted">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-foreground">Dejanos tus datos</h2>
            <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
              Sabemos que cada comercio es un mundo. Diseñamos campañas flexibles que se adaptan a tu presupuesto y objetivo, dejanos tu consulta y te enviamos una propuesta personalizada para tu negocio.
            </p>
          </div>
          {estado === "ok" ? (
            <div className="rounded-3xl bg-card p-8">
              <h3 className="font-display text-2xl font-extrabold text-foreground">¡Listo, {form.nombre_local}!</h3>
              <p className="mt-3 leading-7 text-muted-foreground">Guardamos tus datos y abrimos WhatsApp con el mensaje listo para enviar. Si no se abrió solo, tocá el botón:</p>
              <Button asChild size="lg" className="mt-6"><a href={linkWa} target="_blank" rel="noreferrer">Abrir WhatsApp de Cruzia <ArrowRight /></a></Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="rounded-3xl bg-card p-6 sm:p-8">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sl-nombre">Nombre del Local</Label>
                  <Input id="sl-nombre" required value={form.nombre_local} onChange={(e) => setForm({ ...form, nombre_local: e.target.value })} placeholder="Ej: Parrilla El Muelle" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sl-rubro">Rubro</Label>
                  <Select value={form.rubro} onValueChange={(value) => setForm({ ...form, rubro: value })}>
                    <SelectTrigger id="sl-rubro"><SelectValue placeholder="Elegí un rubro" /></SelectTrigger>
                    <SelectContent>{data.rubros.map((r) => <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sl-localidad">Localidad</Label>
                  <Select value={form.localidad} onValueChange={(value) => setForm({ ...form, localidad: value })}>
                    <SelectTrigger id="sl-localidad"><SelectValue placeholder="Elegí tu localidad" /></SelectTrigger>
                    <SelectContent>{data.localidades.map((l) => <SelectItem key={l.id} value={l.nombre}>{l.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sl-wa">WhatsApp</Label>
                  <Input id="sl-wa" required inputMode="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="Ej: 2246 55-1234" />
                </div>
                {estado === "error" ? <p className="text-sm font-semibold text-destructive">No pudimos enviar tus datos. Probá de nuevo en un momento.</p> : null}
                <Button type="submit" size="lg" disabled={estado === "enviando"}>
                  {estado === "enviando" ? "Enviando…" : "Enviar"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
