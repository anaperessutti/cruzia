import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

/**
 * Secciones del panel. El resaltado se calcula por prefijo de ruta (fuzzy), así
 * /admin/comercios/$comercioId y /admin/comercios/nuevo marcan "Comercios", y los
 * filtros o pestañas de la url no apagan el resaltado.
 */
const SECCIONES = [
  { to: "/admin/panel", etiqueta: "Métricas" },
  { to: "/admin/comercios", etiqueta: "Comercios" },
  { to: "/admin/cupones", etiqueta: "Promociones" },
  { to: "/admin/eventos", etiqueta: "Eventos" },
  { to: "/admin/gift-box", etiqueta: "Gift Box" },
  { to: "/admin/huella-solidaria", etiqueta: "Huella Solidaria" },
] as const;

export function AdminShell({ titulo, children }: { titulo: string; children: ReactNode }) {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
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

  async function cerrarSesion() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

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
            {SECCIONES.map((seccion) => {
              const activa = !!matchRoute({
                to: seccion.to,
                fuzzy: true,
                includeSearch: false,
              });
              return (
                <Button
                  key={seccion.to}
                  variant="secondary"
                  size="sm"
                  asChild
                  aria-current={activa ? "page" : undefined}
                  className={
                    activa ? "bg-primary text-primary-foreground hover:bg-primary-hover" : undefined
                  }
                >
                  <Link to={seccion.to}>{seccion.etiqueta}</Link>
                </Button>
              );
            })}
            <Button variant="secondary" size="sm" asChild>
              <Link to="/">Ver la app</Link>
            </Button>
            <Button variant="secondary" size="sm" onClick={cerrarSesion}>
              Cerrar sesión
            </Button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">{children}</div>
    </main>
  );
}
