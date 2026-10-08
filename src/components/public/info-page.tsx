import type { ReactNode } from "react";

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children?: ReactNode }) {
  return <main><section className="bg-ink text-ink-foreground"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"><p className="text-xs font-bold uppercase text-accent">{eyebrow}</p><h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/75 sm:text-lg">{intro}</p></div></section>{children}</main>;
}