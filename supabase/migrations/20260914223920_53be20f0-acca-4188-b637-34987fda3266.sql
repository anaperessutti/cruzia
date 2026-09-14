CREATE OR REPLACE FUNCTION public.existe_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins);
$$;

REVOKE ALL ON FUNCTION public.existe_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.existe_admin() TO anon, authenticated, service_role;