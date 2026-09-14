REVOKE ALL ON FUNCTION public.admins_vacio() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admins_vacio() TO authenticated, service_role;