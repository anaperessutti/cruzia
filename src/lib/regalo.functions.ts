import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { optimizarImagen } from "./imagen";

/** Portada pública para la vista previa social de /regalo (sin datos personales). */
export const getPortadaRegalo = createServerFn({ method: "GET" }).handler(async (): Promise<string | null> => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  const opaca = key.startsWith("sb_");
  const sb = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: opaca
      ? {
          fetch: (input, init) => {
            const h = new Headers(init?.headers);
            if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
            h.set("apikey", key);
            return fetch(input, { ...init, headers: h });
          },
        }
      : {},
  });
  const { data } = await sb.from("giftbox_presentacion").select("imagen_portada").limit(1).maybeSingle();
  return optimizarImagen(data?.imagen_portada ?? null);
});
