import { createFileRoute } from "@tanstack/react-router";

import { InfoPage } from "@/components/public/info-page";
import { LegalDocument } from "@/components/public/legal-document";
import { PRIVACIDAD } from "@/lib/legal-content";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad | Cruzia" },
      {
        name: "description",
        content: "Cómo Cruzia recopila, usa y protege los datos personales.",
      },
      { property: "og:title", content: "Política de Privacidad | Cruzia" },
      { property: "og:description", content: "Información sobre privacidad en Cruzia." },
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
      title="Política de Privacidad"
      intro="Qué datos usamos, para qué y cómo podés ejercer tus derechos."
    >
      <LegalDocument documento={PRIVACIDAD} />
    </InfoPage>
  );
}
