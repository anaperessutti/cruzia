import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { BotonPdf, RegaloVista } from "@/components/public/regalo-vista";
import { Button } from "@/components/ui/button";
import { getPresentacion, getRegalo, UUID, } from "@/lib/regalo";
import { getPortadaRegalo } from "@/lib/regalo.functions";

const TITULO = "Tenés un regalo | Gift Box Cruzia";
const DESC = "Abrí tu Gift Box de Cruzia: experiencias para disfrutar en la Costa.";

export const Route = createFileRoute("/regalo/$token")({
  loader: async () => ({ portada: await getPortadaRegalo().catch(() => null) }),
  head: ({ loaderData }) => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESC },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: loaderData?.portada ? "summary_large_image" : "summary" },
      { name: "robots", content: "noindex, nofollow" },
      ...(loaderData?.portada
        ? [
            { property: "og:image", content: loaderData.portada },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:image", content: loaderData.portada },
          ]
        : []),
    ],
  }),
  component: Page,
});

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <main className="theme-gift bg-gift min-h-[80vh] px-4 pb-20 pt-28 sm:px-6">
      <div className="glass mx-auto max-w-xl rounded-[32px] p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">{titulo}</h1>
        <p className="mt-3 text-primary-foreground/70">{texto}</p>
        <Button asChild className="mt-6">
          <Link to="/">Ir a Cruzia</Link>
        </Button>
      </div>
    </main>
  );
}

function Page() {
  const { token } = Route.useParams();
  const valido = UUID.test(token);
  const regalo = useQuery({ queryKey: ["regalo", token], enabled: valido, queryFn: () => getRegalo(token) });
  const pres = useQuery({ queryKey: ["giftbox-presentacion"], queryFn: getPresentacion });

  if (!valido || regalo.isError || regalo.data?.estado === "inexistente")
    return <Aviso titulo="No encontramos este regalo" texto="Revisá que el link esté completo o escribinos por WhatsApp y te ayudamos." />;
  if (regalo.data?.estado === "cancelado")
    return <Aviso titulo="Este regalo no está disponible" texto="Si creés que es un error, escribinos por WhatsApp." />;
  if (!regalo.data || pres.isLoading) return <main className="theme-gift bg-gift min-h-[80vh]" />;

  const info = regalo.data;
  return (
    <main className="theme-gift bg-gift min-h-[80vh]">
      <RegaloVista info={info} presentacion={pres.data ?? null} acciones={<BotonPdf info={info} presentacion={pres.data ?? null} />} />
    </main>
  );
}
