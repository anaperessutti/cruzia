ALTER TABLE public.cupones ADD COLUMN IF NOT EXISTS primera_activacion timestamptz;

UPDATE public.cupones SET primera_activacion = created_at WHERE activo = true AND primera_activacion IS NULL;

CREATE OR REPLACE FUNCTION public.enforce_limite_mensual_cupones()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_max integer; v_usados integer;
BEGIN
  IF NEW.activo IS NOT TRUE OR NEW.primera_activacion IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.max_cupones_activos INTO v_max
  FROM public.comercios c JOIN public.planes p ON p.id = c.plan_id
  WHERE c.id = NEW.comercio_id;

  IF v_max IS NULL THEN
    RAISE EXCEPTION 'COMERCIO_SIN_PLAN';
  END IF;

  SELECT count(*)::int INTO v_usados
  FROM public.cupones
  WHERE comercio_id = NEW.comercio_id
    AND id <> NEW.id
    AND primera_activacion >= date_trunc('month', now())
    AND primera_activacion < date_trunc('month', now()) + interval '1 month';

  IF v_usados >= v_max THEN
    RAISE EXCEPTION 'LIMITE_MENSUAL_PROMOS: % de %', v_usados, v_max;
  END IF;

  NEW.primera_activacion := now();
  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.enforce_limite_mensual_cupones() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_cupones_limite_mensual ON public.cupones;
CREATE TRIGGER trg_cupones_limite_mensual
BEFORE INSERT OR UPDATE ON public.cupones
FOR EACH ROW EXECUTE FUNCTION public.enforce_limite_mensual_cupones();

CREATE OR REPLACE FUNCTION public.cupos_promos_mes(p_comercio_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_max integer; v_usados integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'NO_AUTORIZADO';
  END IF;
  SELECT p.max_cupones_activos INTO v_max
  FROM public.comercios c JOIN public.planes p ON p.id = c.plan_id
  WHERE c.id = p_comercio_id;
  SELECT count(*)::int INTO v_usados
  FROM public.cupones
  WHERE comercio_id = p_comercio_id
    AND primera_activacion >= date_trunc('month', now())
    AND primera_activacion < date_trunc('month', now()) + interval '1 month';
  RETURN jsonb_build_object('usados', COALESCE(v_usados, 0), 'max', COALESCE(v_max, 0));
END; $$;

REVOKE EXECUTE ON FUNCTION public.cupos_promos_mes(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cupos_promos_mes(uuid) TO authenticated, service_role;