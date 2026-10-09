import { Link, useRouterState } from "@tanstack/react-router";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/** Pie sin fondo propio: solo un filete fino arriba, con el mismo margen que el contenido. */
export function SiteFooter() {
  const oscuro = useRouterState({ select: (s) => s.location.pathname.startsWith("/gift-box") });
  return (
    <footer className={cn("reveal-text", oscuro ? "theme-gift !bg-transparent ![background-image:none] -mt-px" : "mt-20")}>
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", oscuro ? "bg-transparent" : "")}>
        <div className={cn("border-t pb-10 pt-10 text-sm", oscuro ? "border-primary-foreground/40 text-primary-foreground" : "border-foreground/40 text-foreground")}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <Logo variant="wordmark" tone={oscuro ? "dark" : "light"} height={28} />
            <div className="flex flex-col gap-2 sm:items-end">
              <a className="hover:opacity-70" href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer">Instagram @cruzia.ar</a>
              <a className="hover:opacity-70" href="mailto:somoscruzia@gmail.com">somoscruzia@gmail.com</a>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Cruzia · Partido de la Costa</span>
            <div className="flex gap-5">
              <Link to="/privacidad" className="hover:opacity-70">Privacidad</Link>
              <Link to="/terminos-promociones" className="hover:opacity-70">Términos</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
