import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Instagram, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePathnameRenderizado } from "@/lib/use-pathname-renderizado";
import { usePublicDirectory } from "./public-directory-provider";
import { SearchDialog } from "./search-dialog";
import { StickyFilters } from "./sticky-filters";

type Estado = "arriba" | "oculta" | "barra";

/** Un solo listener pasivo con rAF: arriba = transparente, bajando = oculta, subiendo = barra sólida. */
function useEstadoCabecera(bloqueada: boolean) {
  const [estado, setEstado] = useState<Estado>("arriba");
  const bloq = useRef(bloqueada);
  bloq.current = bloqueada;
  useEffect(() => {
    let ultimo = window.scrollY;
    let frame = 0;
    let actual: Estado = "arriba";
    const calcular = () => {
      frame = 0;
      const y = window.scrollY;
      let siguiente = actual;
      if (y <= 4) siguiente = "arriba";
      else if (y > ultimo + 2 && y > 80 && !bloq.current) siguiente = "oculta";
      else if (y < ultimo - 2) siguiente = "barra";
      if (siguiente !== actual) { actual = siguiente; setEstado(siguiente); }
      ultimo = y;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(calcular); };
    calcular();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);
  return estado;
}

export function SiteHeader() {
  const { data } = usePublicDirectory();
  const path = usePathnameRenderizado();
  const gift = path.startsWith("/gift-box");
  const conHero = path === "/" || path.startsWith("/comercio/");
  const conFiltros = path === "/cupones" || path === "/categorias";
  const [abierto, setAbierto] = useState(false);
  const [rubrosAbiertos, setRubrosAbiertos] = useState(false);
  const estado = useEstadoCabecera(abierto);
  const visibleEstado: Estado = abierto && estado === "oculta" ? "barra" : estado;
  const claro = gift || (conHero && visibleEstado === "arriba");
  const tono = claro ? "dark" : "light";

  const item = cn("menu-item group flex w-full items-center justify-between rounded-full border border-transparent px-5 py-3 text-[22px] font-medium transition-colors", gift ? "hover:border-primary-foreground/50" : "hover:border-foreground/40");
  const activo = { className: gift ? "!border-primary-foreground/50" : "!border-foreground/40" };
  const flecha = <ArrowRight className="size-5 opacity-0 transition-opacity group-hover:opacity-100 group-data-[status=active]:opacity-100" />;
  const enlaces = [
    { to: "/" as const, label: "Inicio" },
    { to: "/cupones" as const, label: "Cupones" },
    { to: "rubros" as const, label: "Categorías de Rubros" },
    ...(data.giftBoxVisible ? [{ to: "/gift-box" as const, label: "Gift Box" }] : []),
    { to: "/huella-solidaria" as const, label: "Huella Solidaria" },
    { to: "/sumate-a-cruzia" as const, label: "Sumate a Cruzia" },
    { to: "/contacto" as const, label: "Contacto" },
  ];

  return (
    <header
      className={cn(
        "site-safe-header fixed inset-x-0 top-0 z-40 border-b transition-[opacity,transform] duration-[250ms] ease-out",
        visibleEstado === "oculta" ? "pointer-events-none -translate-y-2 opacity-0" : "translate-y-0 opacity-100",
        visibleEstado === "barra"
          ? gift ? "border-primary-foreground/10 bg-[rgb(47_51_52/0.94)] text-primary-foreground" : "border-[rgb(31_30_30/0.08)] bg-[rgb(255_255_255/0.94)] text-foreground"
          : cn("border-transparent bg-transparent", claro ? "text-primary-foreground" : "text-foreground"),
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Cruzia — Inicio" className="shrink-0">
          <Logo variant="wordmark" tone={tono} height={28} decorative />
        </Link>

        <div className="flex min-w-0 items-center gap-1">
          <SearchDialog />
          {conFiltros ? <div className="hidden min-w-0 min-[480px]:block"><StickyFilters /></div> : null}
          <Button asChild variant="ghost" size="icon" className={cn("rounded-full hover:bg-transparent hover:opacity-70", conFiltros && "hidden sm:inline-flex")}><a href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer" aria-label="Instagram de Cruzia"><Instagram /></a></Button>
          <Sheet open={abierto} onOpenChange={setAbierto}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="rounded-full hover:bg-transparent hover:opacity-70" aria-label="Abrir menú"><Menu /></Button></SheetTrigger>
            <SheetContent className={cn("menu-panel flex !h-[100svh] w-[88%] flex-col overflow-y-auto rounded-l-[28px] border-0 p-6 shadow-none sm:!max-w-none sm:w-[420px] data-[state=closed]:fade-out-0 data-[state=closed]:!duration-200 data-[state=open]:fade-in-0 data-[state=open]:!duration-300", gift ? "menu-gift !bg-[rgba(47,51,52,.45)] ![background-image:none] text-primary-foreground" : "text-foreground")}>
              <SheetHeader className="relative z-10 pb-4 text-left">
                <SheetTitle><Logo variant="isotype" tone={gift ? "dark" : "light"} height={42} decorative /><span className="sr-only">Menú</span></SheetTitle>
                <SheetDescription className="sr-only">Secciones de Cruzia</SheetDescription>
              </SheetHeader>
              <nav className="relative z-10 flex flex-1 flex-col justify-center gap-2 py-6" aria-label="Navegación principal">
                {enlaces.map((e, i) => {
                  const estilo = { animationDelay: `${60 + i * 45}ms` };
                  if (e.to === "rubros") {
                    return (
                      <div key="rubros" className="menu-item" style={estilo}>
                        <button type="button" aria-expanded={rubrosAbiertos} onClick={() => setRubrosAbiertos((v) => !v)} className={cn(item, "text-left")}>
                          <span>{e.label}</span>
                          <ChevronDown className={cn("size-5 transition-transform", rubrosAbiertos && "rotate-180")} />
                        </button>
                        {rubrosAbiertos ? (
                          <div className="grid gap-1 py-2 pl-5">
                            <SheetClose asChild><Link to="/categorias" className="rounded-full px-5 py-2 text-base opacity-80 hover:opacity-100">Ver todas</Link></SheetClose>
                            {data.colecciones.map((c) => (
                              <SheetClose asChild key={c.id}><Link to="/categorias" search={{ coleccion: c.id }} className="rounded-full px-5 py-2 text-base opacity-80 hover:opacity-100">{c.nombre}</Link></SheetClose>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                  return (
                    <SheetClose asChild key={e.to}>
                      <Link to={e.to} activeOptions={{ exact: true }} activeProps={activo} className={item} style={estilo}>
                        <span>{e.label}</span>{flecha}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
              <a href="https://instagram.com/cruzia.ar" target="_blank" rel="noreferrer" className="relative z-10 flex items-center gap-2 pt-4 text-sm"><Instagram className="size-4" /> @cruzia.ar</a>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {conFiltros ? <div className="mx-auto max-w-7xl px-4 pb-2 min-[480px]:hidden"><StickyFilters /></div> : null}
    </header>
  );
}
