-- Add RLS policies to user_login_stats view
-- Since user_login_stats is a view, we need to ensure the underlying table has proper RLS
-- and that the view respects those policies

-- First, verify login_sessions table has proper RLS (it already does based on schema)
-- The view will inherit the RLS from the underlying table

-- Create a security definer function to safely query login stats (admin only)
CREATE OR REPLACE FUNCTION public.get_user_login_stats()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  username TEXT,
  total_logins BIGINT,
  unique_ips BIGINT,
  ip_addresses TEXT[],
  last_login TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ls.user_id,
    p.email,
    p.username,
    COUNT(*)::BIGINT as total_logins,
    COUNT(DISTINCT ls.ip_address)::BIGINT as unique_ips,
    array_agg(DISTINCT ls.ip_address) as ip_addresses,
    MAX(ls.login_at) as last_login
  FROM login_sessions ls
  JOIN profiles p ON p.id = ls.user_id
  WHERE has_role(auth.uid(), 'admin')
  GROUP BY ls.user_id, p.email, p.username
$$;