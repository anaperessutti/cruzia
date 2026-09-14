-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin');
CREATE TYPE public.modalidad_cupon AS ENUM ('presencial', 'whatsapp');
CREATE TYPE public.giftbox_categoria AS ENUM ('Noche', 'Sabor', 'Relax');
CREATE TYPE public.giftbox_formato AS ENUM ('digital', 'fisico');
CREATE TYPE public.giftbox_estado AS ENUM ('pendiente', 'confirmado', 'entregado', 'cancelado');
CREATE TYPE public.fase_tipo AS ENUM ('actual', 'historial');

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ ADMINS (roles en tabla separada) ============
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  rol public.app_role NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, rol)
);
GRANT SELECT ON public.admins TO authenticated;
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = _user_id AND rol = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

CREATE POLICY "admins_select_self_or_admin" ON public.admins
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "admins_manage_super" ON public.admins
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ============ PLANES ============
CREATE TABLE public.planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  aparece_en_grilla BOOLEAN NOT NULL DEFAULT true,
  aparece_en_hero_banner BOOLEAN NOT NULL DEFAULT false,
  tiene_modulo_promocion BOOLEAN NOT NULL DEFAULT false,
  puede_reservar_whatsapp BOOLEAN NOT NULL DEFAULT false,
  max_cupones_activos INTEGER NOT NULL DEFAULT 0,
  prioridad_orden INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.planes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planes TO authenticated;
GRANT ALL ON public.planes TO service_role;
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planes_public_read" ON public.planes FOR SELECT USING (true);
CREATE POLICY "planes_admin_write" ON public.planes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_planes_updated BEFORE UPDATE ON public.planes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ LOCALIDADES ============
CREATE TABLE public.localidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.localidades TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.localidades TO authenticated;
GRANT ALL ON public.localidades TO service_role;
ALTER TABLE public.localidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "localidades_public_read" ON public.localidades FOR SELECT USING (true);
CREATE POLICY "localidades_admin_write" ON public.localidades FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ RUBROS ============
CREATE TABLE public.rubros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rubros TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rubros TO authenticated;
GRANT ALL ON public.rubros TO service_role;
ALTER TABLE public.rubros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rubros_public_read" ON public.rubros FOR SELECT USING (true);
CREATE POLICY "rubros_admin_write" ON public.rubros FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ COMERCIOS ============
CREATE TABLE public.comercios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.planes(id) ON DELETE RESTRICT,
  localidad_id UUID REFERENCES public.localidades(id) ON DELETE SET NULL,
  rubro_id UUID REFERENCES public.rubros(id) ON DELETE SET NULL,
  descripcion TEXT,
  direccion TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  horarios TEXT,
  whatsapp TEXT,
  redes_sociales JSONB NOT NULL DEFAULT '{}'::jsonb,
  galeria TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comercios_plan ON public.comercios(plan_id);
CREATE INDEX idx_comercios_localidad ON public.comercios(localidad_id);
CREATE INDEX idx_comercios_rubro ON public.comercios(rubro_id);
GRANT SELECT ON public.comercios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comercios TO authenticated;
GRANT ALL ON public.comercios TO service_role;
ALTER TABLE public.comercios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comercios_public_read_activos" ON public.comercios FOR SELECT USING (activo = true);
CREATE POLICY "comercios_admin_read_all" ON public.comercios FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "comercios_admin_write" ON public.comercios FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_comercios_updated BEFORE UPDATE ON public.comercios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CUPONES ============
CREATE TABLE public.cupones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id UUID NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  flyer_url TEXT,
  vigencia_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  vigencia_fin DATE NOT NULL,
  modalidad public.modalidad_cupon NOT NULL DEFAULT 'presencial',
  cooldown_dias INTEGER NOT NULL DEFAULT 7 CHECK (cooldown_dias >= 0),
  qr_codigo TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cupones_comercio ON public.cupones(comercio_id);
GRANT SELECT ON public.cupones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cupones TO authenticated;
GRANT ALL ON public.cupones TO service_role;
ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cupones_public_read_vigentes" ON public.cupones FOR SELECT
  USING (activo = true AND CURRENT_DATE BETWEEN vigencia_inicio AND vigencia_fin);
CREATE POLICY "cupones_admin_read_all" ON public.cupones FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "cupones_admin_write" ON public.cupones FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_cupones_updated BEFORE UPDATE ON public.cupones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ REDENCIONES ============
CREATE TABLE public.redenciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cupon_id UUID NOT NULL REFERENCES public.cupones(id) ON DELETE CASCADE,
  comercio_id UUID NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
  device_id UUID NOT NULL,
  fecha_redencion TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_redenciones_device_cupon ON public.redenciones(device_id, cupon_id, fecha_redencion DESC);
CREATE INDEX idx_redenciones_comercio_fecha ON public.redenciones(comercio_id, fecha_redencion DESC);
GRANT SELECT ON public.redenciones TO authenticated;
GRANT ALL ON public.redenciones TO service_role;
ALTER TABLE public.redenciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "redenciones_admin_read" ON public.redenciones FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "redenciones_admin_write" ON public.redenciones FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Barrera dura: ninguna inserción puede saltear el cooldown
CREATE OR REPLACE FUNCTION public.enforce_cooldown_redencion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cooldown INTEGER; v_ultima TIMESTAMPTZ;
BEGIN
  SELECT cooldown_dias INTO v_cooldown FROM public.cupones WHERE id = NEW.cupon_id;
  IF v_cooldown IS NULL THEN RAISE EXCEPTION 'Cupón inexistente'; END IF;
  SELECT max(fecha_redencion) INTO v_ultima FROM public.redenciones
    WHERE cupon_id = NEW.cupon_id AND device_id = NEW.device_id;
  IF v_ultima IS NOT NULL AND v_ultima > now() - (v_cooldown || ' days')::interval THEN
    RAISE EXCEPTION 'COOLDOWN_ACTIVO: el cupón no puede reutilizarse todavía';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_redenciones_cooldown BEFORE INSERT ON public.redenciones
  FOR EACH ROW EXECUTE FUNCTION public.enforce_cooldown_redencion();

-- Consulta server-side: ¿puede activar?
CREATE OR REPLACE FUNCTION public.puede_activar_cupon(p_cupon_id UUID, p_device_id UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE c RECORD; v_ultima TIMESTAMPTZ; v_disp TIMESTAMPTZ;
BEGIN
  SELECT * INTO c FROM public.cupones WHERE id = p_cupon_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('permitido', false, 'motivo', 'CUPON_INEXISTENTE'); END IF;
  IF NOT c.activo OR CURRENT_DATE < c.vigencia_inicio OR CURRENT_DATE > c.vigencia_fin THEN
    RETURN jsonb_build_object('permitido', false, 'motivo', 'CUPON_NO_VIGENTE');
  END IF;
  SELECT max(fecha_redencion) INTO v_ultima FROM public.redenciones
    WHERE cupon_id = p_cupon_id AND device_id = p_device_id;
  IF v_ultima IS NOT NULL THEN
    v_disp := v_ultima + (c.cooldown_dias || ' days')::interval;
    IF v_disp > now() THEN
      RETURN jsonb_build_object('permitido', false, 'motivo', 'COOLDOWN_ACTIVO',
        'disponible_desde', v_disp,
        'dias_restantes', CEIL(EXTRACT(EPOCH FROM (v_disp - now())) / 86400));
    END IF;
  END IF;
  RETURN jsonb_build_object('permitido', true);
END; $$;

-- Canje atómico server-side
CREATE OR REPLACE FUNCTION public.redimir_cupon(p_cupon_id UUID, p_device_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_check JSONB; v_comercio UUID; v_id UUID;
BEGIN
  v_check := public.puede_activar_cupon(p_cupon_id, p_device_id);
  IF NOT (v_check->>'permitido')::boolean THEN RETURN v_check; END IF;
  SELECT comercio_id INTO v_comercio FROM public.cupones WHERE id = p_cupon_id;
  INSERT INTO public.redenciones (cupon_id, comercio_id, device_id)
  VALUES (p_cupon_id, v_comercio, p_device_id) RETURNING id INTO v_id;
  RETURN jsonb_build_object('permitido', true, 'redencion_id', v_id, 'fecha_redencion', now());
END; $$;

REVOKE ALL ON FUNCTION public.redimir_cupon(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.puede_activar_cupon(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redimir_cupon(UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.puede_activar_cupon(UUID, UUID) TO anon, authenticated, service_role;

-- ============ METRICAS MENSUALES ============
CREATE TABLE public.metricas_mensuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id UUID NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
  mes DATE NOT NULL,
  total_redenciones INTEGER NOT NULL DEFAULT 0,
  cupon_top_id UUID REFERENCES public.cupones(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comercio_id, mes)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metricas_mensuales TO authenticated;
GRANT ALL ON public.metricas_mensuales TO service_role;
ALTER TABLE public.metricas_mensuales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metricas_admin_all" ON public.metricas_mensuales FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_metricas_updated BEFORE UPDATE ON public.metricas_mensuales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ GIFT BOX ============
CREATE TABLE public.giftbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria public.giftbox_categoria NOT NULL,
  nombre TEXT NOT NULL,
  precio NUMERIC(12,2) NOT NULL DEFAULT 0,
  comercio_id UUID REFERENCES public.comercios(id) ON DELETE SET NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.giftbox_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.giftbox_items TO authenticated;
GRANT ALL ON public.giftbox_items TO service_role;
ALTER TABLE public.giftbox_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "giftbox_items_public_read" ON public.giftbox_items FOR SELECT USING (activo = true);
CREATE POLICY "giftbox_items_admin_all" ON public.giftbox_items FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_giftbox_items_updated BEFORE UPDATE ON public.giftbox_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.giftbox_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items_seleccionados JSONB NOT NULL DEFAULT '[]'::jsonb,
  formato public.giftbox_formato NOT NULL DEFAULT 'digital',
  precio_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado public.giftbox_estado NOT NULL DEFAULT 'pendiente',
  device_id UUID,
  contacto_nombre TEXT,
  contacto_whatsapp TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.giftbox_pedidos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.giftbox_pedidos TO authenticated;
GRANT ALL ON public.giftbox_pedidos TO service_role;
ALTER TABLE public.giftbox_pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "giftbox_pedidos_public_insert" ON public.giftbox_pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "giftbox_pedidos_admin_all" ON public.giftbox_pedidos FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ HUELLA SOLIDARIA ============
CREATE TABLE public.huella_solidaria_fases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fotos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo public.fase_tipo NOT NULL DEFAULT 'actual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.huella_solidaria_fases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.huella_solidaria_fases TO authenticated;
GRANT ALL ON public.huella_solidaria_fases TO service_role;
ALTER TABLE public.huella_solidaria_fases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "huella_public_read" ON public.huella_solidaria_fases FOR SELECT USING (true);
CREATE POLICY "huella_admin_all" ON public.huella_solidaria_fases FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_huella_updated BEFORE UPDATE ON public.huella_solidaria_fases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.postulaciones_solidarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  causa TEXT NOT NULL,
  localidad TEXT,
  descripcion TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.postulaciones_solidarias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postulaciones_solidarias TO authenticated;
GRANT ALL ON public.postulaciones_solidarias TO service_role;
ALTER TABLE public.postulaciones_solidarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "postulaciones_public_insert" ON public.postulaciones_solidarias FOR INSERT WITH CHECK (true);
CREATE POLICY "postulaciones_admin_all" ON public.postulaciones_solidarias FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ LEADS COMERCIOS ============
CREATE TABLE public.leads_comercios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_local TEXT NOT NULL,
  rubro TEXT,
  localidad TEXT,
  whatsapp TEXT NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads_comercios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads_comercios TO authenticated;
GRANT ALL ON public.leads_comercios TO service_role;
ALTER TABLE public.leads_comercios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_public_insert" ON public.leads_comercios FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_admin_all" ON public.leads_comercios FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ CONFIGURACION GLOBAL ============
CREATE TABLE public.configuracion_global (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_box_visible BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.configuracion_global TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracion_global TO authenticated;
GRANT ALL ON public.configuracion_global TO service_role;
ALTER TABLE public.configuracion_global ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_public_read" ON public.configuracion_global FOR SELECT USING (true);
CREATE POLICY "config_admin_all" ON public.configuracion_global FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_config_updated BEFORE UPDATE ON public.configuracion_global
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SEEDS ============
INSERT INTO public.planes (nombre, aparece_en_grilla, aparece_en_hero_banner, tiene_modulo_promocion, puede_reservar_whatsapp, max_cupones_activos, prioridad_orden) VALUES
  ('Premium', true, true, true, true, 10, 1),
  ('Pro', true, false, true, true, 5, 2),
  ('Básico', true, false, false, false, 0, 3);

INSERT INTO public.localidades (nombre) VALUES
  ('San Clemente del Tuyú'), ('Las Toninas'), ('Santa Teresita'), ('Mar del Tuyú'),
  ('Costa del Este'), ('Aguas Verdes'), ('La Lucila del Mar'), ('San Bernardo'),
  ('Mar de Ajó'), ('Nueva Atlantis'), ('Punta Médanos');

INSERT INTO public.rubros (nombre) VALUES
  ('Gastronomía'), ('Alojamiento'), ('Entretenimiento y Playa'),
  ('Eventos y Noche'), ('Indumentaria y Compras'), ('Servicios');

INSERT INTO public.configuracion_global (gift_box_visible) VALUES (false);