import { Link } from "@tanstack/react-router";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" aria-label="AUNA — Inicio" className="group inline-flex items-center gap-2">
      <span className={inverse ? "font-display text-3xl font-extrabold text-primary-foreground" : "font-display text-3xl font-extrabold text-primary"}>AUNA</span>
      <span className={inverse ? "hidden text-[10px] font-bold uppercase text-primary-foreground/70 sm:block" : "hidden text-[10px] font-bold uppercase text-muted-foreground sm:block"}>Beneficios<br />de la costa</span>
    </Link>
  );
}