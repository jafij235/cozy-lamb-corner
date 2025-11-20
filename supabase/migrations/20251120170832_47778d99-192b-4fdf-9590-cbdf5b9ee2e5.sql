-- Adicionar suporte para medalhas personalizadas
ALTER TABLE public.user_medals
ADD COLUMN custom_name TEXT,
ADD COLUMN custom_icon TEXT,
ADD COLUMN awarded_by UUID REFERENCES auth.users(id);

-- Criar índice para buscar medalhas de um usuário
CREATE INDEX IF NOT EXISTS idx_user_medals_user_id ON public.user_medals(user_id);

-- Permitir que admins insiram medalhas para usuários
CREATE POLICY "Admins can insert medals for users"
ON public.user_medals
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Permitir que admins deletem medalhas
CREATE POLICY "Admins can delete medals"
ON public.user_medals
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Permitir que admins insiram conquistas para usuários
CREATE POLICY "Admins can insert achievements for users"
ON public.user_achievements
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Permitir que admins deletem conquistas
CREATE POLICY "Admins can delete achievements"
ON public.user_achievements
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));