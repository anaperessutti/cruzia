-- PARTE A: colecciones propias por promoción (opcional)
CREATE TABLE public.cupon_colecciones (
  cupon_id uuid NOT NULL REFERENCES public.cupones(id) ON DELETE CASCADE,
  coleccion_id uuid NOT NULL REFERENCES public.colecciones(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cupon_id, coleccion_id)
);
GRANT SELECT ON public.cupon_colecciones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cupon_colecciones TO authenticated;
GRANT ALL ON public.cupon_colecciones TO service_role;
ALTER TABLE public.cupon_colecciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY cupon_colecciones_public_read ON public.cupon_colecciones FOR SELECT USING (true);
CREATE POLICY cupon_colecciones_admin_write ON public.cupon_colecciones FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- PARTE B: eventos
CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  imagen_url text,
  fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin date NOT NULL,
  comercio_id uuid REFERENCES public.comercios(id) ON DELETE SET NULL,
  localidad_id uuid REFERENCES public.localidades(id) ON DELETE SET NULL,
  lat double precision,
  lng double precision,
  es_top_slider boolean NOT NULL DEFAULT false,
  hero_alcance_local boolean NOT NULL DEFAULT false,
  es_favorita_home boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.eventos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos TO authenticated;
GRANT ALL ON public.eventos TO service_role;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
-- Vigencia automática: los eventos vencidos dejan de mostrarse solos.
CREATE POLICY eventos_public_read_vigentes ON public.eventos FOR SELECT
  USING (CURRENT_DATE >= fecha_inicio AND CURRENT_DATE <= fecha_fin);
CREATE POLICY eventos_admin_read_all ON public.eventos FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY eventos_admin_write ON public.eventos FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER trg_eventos_updated_at BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.evento_colecciones (
  evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  coleccion_id uuid NOT NULL REFERENCES public.colecciones(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (evento_id, coleccion_id)
);
GRANT SELECT ON public.evento_colecciones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evento_colecciones TO authenticated;
GRANT ALL ON public.evento_colecciones TO service_role;
ALTER TABLE public.evento_colecciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY evento_colecciones_public_read ON public.evento_colecciones FOR SELECT USING (true);
CREATE POLICY evento_colecciones_admin_write ON public.evento_colecciones FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- PARTE C: un solo contenido postulado al Top Slider por comercio (promoción O evento)
CREATE OR REPLACE FUNCTION public.unico_top_slider_por_comercio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.es_top_slider THEN
    UPDATE public.cupones
      SET es_top_slider = false
      WHERE comercio_id = NEW.comercio_id AND id <> NEW.id AND es_top_slider;
    UPDATE public.eventos
      SET es_top_slider = false
      WHERE comercio_id = NEW.comercio_id AND es_top_slider;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.unico_top_slider_evento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Los eventos independientes (sin comercio) no tienen restricción de exclusividad.
  IF NEW.es_top_slider AND NEW.comercio_id IS NOT NULL THEN
    UPDATE public.cupones
      SET es_top_slider = false
      WHERE comercio_id = NEW.comercio_id AND es_top_slider;
    UPDATE public.eventos
      SET es_top_slider = false
      WHERE comercio_id = NEW.comercio_id AND id <> NEW.id AND es_top_slider;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_unico_top_slider_evento
  AFTER INSERT OR UPDATE OF es_top_slider ON public.eventos
  FOR EACH ROW WHEN (NEW.es_top_slider) EXECUTE FUNCTION public.unico_top_slider_evento();

REVOKE ALL ON FUNCTION public.unico_top_slider_evento() FROM anon, authenticated;