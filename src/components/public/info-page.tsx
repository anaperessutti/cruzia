import type { ReactNode } from "react";

import { PageIntro } from "./page-intro";

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children?: ReactNode }) {
  return (
    <main>
      <PageIntro rotulo={eyebrow} titulo={title} intro={intro} className="pb-12 sm:pb-16" />
      {children ? <div className="relative -mt-6 [&>section]:glass [&>section]:mx-4 [&>section]:rounded-[32px] sm:[&>section]:mx-auto">{children}</div> : null}
    </main>
  );
}
