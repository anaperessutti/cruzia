import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const navigate = useNavigate();

  // Si el link de confirmación de email cae en la home, lo llevamos a la
  // pantalla que finaliza el alta de administradora.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const marcas = window.location.hash + window.location.search;
    if (/access_token|type=signup|type=recovery|[?&]code=/.test(marcas)) {
      navigate({ to: "/admin/confirmado", replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#fcfbf8" }}
    >
      <img
        data-lovable-blank-page-placeholder="REMOVE_THIS"
        src="https://cdn.gpteng.co/blank-app-v1.svg"
        alt="Your app will live here!"
      />
    </div>
  );
}
