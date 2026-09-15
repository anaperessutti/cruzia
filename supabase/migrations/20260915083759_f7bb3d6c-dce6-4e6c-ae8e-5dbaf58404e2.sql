CREATE TABLE public.interacciones_comercio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id uuid NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
  device_id uuid,
  fecha timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.interacciones_comercio TO anon, authenticated;
GRANT SELECT ON public.interacciones_comercio TO authenticated;
GRANT ALL ON public.interacciones_comercio TO service_role;

ALTER TABLE public.interacciones_comercio ENABLE ROW LEVEL SECURITY;

CREATE POLICY interacciones_insert_anon ON public.interacciones_comercio
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY interacciones_read_admin ON public.interacciones_comercio
  FOR SELECT TO authenticated USING (is_admin());

CREATE INDEX idx_interacciones_comercio_fecha ON public.interacciones_comercio (comercio_id, fecha);

ALTER TABLE public.metricas_mensuales
  ADD COLUMN IF NOT EXISTS total_interacciones integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.recalcular_metricas_mensuales(p_mes date DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
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
  ), inter AS (
    SELECT comercio_id,
           date_trunc('month', fecha)::date AS mes,
           count(*)::int AS total
    FROM public.interacciones_comercio
    WHERE v_mes IS NULL
       OR (fecha >= v_mes AND fecha < (v_mes + interval '1 month'))
    GROUP BY 1, 2
  ), todos AS (
    SELECT comercio_id, mes FROM agg
    UNION
    SELECT comercio_id, mes FROM inter
  ), ins AS (
    INSERT INTO public.metricas_mensuales (comercio_id, mes, total_redenciones, cupon_top_id, total_interacciones)
    SELECT t.comercio_id, t.mes,
           COALESCE(a.total, 0),
           a.cupon_top_id,
           COALESCE(i.total, 0)
    FROM todos t
    LEFT JOIN agg a ON a.comercio_id = t.comercio_id AND a.mes = t.mes
    LEFT JOIN inter i ON i.comercio_id = t.comercio_id AND i.mes = t.mes
    ON CONFLICT (comercio_id, mes) DO UPDATE
      SET total_redenciones = EXCLUDED.total_redenciones,
          cupon_top_id = EXCLUDED.cupon_top_id,
          total_interacciones = EXCLUDED.total_interacciones,
          updated_at = now()
    RETURNING 1
  )
  SELECT count(*)::int INTO v_filas FROM ins;
  RETURN v_filas;
END;
$fn$;

REVOKE ALL ON FUNCTION public.recalcular_metricas_mensuales(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recalcular_metricas_mensuales(date) TO authenticated, service_role;