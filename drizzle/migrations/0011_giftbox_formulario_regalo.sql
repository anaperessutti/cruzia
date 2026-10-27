ALTER TABLE public.giftbox_pedidos
  ADD COLUMN IF NOT EXISTS agasajado_nombre text,
  ADD COLUMN IF NOT EXISTS agasajado_whatsapp text,
  ADD COLUMN IF NOT EXISTS ocasion text,
  ADD COLUMN IF NOT EXISTS dedicatoria text,
  ADD COLUMN IF NOT EXISTS remitente_firma text,
  ADD COLUMN IF NOT EXISTS fecha_regalo date,
  ADD COLUMN IF NOT EXISTS direccion_entrega text,
  ADD COLUMN IF NOT EXISTS datos_completados_at timestamptz;

CREATE OR REPLACE FUNCTION public.giftbox_formulario_info(p_token uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN NOT coalesce((SELECT gift_box_visible FROM configuracion_global LIMIT 1), false) THEN jsonb_build_object('estado','oculta')
    ELSE coalesce((
      SELECT jsonb_build_object(
        'estado', CASE WHEN p.estado IN ('entregado','cancelado') THEN 'cerrado' ELSE 'ok' END,
        'nombre', split_part(trim(coalesce(p.contacto_nombre,'')), ' ', 1),
        'experiencias', coalesce((SELECT jsonb_agg(e->>'nombre') FROM jsonb_array_elements(p.items_seleccionados) e), '[]'::jsonb),
        'formato', p.formato,
        'completado', p.datos_completados_at IS NOT NULL)
      FROM giftbox_pedidos p WHERE p.token_formulario = p_token
    ), jsonb_build_object('estado','inexistente'))
  END
$$;

CREATE OR REPLACE FUNCTION public.giftbox_guardar_datos(
  p_token uuid, p_agasajado_nombre text, p_agasajado_whatsapp text, p_ocasion text,
  p_dedicatoria text, p_remitente_firma text, p_fecha_regalo date, p_direccion_entrega text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v giftbox_pedidos%ROWTYPE;
BEGIN
  IF NOT coalesce((SELECT gift_box_visible FROM configuracion_global LIMIT 1), false) THEN
    RAISE EXCEPTION 'Gift Box no disponible'; END IF;
  SELECT * INTO v FROM giftbox_pedidos WHERE token_formulario = p_token FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido inexistente'; END IF;
  IF v.estado IN ('entregado','cancelado') THEN RAISE EXCEPTION 'El pedido ya no se puede editar'; END IF;
  p_agasajado_nombre := nullif(trim(p_agasajado_nombre),'');
  p_agasajado_whatsapp := nullif(trim(p_agasajado_whatsapp),'');
  p_dedicatoria := nullif(trim(p_dedicatoria),'');
  p_remitente_firma := nullif(trim(p_remitente_firma),'');
  p_direccion_entrega := nullif(trim(p_direccion_entrega),'');
  IF p_agasajado_nombre IS NULL OR length(p_agasajado_nombre) > 80 THEN RAISE EXCEPTION 'Nombre inválido'; END IF;
  IF length(p_agasajado_whatsapp) > 30 THEN RAISE EXCEPTION 'WhatsApp inválido'; END IF;
  IF p_ocasion NOT IN ('cumpleaños','aniversario','agradecimiento','otra') THEN RAISE EXCEPTION 'Ocasión inválida'; END IF;
  IF length(p_dedicatoria) > 400 THEN RAISE EXCEPTION 'Dedicatoria demasiado larga'; END IF;
  IF p_remitente_firma IS NULL OR length(p_remitente_firma) > 80 THEN RAISE EXCEPTION 'Firma inválida'; END IF;
  IF p_fecha_regalo IS NULL THEN RAISE EXCEPTION 'Falta la fecha'; END IF;
  IF length(p_direccion_entrega) > 200 THEN RAISE EXCEPTION 'Dirección demasiado larga'; END IF;
  IF v.formato = 'fisico' AND p_direccion_entrega IS NULL THEN RAISE EXCEPTION 'Falta la dirección de entrega'; END IF;
  UPDATE giftbox_pedidos SET agasajado_nombre = p_agasajado_nombre, agasajado_whatsapp = p_agasajado_whatsapp,
    ocasion = p_ocasion, dedicatoria = p_dedicatoria, remitente_firma = p_remitente_firma,
    fecha_regalo = p_fecha_regalo,
    direccion_entrega = CASE WHEN v.formato = 'fisico' THEN p_direccion_entrega ELSE NULL END,
    datos_completados_at = now()
  WHERE id = v.id;
  RETURN jsonb_build_object('ok', true);
END $$;

REVOKE ALL ON FUNCTION public.giftbox_formulario_info(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.giftbox_guardar_datos(uuid,text,text,text,text,text,date,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.giftbox_formulario_info(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.giftbox_guardar_datos(uuid,text,text,text,text,text,date,text) TO anon, authenticated;