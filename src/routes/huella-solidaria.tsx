import { useQuery } from "@tanstack/react-query";
import { optimizarImagen } from "@/lib/imagen";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Hand, Heart, HeartHandshake, Sparkles, Users } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { CardReveal, Reveal, RevealGroup, Secuencia, SplitWords } from "@/components/public/motion";
import { enviarPostulacionSolidaria, fasesSolidariasOptions, type FaseSolidaria } from "@/lib/formularios";

export const Route = createFileRoute("/huella-solidaria")({
  head: () => ({
    meta: [
      { title: "Huella Solidaria | Cruzia" },
      { name: "description", content: "Historias, causas y acciones solidarias de la comunidad del Partido de la Costa. Postulá tu causa y acompañá la próxima acción." },
      { property: "og:title", content: "Huella Solidaria | Cruzia" },
      { property: "og:description", content: "Pequeñas acciones que dejan una gran huella en La Costa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function formatearFecha(fecha: string) {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

function Fotos({ fase }: { fase: FaseSolidaria }) {
  if (!fase.fotos?.length) return null;
  return (
    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
      {fase.fotos.map((foto) => (
        <img key={foto} src={optimizarImagen(foto)} alt={`Foto de ${fase.titulo}`} loading="lazy" decoding="async" width={176} height={128} className="h-32 w-44 flex-none rounded-[28px_12px_28px_12px] object-cover shadow-warm" />
      ))}
    </div>
  );
}

function Page() {
  const { data } = usePublicDirectory();
  const { data: fases = [], isLoading } = useQuery(fasesSolidariasOptions);
  const actual = fases.find((fase) => fase.tipo === "actual");
  const historial = fases.filter((fase) => fase.tipo !== "actual");

  const [form, setForm] = useState({ nombre: "", causa: "", localidad: "", descripcion: "" });
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setEstado("enviando");
    try {
      await enviarPostulacionSolidaria({
        nombre: form.nombre.trim(),
        causa: form.causa.trim(),
        localidad: form.localidad.trim() || null,
        descripcion: form.descripcion.trim() || null,
      });
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
        <HeartHandshake className="size-12 text-secondary" />
        <h1 className="mt-6 font-display text-3xl font-extrabold text-foreground">Gracias, {form.nombre.split(" ")[0]}.</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Recibimos tu postulación por <strong className="text-foreground">{form.causa}</strong>. La vamos a leer con atención y, si avanzamos, te escribimos para conocernos.
        </p>
        <Button className="mt-8" variant="outline" onClick={() => { setForm({ nombre: "", causa: "", localidad: "", descripcion: "" }); setEstado("idle"); }}>
          Postular otra causa
        </Button>
      </main>
    );
  }

  return (
    <main>
      {/* Manifiesto */}
      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 md:grid-cols-[1.2fr_1fr] md:items-end lg:px-8">
          <Secuencia hero>
            <p data-m-seq="eyebrow" className="flex items-center gap-2 text-sobretitulo font-bold text-secondary"><Heart className="size-4" /> Huella Solidaria</p>
            <SplitWords as="h1" enSecuencia className="mt-5 max-w-3xl text-titulo text-foreground" text="Antes que una red de beneficios, somos vecinos de La Costa." />
            <p data-m-seq="desc" className="mt-6 max-w-2xl text-cuerpo text-foreground/80">
              Somos parte de estos barrios y queremos crecer con ellos. Por eso acompañamos iniciativas e instituciones del Partido de la Costa que cuidan, reúnen y hacen más linda la vida de nuestros vecinos. Es nuestra manera de devolver un poco de todo lo que esta comunidad nos da.
            </p>
          </Secuencia>
          <RevealGroup trasHero className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            {[
              { icon: Users, titulo: "Cerca", texto: "Cuidando a nuestra comunidad" },
              { icon: Hand, titulo: "Concreto", texto: "Acciones con resultados reales" },
              { icon: Sparkles, titulo: "Compartido", texto: "Vecinos y comercios trabajando juntos." },
            ].map((item) => (
               <div key={item.titulo} className="glass rounded-[28px] p-5">
                <span className="grid size-10 place-items-center rounded-full bg-foreground text-background"><item.icon className="size-4" /></span>
                <p className="mt-3 font-display text-lg font-bold text-foreground">{item.titulo}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.texto}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Timeline */}
      {!isLoading && (actual || historial.length > 0) ? (
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          {actual ? (
            <Reveal>
              <h2 className="font-display text-[28px] tracking-[-0.02em] text-foreground"><span className="font-light">Nuestro próximo </span><span className="font-bold">aporte</span></h2>
              <div className="glass mt-8 rounded-[32px] p-6 shadow-glow-pro sm:p-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase text-secondary-foreground">
                  <Sparkles className="size-3.5" /> En marcha
                </span>
                <h3 className="mt-4 font-display text-2xl font-extrabold text-foreground">{actual.titulo}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="size-4" /> {formatearFecha(actual.fecha)}</p>
                {actual.descripcion ? <p className="mt-4 leading-7 text-foreground/80">{actual.descripcion}</p> : null}
                <Fotos fase={actual} />
              </div>
            </Reveal>
          ) : null}

          {historial.length > 0 ? (
            <div className={actual ? "mt-14" : ""}>
              <Reveal><h2 className="font-display text-[28px] tracking-[-0.02em] text-foreground"><span className="font-light">Proyectos que </span><span className="font-bold">acompañamos</span></h2></Reveal>
              <RevealGroup as="ol" className="relative mt-8 space-y-6 pl-8 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-[2px] before:rounded-full before:bg-linear-to-b before:from-primary before:via-glow-amber before:to-transparent">
                {historial.map((fase) => (
                  <li key={fase.id} className="glass relative rounded-[28px] p-5 sm:p-6">
                    <span className="absolute -left-[31px] top-7 size-3.5 rounded-full bg-primary ring-4 ring-background" />
                    <p className="text-xs font-bold uppercase text-muted-foreground">{formatearFecha(fase.fecha)}</p>
                    <h4 className="mt-1 font-display text-xl font-bold text-foreground">{fase.titulo}</h4>
                    {fase.descripcion ? <p className="mt-2 leading-7 text-muted-foreground">{fase.descripcion}</p> : null}
                    <Fotos fase={fase} />
                  </li>
                ))}
              </RevealGroup>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Postulación */}
       <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-[1.2fr_1fr] lg:px-8">
          <Reveal>
             <p className="text-sobretitulo font-bold text-secondary">Postulá una causa</p>
             <h2 className="mt-4 text-subtitulo text-foreground">¿Conocés alguna iniciativa solidaria que necesite un empujón?</h2>
             <p className="mt-5 max-w-lg text-cuerpo text-foreground/80">
              El Partido de la Costa es grande y queremos llegar a todos lados. Proponela acá.
            </p>
          </Reveal>
          <Reveal><form onSubmit={onSubmit} className="glass rounded-[32px] p-6 text-foreground sm:p-8">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hs-nombre">Tu Nombre</Label>
                <Input id="hs-nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre y apellido" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hs-causa">Nombre de la Causa</Label>
                <Input id="hs-causa" required value={form.causa} onChange={(e) => setForm({ ...form, causa: e.target.value })} placeholder="Ej: Merendero Las Gaviotas" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hs-localidad">Localidad</Label>
                <input
                  id="hs-localidad"
                  list="hs-localidades"
                  value={form.localidad}
                  onChange={(e) => setForm({ ...form, localidad: e.target.value })}
                  placeholder="Ej: Santa Teresita"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                />
                <datalist id="hs-localidades">
                  {data.localidades.map((loc) => <option key={loc.id} value={loc.nombre} />)}
                </datalist>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hs-desc">Contanos brevemente qué necesitan</Label>
                <Textarea id="hs-desc" rows={5} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="¿Qué está pasando y cómo se puede ayudar?" />
              </div>
              {estado === "error" ? <p className="text-sm font-semibold text-destructive">No pudimos enviar tu postulación. Probá de nuevo en un momento.</p> : null}
              <Button type="submit" size="lg" disabled={estado === "enviando"}>
                {estado === "enviando" ? "Enviando…" : "Enviar postulación"}
              </Button>
            </div>
          </form></Reveal>
        </div>
      </section>
    </main>
  );
}
