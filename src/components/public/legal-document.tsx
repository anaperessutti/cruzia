import { Fragment } from "react";

import type { DocumentoLegal } from "@/lib/legal-content";

const EMAIL = "somoscruzia@gmail.com";

/** Convierte el correo de contacto, cuando aparece en un texto, en un enlace mailto. */
function conEnlaces(texto: string) {
  const partes = texto.split(EMAIL);
  return partes.map((parte, indice) => (
    <Fragment key={indice}>
      {parte}
      {indice < partes.length - 1 ? (
        <a href={`mailto:${EMAIL}`} className="underline underline-offset-2 hover:opacity-70">
          {EMAIL}
        </a>
      ) : null}
    </Fragment>
  ));
}

/** Texto legal con secciones numeradas. Va como hijo directo de InfoPage. */
export function LegalDocument({ documento }: { documento: DocumentoLegal }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm text-muted-foreground">{documento.actualizacion}</p>
      {documento.secciones.map((seccion) => (
        <div key={seccion.titulo} className="mt-10">
          <h2 className="font-display text-xl font-semibold text-foreground">{seccion.titulo}</h2>
          {seccion.bloques.map((bloque, indice) =>
            bloque.tipo === "p" ? (
              <p key={indice} className="mt-3 leading-7 text-foreground/80">
                {conEnlaces(bloque.texto)}
              </p>
            ) : (
              <ul
                key={indice}
                className="mt-3 list-disc space-y-2 pl-5 leading-7 text-foreground/80"
              >
                {bloque.items.map((item) => (
                  <li key={item.texto}>
                    {item.destacado ? (
                      <strong className="font-semibold text-foreground">{item.destacado} </strong>
                    ) : null}
                    {conEnlaces(item.texto)}
                  </li>
                ))}
              </ul>
            ),
          )}
        </div>
      ))}
    </section>
  );
}
