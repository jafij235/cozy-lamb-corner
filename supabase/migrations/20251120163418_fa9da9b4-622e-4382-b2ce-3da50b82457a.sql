-- Corrigir RLS da tabela profiles para permitir visualização pública de perfis básicos
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Habilitar realtime na tabela profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Criar tabela de conquistas
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de conquistas dos usuários
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Habilitar RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas para achievements
CREATE POLICY "Anyone can view achievements"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);

-- Políticas para user_achievements
CREATE POLICY "Users can view all user achievements"
ON public.user_achievements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;

-- Inserir conquistas iniciais
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value) VALUES
('Oração Constante', 'Complete 30 devocionais ou desafios', '🙏', 'devotion', 'completions', 30),
('Líder Comunitário', 'Interaja com 50 pedidos de oração', '👑', 'community', 'interactions', 50),
('Coração Piedoso', 'Publique 10 pedidos de oração', '💙', 'community', 'prayer_requests', 10),
('Guerreiro de Fé', 'Complete 100 devocionais ou desafios', '⚔️', 'devotion', 'completions', 100),
('Anjo Guardião', 'Interaja com 100 pedidos de oração', '👼', 'community', 'interactions', 100)
ON CONFLICT DO NOTHING;