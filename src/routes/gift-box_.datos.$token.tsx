import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { GiftboxFormulario, type GiftboxFormularioInfo } from "@/components/public/giftbox-formulario";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/gift-box_/datos/$token")({
  head: () => ({
    meta: [
      { title: "Datos de tu regalo | Gift Box Cruzia" },
      { name: "description", content: "Completá los datos de quien recibe tu Gift Box de Cruzia." },
      { property: "og:title", content: "Datos de tu regalo | Gift Box Cruzia" },
      { property: "og:description", content: "Formulario para personalizar tu Gift Box." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Page,
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Marco({ children }: { children: ReactNode }) {
  return (
    <main className="theme-gift bg-gift min-h-[80vh] px-4 pb-20 pt-28 sm:px-6">
      <div className="glass mx-auto max-w-xl rounded-[32px] p-6 sm:p-8">{children}</div>
    </main>
  );
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Marco>
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <p className="mt-3 text-primary-foreground/70">{texto}</p>
      <Button asChild className="mt-6">
        <Link to="/">Ir a Cruzia</Link>
      </Button>
    </Marco>
  );
}

function Page() {
  const { token } = Route.useParams();
  const info = useQuery({
    queryKey: ["giftbox-formulario", token],
    enabled: UUID.test(token),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("giftbox_formulario_info", { p_token: token });
      if (error) throw error;
      return data as unknown as GiftboxFormularioInfo;
    },
  });

  if (!UUID.test(token) || info.data?.estado === "inexistente" || info.isError)
    return <Aviso titulo="No encontramos este regalo" texto="Revisá que el link esté completo o escribinos por WhatsApp y te ayudamos." />;
  if (info.isLoading || !info.data) return <main className="theme-gift bg-gift min-h-[80vh]" />;
  if (info.data.estado === "oculta")
    return <Aviso titulo="Gift Box no está disponible ahora" texto="Volvé a intentarlo más tarde o escribinos por WhatsApp." />;
  if (info.data.estado === "cerrado")
    return <Aviso titulo="Este pedido ya está cerrado" texto="El regalo ya fue entregado o cancelado, así que no se pueden cambiar los datos." />;
  return <GiftboxFormulario token={token} info={info.data} />;
}

