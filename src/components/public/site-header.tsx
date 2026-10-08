import { Link } from "@tanstack/react-router";
import { Instagram, Menu } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { usePublicDirectory } from "./public-directory-provider";
import { SearchDialog } from "./search-dialog";

const links = [
  { to: "/" as const, label: "Inicio" },
  { to: "/cupones" as const, label: "⭐ Cupones" },
  { to: "/categorias" as const, label: "Categorías" },
  { to: "/huella-solidaria" as const, label: "Huella Solidaria" },
  { to: "/sumate-a-cruzia" as const, label: "Sumate a Cruzia" },
  { to: "/contacto" as const, label: "Contacto" },
];

/** Al scrollear: el vidrio gana opacidad; se oculta al bajar y reaparece al subir. */
function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 160 && y > last.current + 4 ? true : y < last.current - 4 ? false : (prev) => prev);
      last.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { scrolled, hidden };
}

export function SiteHeader() {
  const { data } = usePublicDirectory();
  const { scrolled, hidden } = useScrollState();
  const pill = cn("flex h-14 items-center rounded-full transition-all duration-500", scrolled ? "glass-strong" : "glass");

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 px-3 pt-3 transition-transform duration-500 sm:px-6 sm:pt-4",
        hidden ? "-translate-y-[120%]" : "translate-y-0",
      )}
    >
      {/* Dos grupos flotantes independientes: entre ellos se ve el hero. */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className={cn(pill, "px-4 sm:px-5")}><BrandMark /></div>
        <div className={cn(pill, "gap-0.5 px-1.5")}>
          <SearchDialog />
          <Button asChild variant="ghost" size="icon" className="rounded-full"><a href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer" aria-label="Instagram de Cruzia"><Instagram /></a></Button>
          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="rounded-full" aria-label="Abrir menú"><Menu /></Button></SheetTrigger>
            <SheetContent className="flex w-[88%] flex-col border-l-0 bg-ink text-ink-foreground sm:max-w-md [&]:bg-ink">
              <SheetHeader className="pb-6 text-left"><SheetTitle><BrandMark inverse /></SheetTitle><SheetDescription className="text-primary-foreground/65">Todo lo bueno de La Costa, más cerca.</SheetDescription></SheetHeader>
              <nav className="flex flex-1 flex-col justify-center gap-1" aria-label="Navegación principal">
                {links.map((item, index) => {
                  const numerados = data.giftBoxVisible && index > 2 ? index + 2 : index + 1;
                  return (
                    <Fragment key={item.to}>
                      <SheetClose asChild><Link to={item.to} activeProps={{ className: "bg-primary-foreground text-foreground" }} className="flex items-center justify-between rounded-full px-5 py-3 font-display text-xl font-light text-primary-foreground transition-colors hover:bg-primary-foreground/10"><span>{item.label}</span><span className="text-xs opacity-50">{String(numerados).padStart(2, "0")}</span></Link></SheetClose>
                      {index === 2 && data.giftBoxVisible ? <SheetClose asChild><Link to="/gift-box" activeProps={{ className: "bg-primary-foreground text-foreground" }} className="flex items-center justify-between rounded-full px-5 py-3 font-display text-xl font-light text-primary-foreground transition-colors hover:bg-primary-foreground/10"><span>Gift Box</span><span className="text-xs opacity-50">04</span></Link></SheetClose> : null}
                    </Fragment>
                  );
                })}
              </nav>
              <a href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer" className="flex items-center gap-2 pt-5 text-sm font-semibold"><Instagram className="size-4" /> @cruzia.ar</a>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
