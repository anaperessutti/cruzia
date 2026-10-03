import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/setup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Configuración inicial | Cruzia" },
      {
        name: "description",
        content: "Creá la primera cuenta de administradora de Cruzia, la app de cupones del Partido de la Costa.",
      },
      { property: "og:title", content: "Configuración inicial | Cruzia" },
      {
        property: "og:description",
        content: "Creá la primera cuenta de administradora de Cruzia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSetup,
});

type Estado = "cargando" | "disponible" | "completada";

function AdminSetup() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      // Si venimos del link de confirmación de email, terminamos el alta allí.
      if (typeof window !== "undefined" && /access_token|type=signup|code=/.test(window.location.hash + window.location.search)) {
        navigate({ to: "/admin/confirmado", replace: true });
        return;
      }
      const { data, error: errRpc } = await supabase.rpc("existe_admin");
      if (!activo) return;
      if (errRpc) {
        setEstado("disponible");
        return;
      }
      setEstado(data ? "completada" : "disponible");
    })();
    return () => {
      activo = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (estado !== "completada") return;
    const t = setTimeout(() => navigate({ to: "/admin/login", replace: true }), 2500);
    return () => clearTimeout(t);
  }, [estado, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setEnviando(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin/confirmado` },
      });
      if (signUpError && !/already registered/i.test(signUpError.message)) {
        throw signUpError;
      }

      let userId = signUpData?.session?.user.id ?? null;
      if (!userId) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setAviso(
            "Te enviamos un email para confirmar la cuenta. Confirmalo y volvé a esta página para terminar la configuración.",
          );
          return;
        }
        userId = signInData.user?.id ?? null;
      }
      if (!userId) throw new Error("No se pudo iniciar sesión con esa cuenta.");

      const { error: insertError } = await supabase
        .from("admins")
        .insert({ user_id: userId, email, rol: "super_admin" });
      if (insertError) throw insertError;

      setEstado("completada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Configuración inicial</CardTitle>
          <CardDescription>
            {estado === "completada"
              ? "La configuración ya fue completada."
              : "Creá la cuenta de administradora principal de Cruzia."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {estado === "cargando" && (
            <p className="text-sm text-muted-foreground">Verificando…</p>
          )}

          {estado === "completada" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ya existe una cuenta de administradora. Te llevamos al inicio de sesión.
              </p>
              <Button className="w-full" onClick={() => navigate({ to: "/admin/login" })}>
                Ir al inicio de sesión
              </Button>
            </div>
          )}

          {estado === "disponible" && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {aviso && <p className="text-sm text-muted-foreground">{aviso}</p>}
              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? "Creando…" : "Crear administradora"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
