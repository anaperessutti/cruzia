CREATE TABLE IF NOT EXISTS public.clicks_whatsapp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cupon_id uuid NOT NULL REFERENCES public.cupones(id) ON DELETE CASCADE,
  comercio_id uuid NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
  device_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.clicks_whatsapp TO anon, authenticated;
GRANT SELECT ON public.clicks_whatsapp TO authenticated;
GRANT ALL ON public.clicks_whatsapp TO service_role;

ALTER TABLE public.clicks_whatsapp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clicks_whatsapp_insert_anon ON public.clicks_whatsapp;
CREATE POLICY clicks_whatsapp_insert_anon ON public.clicks_whatsapp
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS clicks_whatsapp_read_admin ON public.clicks_whatsapp;
CREATE POLICY clicks_whatsapp_read_admin ON public.clicks_whatsapp
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_clicks_whatsapp_comercio ON public.clicks_whatsapp (comercio_id, created_at);

-- Estado del cupón para un dispositivo, incluyendo el cooldown configurado.
CREATE OR REPLACE FUNCTION public.estado_cupon_device(p_cupon_id uuid, p_device_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v jsonb; v_cd integer;
BEGIN
  SELECT cooldown_dias INTO v_cd FROM public.cupones WHERE id = p_cupon_id;
  v := public.puede_activar_cupon(p_cupon_id, p_device_id);
  RETURN v || jsonb_build_object('cooldown_dias', COALESCE(v_cd, 0));
END; $$;

REVOKE ALL ON FUNCTION public.estado_cupon_device(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.estado_cupon_device(uuid, uuid) TO anon, authenticated, service_role;

-- Activación presencial: valida el QR físico del comercio y el cooldown en el servidor.
CREATE OR REPLACE FUNCTION public.activar_cupon_presencial(p_cupon_id uuid, p_device_id uuid, p_qr_codigo text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE c RECORD; v jsonb;
BEGIN
  SELECT * INTO c FROM public.cupones WHERE id = p_cupon_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('permitido', false, 'motivo', 'CUPON_INEXISTENTE');
  END IF;
  IF c.modalidad <> 'presencial'::public.modalidad_cupon THEN
    RETURN jsonb_build_object('permitido', false, 'motivo', 'MODALIDAD_INVALIDA');
  END IF;
  IF p_qr_codigo IS NULL OR lower(btrim(p_qr_codigo)) <> lower(btrim(c.qr_codigo)) THEN
    RETURN jsonb_build_object('permitido', false, 'motivo', 'QR_INVALIDO', 'cooldown_dias', c.cooldown_dias);
  END IF;
  v := public.redimir_cupon(p_cupon_id, p_device_id);
  RETURN v || jsonb_build_object('cooldown_dias', c.cooldown_dias);
END; $$;

REVOKE ALL ON FUNCTION public.activar_cupon_presencial(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activar_cupon_presencial(uuid, uuid, text) TO anon, authenticated, service_role;