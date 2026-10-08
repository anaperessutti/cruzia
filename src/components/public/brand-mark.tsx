import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/logo";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" aria-label="Cruzia — Inicio" className="inline-flex items-center rounded-full p-1">
      <Logo variant="wordmark" tone={inverse ? "dark" : "light"} height={28} decorative />
    </Link>
  );
}
