import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { InfoPage } from "@/components/public/info-page";
import { EMAIL_AUNA } from "@/lib/formularios";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad | Cruzia" },
      { name: "description", content: "Qué datos guarda Cruzia, para qué los usa y cómo podés ejercer tus derechos." },
      { property: "og:title", content: "Política de Privacidad | Cruzia" },
      { property: "og:description", content: "Información clara sobre privacidad en Cruzia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mt-10 first:mt-0">
      <h2 className="font-display text-xl font-bold text-foreground">{titulo}</h2>
      <div className="mt-3 space-y-3 leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}

function Lista({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function Page() {
  return (
    <InfoPage
      eyebrow="Información legal"
      title="Política de Privacidad"
      intro="Cuidamos tus datos y te contamos, sin vueltas, qué guardamos, para qué y cómo podés pedirnos que los corrijamos o los borremos."
    >
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-14">
        <p className="text-sm text-muted-foreground">Última actualización: 29 de octubre de 2026</p>

        <div className="mt-8">
          <Bloque titulo="Quiénes somos">
            <p>
              Cruzia es un proyecto en desarrollo con base en Santa Teresita, Partido de la Costa, provincia de Buenos Aires. Somos quienes decidimos cómo se usan los datos que se describen en esta página.
            </p>
            <p>
              Para cualquier consulta sobre tus datos escribinos a{" "}
              <a className="font-semibold text-foreground underline underline-offset-4" href={`mailto:${EMAIL_AUNA}`}>{EMAIL_AUNA}</a>.
            </p>
          </Bloque>

          <Bloque titulo="Qué datos juntamos y para qué">
            <p>Para mirar comercios y cupones no necesitás crear una cuenta ni darnos tus datos. Solo guardamos lo que hace falta en cada caso:</p>
            <Lista
              items={[
                <>
                  <strong className="text-foreground">Al navegar.</strong> Guardamos en tu navegador un código al azar que identifica a tu celular, sin tu nombre ni datos personales. Sirve para respetar los plazos de cada cupón y para medir cuántas personas ven cada comercio.
                </>,
                <>
                  <strong className="text-foreground">Al activar un cupón en el local.</strong> Registramos la activación junto con ese código, para que cada promoción se use según sus plazos. La cámara se usa solo para leer el QR del local: no guardamos fotos ni videos.
                </>,
                <>
                  <strong className="text-foreground">Al reservar por WhatsApp.</strong> Registramos el toque en el botón (con el mismo código del celular) y se abre WhatsApp con el comercio. Lo que escribas desde ahí lo recibe el comercio, y WhatsApp se rige por sus propias condiciones.
                </>,
                <>
                  <strong className="text-foreground">Tu ubicación.</strong> Si le das permiso a tu navegador, la usamos en ese momento para sugerirte la localidad más cercana. Si no la das, la app funciona igual y elegís la localidad a mano.
                </>,
                <>
                  <strong className="text-foreground">Si sos comercio.</strong> Cuando completás el formulario para sumarte, guardamos el nombre del local, el rubro, la localidad y tu WhatsApp, para escribirte con una propuesta.
                </>,
                <>
                  <strong className="text-foreground">Si postulás una causa solidaria.</strong> Guardamos tu nombre, el nombre de la causa, la localidad y lo que nos cuentes sobre ella, para evaluarla y, si avanzamos, contactarte.
                </>,
                <>
                  <strong className="text-foreground">Si nos escribís.</strong> Si nos mandás una consulta por correo, usamos tu nombre, tu email y tu mensaje solo para responderte.
                </>,
              ]}
            />
          </Bloque>

          <Bloque titulo="Gift Box">
            <p>
              Gift Box todavía no está disponible para el público. Cuando lo esté, para preparar y entregar cada regalo vamos a guardar el nombre y el WhatsApp de quien compra y, de la persona que lo recibe, el nombre, el WhatsApp (si lo indicás), el mensaje, la fecha y la dirección de entrega. Solo los usamos para preparar y entregar ese regalo.
            </p>
          </Bloque>

          <Bloque titulo="Con quién compartimos tus datos">
            <Lista
              items={[
                <>
                  <strong className="text-foreground">Servicios técnicos.</strong> Usamos proveedores de infraestructura en la nube para alojar la web y la base de datos (por ejemplo, Supabase y Lovable). Es posible que sus servidores estén fuera de la Argentina.
                </>,
                <>
                  <strong className="text-foreground">Comercios.</strong> Les enviamos reportes con cantidades (por ejemplo, cuántas personas vieron su ficha o activaron un cupón), sin datos que te identifiquen. Lo que vos les escribas por WhatsApp lo ven ellos directamente.
                </>,
                <>
                  <strong className="text-foreground">Autoridades.</strong> Solo si una ley o una orden judicial nos lo exigen.
                </>,
              ]}
            />
            <p>No vendemos tus datos.</p>
          </Bloque>

          <Bloque titulo="Cuánto tiempo los guardamos">
            <p>
              Guardamos los datos mientras sean necesarios para el fin con el que los pedimos, o hasta que nos pidas borrarlos. Las mediciones de uso se guardan sin tu nombre.
            </p>
            <p>
              El código del celular vive en tu navegador: si borrás los datos del navegador, se genera uno nuevo.
            </p>
          </Bloque>

          <Bloque titulo="Cómo los cuidamos">
            <p>
              Los datos que dejás en nuestros formularios solo pueden leerlos las personas autorizadas del equipo de Cruzia. Tomamos medidas razonables para protegerlos, aunque ningún sistema en internet es infalible.
            </p>
          </Bloque>

          <Bloque titulo="Tus derechos">
            <p>
              Podés pedirnos acceder a tus datos, corregirlos, actualizarlos o eliminarlos. Escribinos a{" "}
              <a className="font-semibold text-foreground underline underline-offset-4" href={`mailto:${EMAIL_AUNA}`}>{EMAIL_AUNA}</a>{" "}
              contándonos qué necesitás y te respondemos dentro de los plazos que fija la ley.
            </p>
            <p>
              El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326.
            </p>
            <p>
              La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
            </p>
          </Bloque>

          <Bloque titulo="Menores de edad">
            <p>Si sos menor de edad, usá Cruzia con el acompañamiento de una persona adulta.</p>
          </Bloque>

          <Bloque titulo="Cambios en esta política">
            <p>
              Si cambiamos algo importante, actualizamos esta página y la fecha de arriba. Te recomendamos pasar de vez en cuando.
            </p>
          </Bloque>
        </div>
      </section>
    </InfoPage>
  );
}
