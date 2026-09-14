import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/confirmado")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Email confirmado | OLA!" },
      {
        name: "description",
        content: "Confirmación de la cuenta de administradora de OLA!, cupones del Partido de la Costa.",
      },
      { property: "og:title", content: "Email confirmado | OLA!" },
      { property: "og:description", content: "Confirmación de la cuenta de administradora de OLA!." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminConfirmado,
});

type Estado = "procesando" | "listo" | "sin_sesion" | "error";

function AdminConfirmado() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("procesando");
  const [detalle, setDetalle] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      // Supabase procesa el hash del link de confirmación al cargar el cliente.
      const { data } = await supabase.auth.getSession();
      let user = data.session?.user ?? null;
      if (!user) {
        await new Promise((r) => setTimeout(r, 1200));
        const retry = await supabase.auth.getSession();
        user = retry.data.session?.user ?? null;
      }
      if (!activo) return;
      if (!user) {
        setEstado("sin_sesion");
        return;
      }

      // Recién ahora, con sesión activa y email confirmado, aseguramos el registro de admin.
      const { data: yaExiste } = await supabase.rpc("existe_admin");
      if (!yaExiste) {
        const { error: insertError } = await supabase
          .from("admins")
          .insert({ user_id: user.id, email: user.email ?? "", rol: "super_admin" });
        if (insertError && !/duplicate key/i.test(insertError.message)) {
          if (!activo) return;
          setEstado("error");
          setDetalle(insertError.message);
          return;
        }
      }
      if (!activo) return;
      setEstado("listo");
    })();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            {estado === "listo" ? "¡Cuenta confirmada!" : "Confirmando tu cuenta"}
          </CardTitle>
          <CardDescription>
            {estado === "procesando" && "Un segundo, estamos terminando la configuración…"}
            {estado === "listo" && "Tu cuenta de administradora quedó activa."}
            {estado === "sin_sesion" && "No pudimos abrir tu sesión desde este enlace."}
            {estado === "error" && "Hubo un problema al terminar la configuración."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {detalle && <p className="text-sm text-destructive">{detalle}</p>}
          {estado !== "procesando" && (
            <Button className="w-full" onClick={() => navigate({ to: "/admin/login" })}>
              Ir al inicio de sesión
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
