DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='giftbox_pedidos' AND cmd='INSERT' LOOP
    EXECUTE format('DROP POLICY %I ON public.giftbox_pedidos', p.policyname);
  END LOOP; END $$;
REVOKE INSERT ON public.giftbox_pedidos FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.crear_pedido_giftbox(
  p_item_ids uuid[], p_formato giftbox_formato, p_nombre text, p_whatsapp text, p_device_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ids uuid[]; v_items jsonb; v_total numeric; v_count int; v_id uuid;
BEGIN
  SELECT array_agg(DISTINCT x) INTO v_ids FROM unnest(p_item_ids) x;
  IF v_ids IS NULL OR array_length(v_ids,1) = 0 OR array_length(v_ids,1) > 50 THEN
    RAISE EXCEPTION 'Seleccioná al menos una experiencia';
  END IF;
  IF coalesce(length(trim(p_nombre)),0) = 0 OR length(p_nombre) > 120
     OR coalesce(length(trim(p_whatsapp)),0) = 0 OR length(p_whatsapp) > 40 THEN
    RAISE EXCEPTION 'Datos de contacto inválidos';
  END IF;
  SELECT count(*), coalesce(sum(precio),0),
         jsonb_agg(jsonb_build_object('id',id,'nombre',nombre,'categoria',categoria,'precio',precio))
    INTO v_count, v_total, v_items
    FROM giftbox_items WHERE id = ANY(v_ids) AND activo = true;
  IF v_count <> array_length(v_ids,1) THEN
    RAISE EXCEPTION 'Alguna experiencia ya no está disponible';
  END IF;
  INSERT INTO giftbox_pedidos (items_seleccionados, formato, precio_total, contacto_nombre, contacto_whatsapp, device_id)
  VALUES (v_items, p_formato, v_total, trim(p_nombre), trim(p_whatsapp), p_device_id)
  RETURNING id INTO v_id;
  RETURN jsonb_build_object('ok', true, 'total', v_total);
END $$;
REVOKE ALL ON FUNCTION public.crear_pedido_giftbox(uuid[], giftbox_formato, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.crear_pedido_giftbox(uuid[], giftbox_formato, text, text, uuid) TO anon, authenticated;