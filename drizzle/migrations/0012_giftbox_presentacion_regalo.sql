ALTER TABLE public.giftbox_items
  ADD COLUMN IF NOT EXISTS como_canjear text,
  ADD COLUMN IF NOT EXISTS condiciones text;

CREATE TABLE public.giftbox_presentacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unico boolean NOT NULL DEFAULT true UNIQUE CHECK (unico),
  imagen_portada text,
  logo text,
  imagen_fondo text,
  titulo_bienvenida text NOT NULL DEFAULT '¡{agasajado}, tenés un regalo!',
  texto_como_canjear text,
  condiciones_generales text,
  contacto_soporte text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.giftbox_presentacion TO anon, authenticated;
GRANT INSERT, UPDATE ON public.giftbox_presentacion TO authenticated;
GRANT ALL ON public.giftbox_presentacion TO service_role;
ALTER TABLE public.giftbox_presentacion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Presentacion lectura publica" ON public.giftbox_presentacion FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Presentacion admin inserta" ON public.giftbox_presentacion FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Presentacion admin edita" ON public.giftbox_presentacion FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER giftbox_presentacion_updated BEFORE UPDATE ON public.giftbox_presentacion FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.giftbox_presentacion (unico) VALUES (true);

CREATE OR REPLACE FUNCTION public.generar_codigo_canje()
RETURNS text LANGUAGE plpgsql VOLATILE SET search_path = public AS $$
DECLARE abc text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; v text; i int;
BEGIN
  LOOP
    v := '';
    FOR i IN 1..8 LOOP v := v || substr(abc, 1 + floor(random() * length(abc))::int, 1); END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.giftbox_pedidos WHERE codigo_canje = v);
  END LOOP;
  RETURN v;
END $$;

ALTER TABLE public.giftbox_pedidos
  ADD COLUMN IF NOT EXISTS codigo_canje text,
  ADD COLUMN IF NOT EXISTS canjes jsonb NOT NULL DEFAULT '{}'::jsonb;
UPDATE public.giftbox_pedidos SET codigo_canje = public.generar_codigo_canje() WHERE codigo_canje IS NULL;
ALTER TABLE public.giftbox_pedidos ALTER COLUMN codigo_canje SET DEFAULT public.generar_codigo_canje();
ALTER TABLE public.giftbox_pedidos ALTER COLUMN codigo_canje SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS giftbox_pedidos_codigo_canje_key ON public.giftbox_pedidos (codigo_canje);

CREATE OR REPLACE FUNCTION public.giftbox_regalo_info(p_token uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.giftbox_pedidos; v_exp jsonb;
BEGIN
  SELECT * INTO p FROM public.giftbox_pedidos WHERE token_regalo = p_token;
  IF NOT FOUND THEN RETURN jsonb_build_object('estado', 'inexistente'); END IF;
  IF p.estado = 'cancelado' THEN RETURN jsonb_build_object('estado', 'cancelado'); END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', sel.id,
      'titulo', coalesce(gi.nombre, sel.nombre),
      'lugar', coalesce(nullif(trim(gi.lugar), ''), c.nombre),
      'direccion', coalesce(nullif(trim(gi.direccion), ''), c.direccion),
      'horarios', coalesce(nullif(trim(gi.horarios), ''), c.horarios),
      'lat', coalesce(gi.lat::float8, c.lat),
      'lng', coalesce(gi.lng::float8, c.lng),
      'vigencia_inicio', gi.vigencia_inicio,
      'vigencia_fin', gi.vigencia_fin,
      'descripcion', coalesce(nullif(trim(gi.descripcion), ''), c.descripcion),
      'como_canjear', gi.como_canjear,
      'condiciones', gi.condiciones,
      'canjeada_at', p.canjes ->> sel.id
    ) ORDER BY sel.ord), '[]'::jsonb)
  INTO v_exp
  FROM jsonb_array_elements(p.items_seleccionados) WITH ORDINALITY AS e(j, ord)
  CROSS JOIN LATERAL (SELECT e.j ->> 'id' AS id, e.j ->> 'nombre' AS nombre, e.ord AS ord) sel
  LEFT JOIN public.giftbox_items gi ON gi.id::text = sel.id
  LEFT JOIN public.comercios c ON c.id = gi.comercio_id;
  RETURN jsonb_build_object(
    'estado', 'ok',
    'completado', p.datos_completados_at IS NOT NULL,
    'agasajado', p.agasajado_nombre,
    'firma', p.remitente_firma,
    'ocasion', p.ocasion,
    'dedicatoria', p.dedicatoria,
    'formato', p.formato,
    'codigo', p.codigo_canje,
    'experiencias', v_exp
  );
END $$;
REVOKE ALL ON FUNCTION public.giftbox_regalo_info(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.giftbox_regalo_info(uuid) TO anon, authenticated;