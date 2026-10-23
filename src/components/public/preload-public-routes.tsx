import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

const destinos = ["/cupones", "/categorias", "/huella-solidaria", "/sumate-a-cruzia", "/contacto", "/gift-box"] as const;

/** Warm public route modules without changing filters or navigating. */
export function PreloadPublicRoutes() {
  const router = useRouter();
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const preload = () => {
      for (const to of destinos) {
        void (async () => {
          try { await router.preloadRoute({ to }); }
          catch { /* Navigation can retry normally if preloading fails. */ }
        })();
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preload);
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(preload, 1500);
    return () => window.clearTimeout(id);
  }, [router]);
  return null;
}