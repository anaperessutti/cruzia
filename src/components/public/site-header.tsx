import { Link } from "@tanstack/react-router";
import { Instagram, Menu } from "lucide-react";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandMark } from "./brand-mark";
import { usePublicDirectory } from "./public-directory-provider";
import { SearchDialog } from "./search-dialog";

const links = [
  { to: "/" as const, label: "Inicio" },
  { to: "/cupones" as const, label: "⭐ Cupones" },
  { to: "/categorias" as const, label: "Categorías de Rubros" },
  { to: "/huella-solidaria" as const, label: "Huella Solidaria" },
  { to: "/sumate-a-auna" as const, label: "Sumate a AUNA" },
  { to: "/contacto" as const, label: "Contacto" },
];

export function SiteHeader() {
  const { data } = usePublicDirectory();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandMark />
        <div className="flex items-center gap-1">
          <SearchDialog />
          <Button asChild variant="ghost" size="icon"><a href="https://www.instagram.com/somos_auna/" target="_blank" rel="noreferrer" aria-label="Instagram de AUNA"><Instagram /></a></Button>
          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Abrir menú"><Menu /></Button></SheetTrigger>
            <SheetContent className="flex w-[88%] flex-col border-l-0 bg-primary text-primary-foreground sm:max-w-md">
              <SheetHeader className="border-b border-primary-foreground/15 pb-6 text-left"><SheetTitle><BrandMark inverse /></SheetTitle><SheetDescription className="text-primary-foreground/65">Todo lo bueno de La Costa, más cerca.</SheetDescription></SheetHeader>
              <nav className="flex flex-1 flex-col justify-center gap-1" aria-label="Navegación principal">
                {links.map((item, index) => {
                  const numerados = data.giftBoxVisible && index > 2 ? index + 2 : index + 1;
                  return (
                    <Fragment key={item.to}>
                      <SheetClose asChild><Link to={item.to} activeProps={{ className: "bg-primary-foreground text-primary" }} className="flex items-center justify-between rounded-md px-4 py-3 font-display text-xl font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"><span>{item.label}</span><span className="text-xs opacity-50">{String(numerados).padStart(2, "0")}</span></Link></SheetClose>
                      {index === 2 && data.giftBoxVisible ? <SheetClose asChild><Link to="/gift-box" activeProps={{ className: "bg-primary-foreground text-primary" }} className="flex items-center justify-between rounded-md px-4 py-3 font-display text-xl font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"><span>Gift Box</span><span className="text-xs opacity-50">04</span></Link></SheetClose> : null}
                    </Fragment>
                  );
                })}
              </nav>
              <a href="https://www.instagram.com/somos_auna/" target="_blank" rel="noreferrer" className="flex items-center gap-2 border-t border-primary-foreground/15 pt-5 text-sm font-semibold"><Instagram className="size-4" /> @somos_auna</a>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}