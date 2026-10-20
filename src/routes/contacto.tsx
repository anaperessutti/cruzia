import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Instagram, Mail, Store, User } from "lucide-react";
import { useState, type FormEvent } from "react";

import { PageIntro } from "@/components/public/page-intro";
import { Reveal, RevealGroup } from "@/components/public/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { EMAIL_AUNA, enviarLeadComercio, linkWhatsappAuna } from "@/lib/formularios";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto | Cruzia" },
      { name: "description", content: "Escribinos: sumá tu comercio a Cruzia o mandanos tu consulta como usuario del Partido de la Costa." },
      { property: "og:title", content: "Contacto | Cruzia" },
      { property: "og:description", content: "Estamos para escucharte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

type Perfil = "comercio" | "usuario";

function Page() {
  const { data } = usePublicDirectory();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [linkFinal, setLinkFinal] = useState("");

  const [comercio, setComercio] = useState({ nombre_local: "", rubro: "", localidad: "", whatsapp: "" });
  const [usuario, setUsuario] = useState({ nombre: "", email: "", localidad: "", mensaje: "" });

  function elegir(nuevo: Perfil) {
    setPerfil(nuevo);
    setEstado("idle");
  }

  async function onSubmitComercio(event: FormEvent) {
    event.preventDefault();
    setEstado("enviando");
    const payload = {
      nombre_local: comercio.nombre_local.trim(),
      rubro: comercio.rubro || null,
      localidad: comercio.localidad || null,
      whatsapp: comercio.whatsapp.trim(),
    };
    const url = linkWhatsappAuna(
      `Hola Cruzia, quiero sumar mi comercio.\n\nLocal: ${payload.nombre_local}\nRubro: ${payload.rubro ?? "-"}\nLocalidad: ${payload.localidad ?? "-"}\nWhatsApp: ${payload.whatsapp}`,
    );
    try {
      await enviarLeadComercio(payload);
      setLinkFinal(url);
      setEstado("ok");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setEstado("error");
    }
  }

  function onSubmitUsuario(event: FormEvent) {
    event.preventDefault();
    const cuerpo = `Nombre: ${usuario.nombre}\nEmail: ${usuario.email}\nLocalidad: ${usuario.localidad || "-"}\n\n${usuario.mensaje}`;
    const url = `mailto:${EMAIL_AUNA}?subject=${encodeURIComponent(`Consulta de ${usuario.nombre} desde Cruzia`)}&body=${encodeURIComponent(cuerpo)}`;
    setLinkFinal(url);
    setEstado("ok");
    window.location.href = url;
  }

  return (
    <main>
      <PageIntro rotulo="Hablemos" titulo="Estamos a un clic de distancia." negrita="un clic" />

      <section className="relative mx-auto -mt-12 max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <Reveal><div role="tablist" aria-label="¿Quién sos?" className="glass grid grid-cols-2 gap-1 rounded-full p-1.5">
          {([
            { key: "comercio" as const, icon: Store, titulo: "Soy un Comercio", texto: "Quiero sumar mi negocio a Cruzia" },
            { key: "usuario" as const, icon: User, titulo: "Soy un Usuario", texto: "Tengo una consulta o una sugerencia." },
          ]).map((opcion) => (
            <button
              key={opcion.key}
              type="button"
              onClick={() => elegir(opcion.key)}
              role="tab"
              aria-selected={perfil === opcion.key}
              title={opcion.texto}
              className={`flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors duration-300 ${perfil === opcion.key ? "bg-foreground text-background" : "bg-card/60 text-foreground hover:bg-card"}`}
            >
              <opcion.icon className="size-4" />
              {opcion.titulo}
            </button>
          ))}
        </div></Reveal>

        {perfil && estado === "ok" ? (
          <div className="mt-8 glass rounded-[32px] p-8">
            <h2 className="font-display text-2xl font-extrabold text-foreground">
              {perfil === "comercio" ? "¡Listo! Abrimos WhatsApp" : "¡Listo! Abrimos tu correo"}
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {perfil === "comercio"
                ? "Guardamos tus datos y preparamos el mensaje para enviarnos. Si no se abrió solo, tocá el botón."
                : "Preparamos el mensaje con tus datos listo para enviar. Si no se abrió solo, tocá el botón."}
            </p>
            <Button asChild size="lg" className="mt-6">
              <a href={linkFinal} target={perfil === "comercio" ? "_blank" : undefined} rel="noreferrer">
                {perfil === "comercio" ? "Abrir WhatsApp de Cruzia" : "Abrir mi correo"} <ArrowRight />
              </a>
            </Button>
          </div>
        ) : null}

        {perfil === "comercio" && estado !== "ok" ? (
          <form onSubmit={onSubmitComercio} className="mt-8 grid gap-4 glass rounded-[32px] p-6 sm:p-8">
            <div className="grid gap-2">
              <Label htmlFor="ct-local">Nombre del local</Label>
              <Input id="ct-local" required value={comercio.nombre_local} onChange={(e) => setComercio({ ...comercio, nombre_local: e.target.value })} placeholder="Ej: Panadería La Ribera" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ct-rubro">Rubro</Label>
              <Select value={comercio.rubro} onValueChange={(value) => setComercio({ ...comercio, rubro: value })}>
                <SelectTrigger id="ct-rubro"><SelectValue placeholder="Elegí un rubro" /></SelectTrigger>
                <SelectContent>{data.rubros.map((r) => <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ct-loc-c">Localidad</Label>
              <Select value={comercio.localidad} onValueChange={(value) => setComercio({ ...comercio, localidad: value })}>
                <SelectTrigger id="ct-loc-c"><SelectValue placeholder="Elegí tu localidad" /></SelectTrigger>
                <SelectContent>{data.localidades.map((l) => <SelectItem key={l.id} value={l.nombre}>{l.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ct-wa">WhatsApp</Label>
              <Input id="ct-wa" required inputMode="tel" value={comercio.whatsapp} onChange={(e) => setComercio({ ...comercio, whatsapp: e.target.value })} placeholder="Ej: 2246 55-1234" />
            </div>
            {estado === "error" ? <p className="text-sm font-semibold text-destructive">No pudimos enviar tus datos. Probá de nuevo en un momento.</p> : null}
            <Button type="submit" size="lg" disabled={estado === "enviando"}>{estado === "enviando" ? "Enviando…" : "Enviar"}</Button>
          </form>
        ) : null}

        {perfil === "usuario" && estado !== "ok" ? (
          <form onSubmit={onSubmitUsuario} className="mt-8 grid gap-4 glass rounded-[32px] p-6 sm:p-8">
            <div className="grid gap-2">
              <Label htmlFor="ct-nombre">Tu nombre</Label>
              <Input id="ct-nombre" required value={usuario.nombre} onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })} placeholder="Nombre y apellido" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ct-email">Tu email</Label>
              <Input id="ct-email" type="email" required value={usuario.email} onChange={(e) => setUsuario({ ...usuario, email: e.target.value })} placeholder="nombre@email.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ct-loc-u">Localidad</Label>
              <Select value={usuario.localidad} onValueChange={(value) => setUsuario({ ...usuario, localidad: value })}>
                <SelectTrigger id="ct-loc-u"><SelectValue placeholder="Elegí tu localidad" /></SelectTrigger>
                <SelectContent>{data.localidades.map((l) => <SelectItem key={l.id} value={l.nombre}>{l.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ct-msg">Tu mensaje</Label>
              <Textarea id="ct-msg" rows={5} required value={usuario.mensaje} onChange={(e) => setUsuario({ ...usuario, mensaje: e.target.value })} placeholder="Contanos en qué podemos ayudarte." />
            </div>
            <Button type="submit" size="lg">Enviar</Button>
          </form>
        ) : null}

        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-2">
          <a href={`mailto:${EMAIL_AUNA}`} className="glass rounded-[32px] p-6 transition-transform hover:-translate-y-1">
            <span className="grid size-10 place-items-center rounded-full bg-foreground text-background"><Mail className="size-4" /></span>
            <p className="mt-5 text-xs font-bold uppercase text-muted-foreground">Email</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">{EMAIL_AUNA}</p>
          </a>
          <a href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer" className="glass rounded-[32px] p-6 transition-transform hover:-translate-y-1">
            <span className="grid size-10 place-items-center rounded-full bg-foreground text-background"><Instagram className="size-4" /></span>
            <p className="mt-5 text-xs font-bold uppercase text-muted-foreground">Instagram</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">@cruzia.ar</p>
          </a>
        </RevealGroup>
      </section>
    </main>
  );
}
