import { createFileRoute } from "@tanstack/react-router";

import { InfoPage } from "@/components/public/info-page";
import { LegalDocument } from "@/components/public/legal-document";
import { TERMINOS } from "@/lib/legal-content";

export const Route = createFileRoute("/terminos-promociones")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones | Cruzia" },
      {
        name: "description",
        content: "Términos y condiciones de uso de Cruzia, sus promociones y sus cupones.",
      },
      { property: "og:title", content: "Términos y Condiciones | Cruzia" },
      {
        property: "og:description",
        content: "Condiciones de uso del sitio y de los beneficios Cruzia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <InfoPage
      eyebrow="Información legal"
      title="Términos y Condiciones"
      intro="Las reglas para usar Cruzia, sus promociones y sus cupones."
    >
      <LegalDocument documento={TERMINOS} />
    </InfoPage>
  );
}
