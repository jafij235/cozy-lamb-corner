-- Corrigir search_path para a função register_login
DROP FUNCTION IF EXISTS public.register_login(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.register_login(
  _user_id UUID,
  _ip_address TEXT,
  _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _session_id UUID;
BEGIN
  INSERT INTO public.login_sessions (user_id, ip_address, user_agent)
  VALUES (_user_id, _ip_address, _user_agent)
  RETURNING id INTO _session_id;
  
  RETURN _session_id;
END;
$$;
