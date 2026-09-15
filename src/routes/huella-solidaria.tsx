import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Hand, Heart, HeartHandshake, Sparkles, Users } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { enviarPostulacionSolidaria, fasesSolidariasOptions, type FaseSolidaria } from "@/lib/formularios";

export const Route = createFileRoute("/huella-solidaria")({
  head: () => ({
    meta: [
      { title: "Huella Solidaria | OLA!" },
      { name: "description", content: "Historias, causas y acciones solidarias de la comunidad del Partido de la Costa. Postulá tu causa y sumate a la próxima ola." },
      { property: "og:title", content: "Huella Solidaria | OLA!" },
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
        <img key={foto} src={foto} alt={`Foto de ${fase.titulo}`} loading="lazy" className="h-28 w-40 flex-none rounded-2xl object-cover" />
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
        <h1 className="mt-6 font-display text-3xl font-extrabold text-primary">Gracias, {form.nombre.split(" ")[0]}.</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Recibimos tu postulación por <strong className="text-primary">{form.causa}</strong>. La vamos a leer con atención y, si avanzamos, te escribimos para conocernos.
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
      <section className="bg-muted">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-28 md:grid-cols-[1.2fr_1fr] md:items-end lg:px-8">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-secondary"><Heart className="size-4" /> Huella Solidaria</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] text-primary sm:text-5xl">
              Antes que una red de beneficios, somos vecinos de La Costa.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/80">
              En AUNA creemos que el éxito comercial no sirve si no empuja a la comunidad. Por eso, cada año destinamos un porcentaje de nuestros ingresos a acompañar proyectos e instituciones del Partido de la Costa. Es nuestra forma de devolver la confianza recibida y asegurarnos de que el crecimiento de la plataforma impulse también la vida cotidiana de nuestros barrios.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            {[
              { icon: Users, titulo: "Cerca", texto: "Cuidando a nuestra comunidad" },
              { icon: Hand, titulo: "Concreto", texto: "Acciones con resultados reales" },
              { icon: Sparkles, titulo: "Compartido", texto: "Vecinos y comercios trabajando juntos." },
            ].map((item) => (
              <div key={item.titulo} className="rounded-3xl bg-card p-5">
                <item.icon className="size-5 text-secondary" />
                <p className="mt-3 font-display text-lg font-bold text-primary">{item.titulo}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {!isLoading && (actual || historial.length > 0) ? (
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          {actual ? (
            <>
              <h2 className="font-display text-2xl font-extrabold text-primary">Nuestro próximo aporte</h2>
              <div className="mt-8 rounded-3xl border-2 border-secondary/40 bg-card p-6 shadow-premium sm:p-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase text-secondary-foreground">
                  <Sparkles className="size-3.5" /> En marcha
                </span>
                <h3 className="mt-4 font-display text-2xl font-extrabold text-primary">{actual.titulo}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="size-4" /> {formatearFecha(actual.fecha)}</p>
                {actual.descripcion ? <p className="mt-4 leading-7 text-foreground/80">{actual.descripcion}</p> : null}
                <Fotos fase={actual} />
              </div>
            </>
          ) : null}

          {historial.length > 0 ? (
            <div className={actual ? "mt-14" : ""}>
              <h2 className="font-display text-2xl font-extrabold text-primary">Proyectos que acompañamos</h2>
              <ol className="mt-6 space-y-8 border-l-2 border-border pl-6">
                {historial.map((fase) => (
                  <li key={fase.id} className="relative">
                    <span className="absolute -left-[31px] top-2 size-3 rounded-full bg-accent ring-4 ring-background" />
                    <p className="text-xs font-bold uppercase text-muted-foreground">{formatearFecha(fase.fecha)}</p>
                    <h4 className="mt-1 font-display text-xl font-bold text-primary">{fase.titulo}</h4>
                    {fase.descripcion ? <p className="mt-2 leading-7 text-muted-foreground">{fase.descripcion}</p> : null}
                    <Fotos fase={fase} />
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Postulación */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-accent">Postulá una causa</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl">¿Conocés alguna iniciativa solidaria que necesite un empujón?</h2>
            <p className="mt-5 max-w-lg leading-7 text-primary-foreground/75">
              El Partido de la Costa es grande y queremos llegar a todos lados. Proponela acá.
            </p>
          </div>
          <form onSubmit={onSubmit} className="rounded-3xl bg-card p-6 text-foreground sm:p-8">
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
          </form>
        </div>
      </section>
    </main>
  );
}
