import { Link } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";

import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div><BrandMark inverse /><p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/70">Beneficios, experiencias y comunidad en el Partido de la Costa.</p></div>
        <div className="grid gap-3 text-sm">
          <a className="flex items-center gap-2 hover:text-accent" href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer"><Instagram className="size-4" /> @cruzia.ar</a>
          <a className="flex items-center gap-2 hover:text-accent" href="mailto:somoscruzia@gmail.com"><Mail className="size-4" /> somoscruzia@gmail.com</a>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>© 2026 Cruzia Partido de la Costa</span><div className="flex flex-wrap gap-x-5 gap-y-2"><Link to="/privacidad" className="hover:text-primary-foreground">Privacidad</Link><Link to="/terminos-promociones" className="hover:text-primary-foreground">Términos de promociones</Link></div></div></div>
    </footer>
  );
}