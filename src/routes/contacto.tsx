import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Instagram, Mail, Store, User } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePublicDirectory } from "@/components/public/public-directory-provider";
import { EMAIL_OLA, enviarLeadComercio, linkWhatsappOla } from "@/lib/formularios";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto | OLA!" },
      { name: "description", content: "Escribinos: sumá tu comercio a OLA! o mandanos tu consulta como usuario del Partido de la Costa." },
      { property: "og:title", content: "Contacto | OLA!" },
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
    const url = linkWhatsappOla(
      `Hola OLA!, quiero sumar mi comercio.\n\nLocal: ${payload.nombre_local}\nRubro: ${payload.rubro ?? "-"}\nLocalidad: ${payload.localidad ?? "-"}\nWhatsApp: ${payload.whatsapp}`,
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
    const url = `mailto:${EMAIL_OLA}?subject=${encodeURIComponent(`Consulta de ${usuario.nombre} desde OLA!`)}&body=${encodeURIComponent(cuerpo)}`;
    setLinkFinal(url);
    setEstado("ok");
    window.location.href = url;
  }

  return (
    <main>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-xs font-bold uppercase text-accent">Hablemos</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">Estamos a un clic de distancia.</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            { key: "comercio" as const, icon: Store, titulo: "Soy un Comercio", texto: "Quiero sumar mi negocio a AUNA" },
            { key: "usuario" as const, icon: User, titulo: "Soy un Usuario", texto: "Tengo una consulta o una sugerencia." },
          ]).map((opcion) => (
            <button
              key={opcion.key}
              type="button"
              onClick={() => elegir(opcion.key)}
              className={`rounded-3xl border p-6 text-left transition-colors ${perfil === opcion.key ? "border-secondary bg-card shadow-premium" : "border-border bg-card hover:border-secondary/60"}`}
            >
              <opcion.icon className={perfil === opcion.key ? "size-6 text-secondary" : "size-6 text-accent-foreground"} />
              <p className="mt-4 font-display text-xl font-bold text-primary">{opcion.titulo}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{opcion.texto}</p>
            </button>
          ))}
        </div>

        {perfil && estado === "ok" ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8">
            <h2 className="font-display text-2xl font-extrabold text-primary">
              {perfil === "comercio" ? "¡Listo! Abrimos WhatsApp" : "¡Listo! Abrimos tu correo"}
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {perfil === "comercio"
                ? "Guardamos tus datos y preparamos el mensaje para enviarnos. Si no se abrió solo, tocá el botón."
                : "Preparamos el mensaje con tus datos listo para enviar. Si no se abrió solo, tocá el botón."}
            </p>
            <Button asChild size="lg" className="mt-6">
              <a href={linkFinal} target={perfil === "comercio" ? "_blank" : undefined} rel="noreferrer">
                {perfil === "comercio" ? "Abrir WhatsApp de OLA!" : "Abrir mi correo"} <ArrowRight />
              </a>
            </Button>
          </div>
        ) : null}

        {perfil === "comercio" && estado !== "ok" ? (
          <form onSubmit={onSubmitComercio} className="mt-8 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
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
          <form onSubmit={onSubmitUsuario} className="mt-8 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
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

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <a href={`mailto:${EMAIL_OLA}`} className="rounded-3xl border border-border bg-card p-6 hover:border-secondary">
            <Mail className="text-secondary" />
            <p className="mt-5 text-xs font-bold uppercase text-muted-foreground">Email</p>
            <p className="mt-1 font-display text-lg font-bold text-primary">{EMAIL_OLA}</p>
          </a>
          <a href="https://www.instagram.com/somos_auna/" target="_blank" rel="noreferrer" className="rounded-3xl border border-border bg-card p-6 hover:border-secondary">
            <Instagram className="text-secondary" />
            <p className="mt-5 text-xs font-bold uppercase text-muted-foreground">Instagram</p>
            <p className="mt-1 font-display text-lg font-bold text-primary">@somos_auna</p>
          </a>
        </div>
      </section>
    </main>
  );
}
