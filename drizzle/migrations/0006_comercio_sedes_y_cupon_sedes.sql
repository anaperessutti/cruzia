CREATE TABLE public.comercio_sedes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id uuid NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
  direccion text,
  localidad_id uuid REFERENCES public.localidades(id) ON DELETE SET NULL,
  lat double precision,
  lng double precision,
  horarios text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.comercio_sedes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comercio_sedes TO authenticated;
GRANT ALL ON public.comercio_sedes TO service_role;

ALTER TABLE public.comercio_sedes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comercio_sedes_public_read" ON public.comercio_sedes
  FOR SELECT USING (true);
CREATE POLICY "comercio_sedes_admin_write" ON public.comercio_sedes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE INDEX comercio_sedes_comercio_idx ON public.comercio_sedes(comercio_id);

CREATE TRIGGER comercio_sedes_set_updated_at
  BEFORE UPDATE ON public.comercio_sedes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- sede_id NULL = la sede principal (los campos de direccion/localidad/horarios de comercios)
CREATE TABLE public.cupon_sedes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cupon_id uuid NOT NULL REFERENCES public.cupones(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES public.comercio_sedes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cupon_sedes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cupon_sedes TO authenticated;
GRANT ALL ON public.cupon_sedes TO service_role;

ALTER TABLE public.cupon_sedes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cupon_sedes_public_read" ON public.cupon_sedes
  FOR SELECT USING (true);
CREATE POLICY "cupon_sedes_admin_write" ON public.cupon_sedes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE UNIQUE INDEX cupon_sedes_unico_idx ON public.cupon_sedes(cupon_id, sede_id) WHERE sede_id IS NOT NULL;
CREATE UNIQUE INDEX cupon_sedes_principal_idx ON public.cupon_sedes(cupon_id) WHERE sede_id IS NULL;
