CREATE TABLE public.colecciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.colecciones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colecciones TO authenticated;
GRANT ALL ON public.colecciones TO service_role;

ALTER TABLE public.colecciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY colecciones_public_read ON public.colecciones FOR SELECT USING (true);
CREATE POLICY colecciones_admin_write ON public.colecciones FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO public.colecciones (nombre, orden) VALUES
  ('Almuerzos y tapeos', 1),
  ('Tardes y antojos', 2),
  ('Cenas y tragos', 3),
  ('Delivery y take away', 4),
  ('Playa y Aire Libre', 5),
  ('Juegos y Entretenimiento', 6),
  ('Ropa y accesorios', 7),
  ('Relax y Belleza', 8),
  ('Estadías', 9),
  ('Eventos', 10),
  ('Mercados y kioscos', 11),
  ('Servicios', 12);

CREATE TABLE public.comercio_colecciones (
  comercio_id uuid NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
  coleccion_id uuid NOT NULL REFERENCES public.colecciones(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comercio_id, coleccion_id)
);

CREATE INDEX comercio_colecciones_coleccion_idx ON public.comercio_colecciones (coleccion_id);

GRANT SELECT ON public.comercio_colecciones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comercio_colecciones TO authenticated;
GRANT ALL ON public.comercio_colecciones TO service_role;

ALTER TABLE public.comercio_colecciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY comercio_colecciones_public_read ON public.comercio_colecciones FOR SELECT USING (true);
CREATE POLICY comercio_colecciones_admin_write ON public.comercio_colecciones FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE public.comercios
  ADD COLUMN es_indoor boolean NOT NULL DEFAULT false,
  ADD COLUMN hero_alcance_local boolean NOT NULL DEFAULT false;

ALTER TABLE public.cupones
  ADD COLUMN es_favorita_home boolean NOT NULL DEFAULT false;