
-- 1. CORRIGIR CONTAGEM DE IPS: Marcar sessões antigas como inativas
CREATE OR REPLACE FUNCTION public.register_login(_user_id uuid, _ip_address text, _user_agent text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _session_id UUID;
BEGIN
  -- Marcar todas as sessões antigas deste usuário como inativas
  UPDATE public.login_sessions 
  SET is_active = false 
  WHERE user_id = _user_id AND is_active = true;
  
  -- Inserir nova sessão ativa
  INSERT INTO public.login_sessions (user_id, ip_address, user_agent)
  VALUES (_user_id, _ip_address, _user_agent)
  RETURNING id INTO _session_id;
  
  RETURN _session_id;
END;
$$;

-- 2. SISTEMA DE MEDALHAS: Criar tabelas necessárias
CREATE TABLE IF NOT EXISTS public.user_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('devotional', 'challenge')),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

CREATE TABLE IF NOT EXISTS public.user_medals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medal_tier TEXT NOT NULL CHECK (medal_tier IN ('bronze', 'prata', 'ouro', 'platina', 'diamante', 'mestre', 'grandmestre', 'lendario', 'mitico', 'obsediana')),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, medal_tier)
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_medal TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_completions
CREATE POLICY "users_view_own_completions" ON public.user_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_completions" ON public.user_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para user_medals
CREATE POLICY "users_view_own_medals" ON public.user_medals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "anyone_view_medals" ON public.user_medals
  FOR SELECT USING (true);

-- Políticas RLS para user_settings
CREATE POLICY "users_view_own_settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Função para verificar e conceder medalhas automaticamente
CREATE OR REPLACE FUNCTION public.check_and_grant_medals(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_completions INT;
  medal_tiers TEXT[] := ARRAY['bronze', 'prata', 'ouro', 'platina', 'diamante', 'mestre', 'grandmestre', 'lendario', 'mitico', 'obsediana'];
  tier TEXT;
  tier_index INT;
BEGIN
  -- Contar total de conclusões
  SELECT COUNT(*) INTO total_completions
  FROM public.user_completions
  WHERE user_id = _user_id;
  
  -- Conceder medalhas baseado em conclusões (a cada 10)
  FOR tier_index IN 1..array_length(medal_tiers, 1) LOOP
    tier := medal_tiers[tier_index];
    
    -- Se tem conclusões suficientes e não tem a medalha ainda
    IF total_completions >= (tier_index * 10) THEN
      INSERT INTO public.user_medals (user_id, medal_tier)
      VALUES (_user_id, tier)
      ON CONFLICT (user_id, medal_tier) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- 3. MELHORAR FILTRO DE PROFANIDADE
CREATE OR REPLACE FUNCTION public.contains_profanity(_t text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  norm text := public.normalize_text(_t);
  bad_words text[] := array[
    'merda','bosta','porra','caralho','puta','putaria','foda','foder','fodase','fds',
    'cu','buceta','penis','piroca','tesao','cacete','vagina','cuzao','cuzinho','rabo',
    'fdp','pqp','vsf','vtnc','krl','krh','crl','crh',
    'inferno','diabo','satanas','demonio','capeta',
    'droga','maconha','cocaina','crack','heroina','beck','baseado',
    'aborto','idiota','cagar','merdar','bunda','bundao','sexo','pinto','pau','pirocao','pirocudo',
    'saco','bolas','rola','baleia','vaca','porca','cadela','bicha','viado','gay','sapatao',
    'arrombado','escroto','babaca','otario','trouxa','imbecil','burro','estupido',
    'rapariga','prostituta','meretriz','vadia','vagabunda','safada','galinha'
  ];
  w text;
BEGIN
  if norm is null or length(norm)=0 then
    return false;
  end if;
  
  foreach w in array bad_words loop
    if position(public.normalize_text(w) in norm) > 0 then
      return true;
    end if;
  end loop;
  
  return false;
END;
$$;
