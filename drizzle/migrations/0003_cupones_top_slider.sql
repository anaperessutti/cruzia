ALTER TABLE public.cupones ADD COLUMN IF NOT EXISTS es_top_slider boolean NOT NULL DEFAULT false;

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
      WHERE comercio_id = NEW.comercio_id
        AND id <> NEW.id
        AND es_top_slider;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_unico_top_slider ON public.cupones;
CREATE TRIGGER trg_unico_top_slider
AFTER INSERT OR UPDATE OF es_top_slider ON public.cupones
FOR EACH ROW
WHEN (NEW.es_top_slider)
EXECUTE FUNCTION public.unico_top_slider_por_comercio();