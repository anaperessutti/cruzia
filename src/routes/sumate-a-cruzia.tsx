import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Crown, Store, Ticket } from "lucide-react";
import { useState, type FormEvent } from "react";

import { PageIntro } from "@/components/public/page-intro";
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
      <PageIntro rotulo="Comercios de La Costa" titulo="Hacé que más personas descubran tu negocio." negrita="descubran" intro={<>
            Impulsamos el encuentro entre los comercios que le dan vida a la Costa y las personas que la disfrutan. Cruzia es la red que consolida la oferta local para potenciar el comercio de nuestras localidades, ofreciendo siempre las mejores opciones de precios, eventos y experiencias exclusivas durante todo el año.
        </>}>
        <a href="#sumarme" className="group mt-8 inline-flex items-center gap-3 rounded-full bg-foreground py-1.5 pl-5 pr-1.5 text-sm font-semibold text-background">Quiero sumarme <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-1"><ArrowRight className="size-4" /></span></a>
      </PageIntro>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <h2 className="text-subtitulo text-foreground"><span className="font-light">Tres formas de estar en </span><span className="font-bold">Cruzia</span></h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3 md:items-stretch"> 
          {planes.map((plan, index) => {
            const { titulo, icono: Icono } = etiquetaPlan(plan);
            // Tres fichas iguales; la del medio (recomendada) lleva etiqueta y un resaltado sutil.
            const recomendado = index === 1;
            return (
              <div key={plan.id} className="flex flex-col">
              <p className={`mb-3 flex h-4 items-center justify-center text-sobretitulo font-medium text-foreground ${recomendado ? "" : "max-md:hidden"}`}>{recomendado ? "Recomendado" : null}</p>
              <article className={`glass relative flex flex-1 flex-col rounded-[32px] p-6 sm:p-7 ${recomendado ? "!border-[1.5px] !border-primary-foreground/80 shadow-[0_28px_60px_-24px_rgb(0_0_0/0.35)]" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-card/70 px-3 py-1 text-pill text-foreground">Plan {plan.nombre}</span>
                  <span className={`grid size-11 place-items-center rounded-full ${plan.aparece_en_hero_banner ? "bg-primary text-primary-foreground" : "bg-foreground text-background"}`}><Icono className="size-5" /></span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-foreground">{titulo}</h3>
                <ul className="mt-5 flex-1 space-y-3">
                  {beneficiosPlan(plan).map((beneficio) => (
                    <li key={beneficio} className="flex gap-2 text-sm leading-6 text-foreground/80">
                      <Check className="mt-0.5 size-4 flex-none text-accent-foreground" />
                      <span>{beneficio}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-6 rounded-full bg-foreground text-background hover:bg-foreground/90"><a href="#sumarme">Me interesa</a></Button>
              </article>
              </div>
            );
          })}
        </div>
      </section>

      <section id="sumarme" className="scroll-mt-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-subtitulo !font-normal text-foreground">Dejanos tus datos</h2>
            <p className="mt-4 max-w-lg text-cuerpo text-foreground/80">
              Sabemos que cada comercio es un mundo. Diseñamos campañas flexibles que se adaptan a tu presupuesto y objetivo, dejanos tu consulta y te enviamos una propuesta personalizada para tu negocio.
            </p>
          </div>
          {estado === "ok" ? (
            <div className="glass rounded-[32px] p-8">
              <h3 className="font-display text-2xl font-extrabold text-foreground">¡Listo, {form.nombre_local}!</h3>
              <p className="mt-3 leading-7 text-muted-foreground">Guardamos tus datos y abrimos WhatsApp con el mensaje listo para enviar. Si no se abrió solo, tocá el botón:</p>
              <Button asChild size="lg" className="mt-6"><a href={linkWa} target="_blank" rel="noreferrer">Abrir WhatsApp de Cruzia <ArrowRight /></a></Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="glass rounded-[32px] p-6 sm:p-8">
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
