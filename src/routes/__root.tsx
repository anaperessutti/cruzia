import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PublicDirectoryProvider } from "@/components/public/public-directory-provider";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { aplicarTiemposMovimiento } from "@/components/public/motion";
import { usePathnameRenderizado } from "@/lib/use-pathname-renderizado";
import { PreloadPublicRoutes } from "@/components/public/preload-public-routes";
import "@/lib/diagnostico";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: import("@tanstack/react-router").ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// Origen del backend (API + Storage de imágenes comparten host): conexión anticipada.
const backendOrigin = new URL(import.meta.env["VITE_SUPABASE_URL"]).origin;

// Las CSS vars de movimiento se escriben en :root desde TIEMPOS (única fuente de verdad).
aplicarTiemposMovimiento();

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "author", content: "Cruzia" },
      { property: "og:site_name", content: "Cruzia · www.cruzia.ar" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: backendOrigin, crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: backendOrigin },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
    scripts: [
      // Marca "m-js" antes del primer render: solo con ella los elementos animados arrancan ocultos.
      { children: `document.documentElement.classList.add("m-js");setTimeout(function(){if(!document.documentElement.hasAttribute("data-hydrated"))document.documentElement.classList.remove("m-js");},4000);` },
      { children: `(function(){try{var h=document.documentElement,v=(new URLSearchParams(location.search).get("x")||"").split(","),w=["noblur","nofx","noanim","cv"];for(var i=0;i<v.length;i++){var s=v[i].trim();if(w.indexOf(s)>-1){h.classList.add("x-"+s);if(s==="noanim")h.classList.remove("m-js");}}}catch(e){}})();` },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Key only the resolved route content; scrolling belongs to the router. */
function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathnameRenderizado();
  return (
    <div key={pathname} className={className}>
      {children}
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = usePathnameRenderizado();
  const isAdmin = pathname.startsWith("/admin");
  const isGift = pathname.startsWith("/gift-box");
  const conFiltros = pathname === "/cupones" || pathname === "/categorias";
  const isHome = pathname === "/" || pathname.startsWith("/comercio/");
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "true");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isAdmin ? <Outlet /> : (
        <PublicDirectoryProvider>
          <PreloadPublicRoutes />
          {/* Lienzo continuo: un solo fondo con halos + grano para todas las páginas públicas. */}
          <div className={`site-public ${isGift ? "theme-gift" : ""} relative isolate flex min-h-screen flex-col overflow-x-clip`}>
            <div aria-hidden="true" className={`fondo-fijo ${isGift ? "fondo-gift" : ""}`}><div className="halo-gray absolute -left-40 top-[15%] size-[44rem]" /></div>
            <SiteHeader />
            <PageTransition className={isHome ? "site-safe-page flex-1" : conFiltros ? "site-safe-page site-safe-page-filters flex-1" : "site-safe-page site-safe-page-default flex-1"}><Outlet /></PageTransition>
            <SiteFooter />
          </div>
        </PublicDirectoryProvider>
      )}
    </QueryClientProvider>
  );
}
