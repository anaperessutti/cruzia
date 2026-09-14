import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/panel")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de administración | OLA!" },
      { name: "description", content: "Panel de administración de OLA! (en construcción)." },
      { property: "og:title", content: "Panel de administración | OLA!" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPanel,
});

function AdminPanel() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      setEmail(data.session.user.email ?? null);
      setVerificando(false);
    });
  }, [navigate]);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando sesión…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">¡Bienvenida{email ? `, ${email}` : ""}!</CardTitle>
          <CardDescription>
            Tu sesión de super_admin funciona correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            El panel de administración todavía está en construcción. Pronto vas a poder gestionar
            comercios, cupones, planes y métricas desde acá.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/">Ir al inicio</Link>
            </Button>
            <Button variant="outline" onClick={cerrarSesion}>
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
