import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AdminShell({ titulo, children }: { titulo: string; children: ReactNode }) {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"verificando" | "ok" | "sin-permiso">("verificando");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!activo) return;
      if (!data.user) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      const { data: esAdmin } = await supabase.rpc("is_admin");
      if (!activo) return;
      setEmail(data.user.email ?? null);
      setEstado(esAdmin ? "ok" : "sin-permiso");
    })();
    return () => {
      activo = false;
    };
  }, [navigate]);

  if (estado === "verificando") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando sesión…</p>
      </main>
    );
  }

  if (estado === "sin-permiso") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-destructive">Tu cuenta no tiene permisos de administración.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div>
            <p className="font-display text-2xl font-bold">Cruzia · {titulo}</p>
            {email && <p className="text-xs opacity-80">{email}</p>}
          </div>
          <nav className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/admin/panel">Métricas</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/admin/comercios">Comercios</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/admin/cupones">Promociones</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/admin/eventos">Eventos</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/">Ver la app</Link>
            </Button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">{children}</div>
    </main>
  );
}
