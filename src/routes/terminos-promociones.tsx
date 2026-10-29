import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { InfoPage } from "@/components/public/info-page";
import { EMAIL_AUNA } from "@/lib/formularios";

export const Route = createFileRoute("/terminos-promociones")({
  head: () => ({
    meta: [
      { title: "Términos de Promociones | Cruzia" },
      { name: "description", content: "Cómo funcionan los cupones y beneficios de Cruzia: vigencia, plazos de uso y qué hacer si algo no se cumple." },
      { property: "og:title", content: "Términos de Promociones | Cruzia" },
      { property: "og:description", content: "Las reglas simples para usar los cupones y beneficios de Cruzia." },
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
      title="Términos de Promociones"
      intro="Las reglas simples para usar los cupones y beneficios de Cruzia, y qué hacer si algo no sale como esperabas."
    >
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-14">
        <p className="text-sm text-muted-foreground">Última actualización: 29 de octubre de 2026</p>

        <div className="mt-8">
          <Bloque titulo="Qué es Cruzia">
            <p>
              Cruzia es una vidriera digital que reúne comercios y beneficios del Partido de la Costa. Somos mediadores y divulgadores: te mostramos las promociones, pero cada una la ofrece, la financia y la cumple el comercio que la publica.
            </p>
            <p>
              Cruzia no vende los productos o servicios de los comercios ni forma parte de lo que acordás con ellos en el local.
            </p>
          </Bloque>

          <Bloque titulo="Cómo se usa un cupón">
            <p>Cada promoción indica el comercio, la vigencia (desde y hasta qué fecha) y sus condiciones. Según la promoción, se usa de una de estas formas:</p>
            <Lista
              items={[
                <>
                  <strong className="text-foreground">En el local.</strong> Tocás “Activar”, escaneás con tu celular el QR del comercio y le mostrás la pantalla a la persona que te atiende.
                </>,
                <>
                  <strong className="text-foreground">Por WhatsApp.</strong> Te contactás con el comercio para reservar o consultar y coordinan ahí los detalles.
                </>,
              ]}
            />
            <p>El beneficio solo se puede usar dentro de las fechas de vigencia de la promoción.</p>
          </Bloque>

          <Bloque titulo="Plazos de uso por celular">
            <p>
              Como no hace falta crear una cuenta, los plazos de cada cupón se controlan por celular. Si una promoción tiene un tiempo de espera antes de volver a usarla, la app te avisa cuántos días faltan.
            </p>
            <p>
              Te pedimos usar los cupones de buena fe. Intentar saltear los plazos, por ejemplo borrando los datos del navegador, puede hacer que el comercio no te reconozca el beneficio.
            </p>
          </Bloque>

          <Bloque titulo="Las promociones se renuevan cada mes">
            <p>
              Los comercios activan sus promociones mes a mes. Una promoción que viste el mes pasado puede no estar disponible hoy.
            </p>
          </Bloque>

          <Bloque titulo="Condiciones de cada promoción">
            <p>
              Los detalles de cada beneficio (horarios, cupos, productos incluidos, topes) están en la ficha de la promoción y los define el comercio. Salvo que la promoción diga otra cosa, los beneficios no se acumulan con otras ofertas ni se canjean por dinero.
            </p>
          </Bloque>

          <Bloque titulo="Si algo no se cumple">
            <p>
              Si un comercio no respeta una promoción, escribinos a{" "}
              <a className="font-semibold text-foreground underline underline-offset-4" href={`mailto:${EMAIL_AUNA}`}>{EMAIL_AUNA}</a>{" "}
              contándonos el comercio, la promoción, la fecha y qué pasó. Vamos a hablar con el comercio para ayudarte a resolverlo.
            </p>
            <p>
              Lo que dice esta página no limita los derechos que te da la ley como consumidor.
            </p>
          </Bloque>

          <Bloque titulo="Gift Box">
            <p>
              Gift Box todavía no está disponible para comprar. Antes de habilitarla vamos a publicar acá sus condiciones completas: medios de pago, vigencia, reservas y reembolsos.
            </p>
            <p>
              Lo que ya podés saber: cada experiencia la brinda el comercio asociado, y si dentro del plazo no se puede reservar o consumir y se cumplieron las condiciones, se reembolsa el dinero.
            </p>
          </Bloque>

          <Bloque titulo="Uso de la web y cambios">
            <p>
              Te pedimos no manipular los QR, no usar la app para engañar a comercios y no copiar su contenido. Si detectamos un mal uso, podemos limitar el acceso.
            </p>
            <p>
              Podemos actualizar estos términos y modificar o retirar promociones cuando un comercio lo pida o deje de participar. Cuando cambiemos algo importante, actualizamos esta página y la fecha de arriba.
            </p>
          </Bloque>

          <Bloque titulo="Ley aplicable y jurisdicción">
            <p>
              Estos términos se rigen por las leyes de la República Argentina. Para cualquier controversia son competentes los Tribunales Ordinarios del Departamento Judicial de Dolores, Provincia de Buenos Aires, sin perjuicio del derecho que la ley le reconoce al consumidor de acudir a la justicia de su domicilio.
            </p>
          </Bloque>
        </div>
      </section>
    </InfoPage>
  );
}
