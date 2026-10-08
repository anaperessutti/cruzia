import { Link, useRouterState } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const oscuro = useRouterState({ select: (s) => s.location.pathname.startsWith("/gift-box") });
  return (
    <footer
      className={cn(
        "transition-chrome relative overflow-hidden rounded-t-[40px] bg-chrome-bg text-chrome-fg",
        oscuro ? "theme-gift border-t border-chrome-border" : "mt-20",
      )}
    >
      {/* Degradado que une el footer con el lienzo. */}
      {!oscuro ? <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-background/70 to-transparent" /> : null}
      <Logo variant="isotype" tone={oscuro ? "dark" : "light"} height={320} decorative className="pointer-events-none absolute -bottom-10 -right-16 !opacity-[0.05]" />
      <div className="sd-reveal relative mx-auto grid max-w-7xl gap-10 px-5 pb-10 pt-14 sm:px-8 md:grid-cols-[1fr_auto]">
        <div>
          <Logo variant="lockup" tone={oscuro ? "dark" : "light"} height={96} />
          <p className="mt-5 max-w-sm text-sm leading-6 text-chrome-muted">Beneficios, experiencias y comunidad en el Partido de la Costa.</p>
        </div>
        <div className="grid content-start gap-3 text-sm font-semibold">
          <a className="flex items-center gap-2 hover:text-primary" href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer"><Instagram className="size-4" /> @cruzia.ar</a>
          <a className="flex items-center gap-2 hover:text-primary" href="mailto:somoscruzia@gmail.com"><Mail className="size-4" /> somoscruzia@gmail.com</a>
        </div>
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-5 pb-8 text-xs text-chrome-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© 2026 Cruzia · Partido de la Costa</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/privacidad" className="hover:text-chrome-fg">Privacidad</Link>
          <Link to="/terminos-promociones" className="hover:text-chrome-fg">Términos</Link>
        </div>
      </div>
    </footer>
  );
}
