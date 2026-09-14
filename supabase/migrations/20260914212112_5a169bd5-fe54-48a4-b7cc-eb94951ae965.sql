-- ============ 1) BOOTSTRAP PRIMER ADMIN ============
GRANT INSERT ON public.admins TO authenticated;

CREATE OR REPLACE FUNCTION public.admins_vacio()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.admins);
$$;

CREATE POLICY "admins_bootstrap_insert" ON public.admins
  FOR INSERT TO authenticated
  WITH CHECK (public.admins_vacio() AND user_id = auth.uid() AND rol = 'super_admin');

-- ============ 2) METRICAS MENSUALES ============
CREATE UNIQUE INDEX IF NOT EXISTS uq_metricas_comercio_mes
  ON public.metricas_mensuales(comercio_id, mes);

CREATE OR REPLACE FUNCTION public.recalcular_metricas_mensuales()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_filas INTEGER;
BEGIN
  WITH base AS (
    SELECT comercio_id,
           date_trunc('month', fecha_redencion)::date AS mes,
           cupon_id,
           count(*) AS n
    FROM public.redenciones
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
END; $$;

REVOKE ALL ON FUNCTION public.recalcular_metricas_mensuales() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recalcular_metricas_mensuales() TO authenticated, service_role;

-- Ejecución diaria automática
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
SELECT cron.unschedule('recalcular_metricas_mensuales_diario')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'recalcular_metricas_mensuales_diario');
SELECT cron.schedule(
  'recalcular_metricas_mensuales_diario',
  '15 4 * * *',
  $cron$SELECT public.recalcular_metricas_mensuales();$cron$
);