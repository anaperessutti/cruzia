DROP INDEX IF EXISTS public.uq_metricas_comercio_mes;

CREATE OR REPLACE FUNCTION public.recalcular_metricas_mensuales(p_mes date DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_filas INTEGER; v_mes DATE := CASE WHEN p_mes IS NULL THEN NULL ELSE date_trunc('month', p_mes)::date END;
BEGIN
  WITH base AS (
    SELECT comercio_id,
           date_trunc('month', fecha_redencion)::date AS mes,
           cupon_id,
           count(*) AS n
    FROM public.redenciones
    WHERE v_mes IS NULL
       OR (fecha_redencion >= v_mes AND fecha_redencion < (v_mes + interval '1 month'))
    GROUP BY 1, 2, 3
  ), agg AS (
    SELECT comercio_id, mes, sum(n)::int AS total,
           (array_agg(cupon_id ORDER BY n DESC, cupon_id))[1] AS cupon_top_id
    FROM base GROUP BY comercio_id, mes
  ), ins AS (
    INSERT INTO public.metricas_mensuales (comercio_id, mes, total_redenciones, cupon_top_id)
    SELECT comercio_id, mes, total, cupon_top_id FROM agg
    ON CONFLICT (comercio_id, mes) DO UPDATE
      SET total_redenciones = EXCLUDED.total_redenciones,
          cupon_top_id = EXCLUDED.cupon_top_id,
          updated_at = now()
    RETURNING 1
  )
  SELECT count(*)::int INTO v_filas FROM ins;
  RETURN v_filas;
END; $function$;

REVOKE ALL ON FUNCTION public.recalcular_metricas_mensuales(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recalcular_metricas_mensuales(date) TO authenticated, service_role;

SELECT cron.unschedule('recalcular_metricas_mensuales_diario');

SELECT cron.schedule(
  'recalcular_metricas_mensuales_mensual',
  '15 4 1 * *',
  $$SELECT public.recalcular_metricas_mensuales((date_trunc('month', now() AT TIME ZONE 'America/Argentina/Buenos_Aires') - interval '1 month')::date);$$
);