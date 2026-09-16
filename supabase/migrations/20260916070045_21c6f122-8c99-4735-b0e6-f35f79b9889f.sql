DROP POLICY IF EXISTS admins_bootstrap_insert ON public.admins;

-- Funciones internas: sin ejecución pública
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.recalcular_metricas_mensuales(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recalcular_metricas_mensuales(date) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.enforce_cooldown_redencion() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Lectura pública necesaria para la pantalla de configuración inicial
REVOKE EXECUTE ON FUNCTION public.admins_vacio() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admins_vacio() TO anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.existe_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.existe_admin() TO anon, authenticated, service_role;

-- Cupones sin login: se mantienen tal cual
GRANT EXECUTE ON FUNCTION public.puede_activar_cupon(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.redimir_cupon(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.activar_cupon_presencial(uuid, uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.estado_cupon_device(uuid, uuid) TO anon, authenticated, service_role;