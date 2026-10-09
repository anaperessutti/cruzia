import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PublicDirectoryProvider } from "@/components/public/public-directory-provider";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { ScrollRevealFallback } from "@/components/public/scroll-reveal-fallback";

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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Cruzia" },
      { property: "og:site_name", content: "Cruzia · www.cruzia.ar" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const isAdmin = useRouterState({ select: (state) => state.location.pathname.startsWith("/admin") });
  const isGift = useRouterState({ select: (state) => state.location.pathname.startsWith("/gift-box") });
  const isHome = useRouterState({ select: (state) => state.location.pathname === "/" || state.location.pathname.startsWith("/comercio/") });

  return (
    <QueryClientProvider client={queryClient}>
      {isAdmin ? <Outlet /> : (
        <PublicDirectoryProvider>
          {/* Lienzo continuo: un solo fondo con halos + grano para todas las páginas públicas. */}
          <div className={`site-public ${isGift ? "theme-gift" : "bg-canvas"} relative isolate flex min-h-screen flex-col overflow-x-clip`}>
            <ScrollRevealFallback />
            {isGift ? null : <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip"><div className="sd-drift-a halo-gray absolute -left-40 top-[15%] size-[44rem]" /><div className="sd-drift-b halo-accent absolute -right-40 top-[55%] size-[40rem] opacity-70" /></div>}
            <div aria-hidden="true" className="bg-grain pointer-events-none fixed inset-0 z-[60] opacity-[0.045] mix-blend-multiply" style={isGift ? { mixBlendMode: "overlay", opacity: 0.08 } : undefined} />
            <SiteHeader />
            <div className={isHome ? "flex-1" : "flex-1 pt-20"}><Outlet /></div>
            <SiteFooter />
          </div>
        </PublicDirectoryProvider>
      )}
    </QueryClientProvider>
  );
}
