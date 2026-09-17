-- 1) Historial de activaciones
CREATE TABLE public.cupon_activaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cupon_id uuid NOT NULL REFERENCES public.cupones(id) ON DELETE CASCADE,
  comercio_id uuid NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
  fecha timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cupon_activaciones TO authenticated;
GRANT ALL ON public.cupon_activaciones TO service_role;

ALTER TABLE public.cupon_activaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY cupon_activaciones_admin_read ON public.cupon_activaciones
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE INDEX idx_cupon_activaciones_comercio_fecha
  ON public.cupon_activaciones (comercio_id, fecha);
CREATE INDEX idx_cupon_activaciones_cupon_fecha
  ON public.cupon_activaciones (cupon_id, fecha);

-- Backfill: los cupones activados este mes según el modelo anterior
INSERT INTO public.cupon_activaciones (cupon_id, comercio_id, fecha)
SELECT id, comercio_id, primera_activacion
FROM public.cupones
WHERE primera_activacion IS NOT NULL
  AND primera_activacion >= date_trunc('month', now());

-- 2) Fuera el modelo anterior (la columna queda sin uso, ya no se lee ni se escribe)
DROP TRIGGER IF EXISTS trg_cupones_limite_mensual ON public.cupones;
DROP FUNCTION IF EXISTS public.enforce_limite_mensual_cupones();

-- 3) Validación + registro del evento de activación
CREATE OR REPLACE FUNCTION public.registrar_activacion_cupon()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_max integer; v_usados integer; v_inicio timestamptz := date_trunc('month', now());
BEGIN
  IF NEW.activo IS NOT TRUE THEN
    RETURN NULL;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.activo IS TRUE THEN
    RETURN NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.cupon_activaciones
    WHERE cupon_id = NEW.id AND fecha >= v_inicio
  ) THEN
    RETURN NULL;
  END IF;

  SELECT p.max_cupones_activos INTO v_max
  FROM public.comercios c JOIN public.planes p ON p.id = c.plan_id
  WHERE c.id = NEW.comercio_id;

  IF v_max IS NULL THEN
    RAISE EXCEPTION 'COMERCIO_SIN_PLAN';
  END IF;

  SELECT count(DISTINCT cupon_id)::int INTO v_usados
  FROM public.cupon_activaciones
  WHERE comercio_id = NEW.comercio_id AND fecha >= v_inicio;

  IF v_usados >= v_max THEN
    RAISE EXCEPTION 'LIMITE_MENSUAL_PROMOS: % de %', v_usados, v_max;
  END IF;

  INSERT INTO public.cupon_activaciones (cupon_id, comercio_id)
  VALUES (NEW.id, NEW.comercio_id);

  RETURN NULL;
END; $$;

REVOKE EXECUTE ON FUNCTION public.registrar_activacion_cupon() FROM PUBLIC;

CREATE TRIGGER trg_cupones_activacion
AFTER INSERT OR UPDATE OF activo ON public.cupones
FOR EACH ROW EXECUTE FUNCTION public.registrar_activacion_cupon();

-- 4) Cupos del mes para el CMS
CREATE OR REPLACE FUNCTION public.cupos_promos_mes(p_comercio_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
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
  SELECT count(DISTINCT cupon_id)::int INTO v_usados
  FROM public.cupon_activaciones
  WHERE comercio_id = p_comercio_id AND fecha >= date_trunc('month', now());
  RETURN jsonb_build_object('usados', COALESCE(v_usados, 0), 'max', COALESCE(v_max, 0));
END; $$;

REVOKE EXECUTE ON FUNCTION public.cupos_promos_mes(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cupos_promos_mes(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.cupon_activado_este_mes(p_cupon_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cupon_activaciones
    WHERE cupon_id = p_cupon_id AND fecha >= date_trunc('month', now())
  );
$$;

REVOKE EXECUTE ON FUNCTION public.cupon_activado_este_mes(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cupon_activado_este_mes(uuid) TO authenticated, service_role;

-- 5) Reset mensual automático
CREATE OR REPLACE FUNCTION public.reset_mensual_cupones()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_filas integer;
BEGIN
  UPDATE public.cupones SET activo = false WHERE activo = true;
  GET DIAGNOSTICS v_filas = ROW_COUNT;
  RETURN v_filas;
END; $$;

REVOKE EXECUTE ON FUNCTION public.reset_mensual_cupones() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_mensual_cupones() TO service_role;