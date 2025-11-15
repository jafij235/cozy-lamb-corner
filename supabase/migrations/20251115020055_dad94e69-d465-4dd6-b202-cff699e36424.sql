-- Tabela para rastrear sessões e logins
CREATE TABLE IF NOT EXISTS public.login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Índices para performance
CREATE INDEX idx_login_sessions_user_id ON public.login_sessions(user_id);
CREATE INDEX idx_login_sessions_is_active ON public.login_sessions(is_active);
CREATE INDEX idx_login_sessions_login_at ON public.login_sessions(login_at DESC);

-- RLS
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver sessões
CREATE POLICY "Admins can view all sessions"
ON public.login_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Função para registrar login
CREATE OR REPLACE FUNCTION public.register_login(
  _user_id UUID,
  _ip_address TEXT,
  _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- View para admins verem estatísticas de IPs por usuário
CREATE OR REPLACE VIEW public.user_login_stats AS
SELECT 
  ls.user_id,
  p.email,
  p.username,
  COUNT(DISTINCT ls.ip_address) as unique_ips,
  COUNT(*) as total_logins,
  MAX(ls.login_at) as last_login,
  ARRAY_AGG(DISTINCT ls.ip_address) as ip_addresses
FROM public.login_sessions ls
LEFT JOIN public.profiles p ON ls.user_id = p.id
WHERE ls.is_active = true
GROUP BY ls.user_id, p.email, p.username;

-- RLS para a view
ALTER VIEW public.user_login_stats SET (security_invoker = on);
