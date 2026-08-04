CREATE OR REPLACE FUNCTION public.clear_force_logout(clear_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  UPDATE public.user_roles SET force_logged_out_at = NULL, updated_at = now()
  WHERE user_id = auth.uid() AND user_id = clear_user_id;
$function$;

REVOKE EXECUTE ON FUNCTION public.clear_force_logout(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.check_force_logout(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_dev_manager(uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.clear_force_logout(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_force_logout(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_dev_manager(uuid) TO authenticated, service_role;