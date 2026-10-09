import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Instagram, Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePublicDirectory } from "./public-directory-provider";
import { SearchDialog } from "./search-dialog";
import { StickyFilters } from "./sticky-filters";

const baseLinks = [
  { to: "/" as const, label: "Inicio" },
  { to: "/cupones" as const, label: "Cupones" },
  { to: "/categorias" as const, label: "Categorías" },
  { to: "/huella-solidaria" as const, label: "Huella Solidaria" },
  { to: "/sumate-a-cruzia" as const, label: "Sumate a Cruzia" },
  { to: "/contacto" as const, label: "Contacto" },
];

/** True mientras la barra flota sobre la imagen del banner. */
function useSobreImagen(activo: boolean) {
  const [sobre, setSobre] = useState(activo);
  useEffect(() => {
    if (!activo) { setSobre(false); return; }
    const medir = () => setSobre(window.scrollY < window.innerHeight * 0.5);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, [activo]);
  return sobre;
}

export function SiteHeader() {
  const { data } = usePublicDirectory();
  const path = useRouterState({ select: (st) => st.location.pathname });
  const gift = path.startsWith("/gift-box");
  const conHero = path === "/" || path.startsWith("/comercio/");
  const conFiltros = path === "/cupones" || path === "/categorias";
  const sobreImagen = useSobreImagen(conHero);
  const claro = gift || sobreImagen; // texto blanco
  const links = data.giftBoxVisible ? [...baseLinks.slice(0, 3), { to: "/gift-box" as const, label: "Gift Box" }, ...baseLinks.slice(3)] : baseLinks;

  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-colors duration-200", claro ? "text-primary-foreground" : "text-foreground")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Cruzia — Inicio" className="shrink-0">
          {conFiltros ? (
            <>
              <Logo variant="isotype" tone={claro ? "dark" : "light"} height={26} decorative className="transition-[filter] duration-200 sm:hidden" />
              <Logo variant="wordmark" tone={claro ? "dark" : "light"} height={28} decorative className="hidden transition-[filter] duration-200 sm:block" />
            </>
          ) : <Logo variant="wordmark" tone={claro ? "dark" : "light"} height={28} decorative className="transition-[filter] duration-200" />}
        </Link>

        <div className="flex min-w-0 items-center gap-1">
          <nav aria-label="Navegación principal" className="mr-2 hidden items-center gap-6 text-sm xl:flex">
            {links.map((l) => <Link key={l.to} to={l.to} className="opacity-80 transition-opacity hover:opacity-100" activeProps={{ className: "!opacity-100" }} activeOptions={{ exact: l.to === "/" }}>{l.label}</Link>)}
          </nav>
          <SearchDialog />
          {conFiltros ? <StickyFilters /> : null}
          <Button asChild variant="ghost" size="icon" className={cn("rounded-full hover:bg-transparent hover:opacity-70", conFiltros && "hidden sm:inline-flex")}><a href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer" aria-label="Instagram de Cruzia"><Instagram /></a></Button>
          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="rounded-full hover:bg-transparent hover:opacity-70 xl:hidden" aria-label="Abrir menú"><Menu /></Button></SheetTrigger>
            <SheetContent className={cn("glass-menu grain-overlay !m-3 flex !h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] flex-col overflow-clip rounded-[28px] border-0 bg-transparent sm:max-w-md", gift ? "theme-gift !bg-[rgb(20_22_23/0.4)] ![background-image:none] text-primary-foreground" : "text-foreground")}>
              <SheetHeader className="pb-6 text-left">
                <SheetTitle><Logo variant="wordmark" tone={gift ? "dark" : "light"} height={28} decorative /><span className="sr-only">Menú</span></SheetTitle>
                <SheetDescription className={gift ? "text-primary-foreground/70" : "text-muted-foreground"}>Todo lo bueno de La Costa, más cerca.</SheetDescription>
              </SheetHeader>
              <nav className="relative z-10 flex flex-1 flex-col justify-center gap-1" aria-label="Menú">
                {links.map((item) => (
                  <SheetClose asChild key={item.to}>
                    <Link
                      to={item.to}
                      activeOptions={{ exact: item.to === "/" }}
                      activeProps={{ className: gift ? "!border-primary-foreground/60" : "!border-foreground/50" }}
                      className={cn("group flex items-center justify-between rounded-full border border-transparent px-5 py-3 text-lg transition-colors", gift ? "hover:border-primary-foreground/60" : "hover:border-foreground/50")}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100 group-data-[status=active]:opacity-100 group-[.active]:opacity-100" />
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <a href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer" className="relative z-10 flex items-center gap-2 pt-5 text-sm"><Instagram className="size-4" /> @cruzia.ar</a>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
