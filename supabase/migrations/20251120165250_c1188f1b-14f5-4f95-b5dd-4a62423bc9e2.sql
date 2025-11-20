-- Permitir que todos os usuários autenticados vejam as medalhas exibidas de outros usuários
CREATE POLICY "users_view_display_medals"
ON public.user_settings
FOR SELECT
TO authenticated
USING (true);

-- Garantir que a policy de interações permita inserção mesmo se já interagiu antes
DROP POLICY IF EXISTS "Users can add interactions" ON public.interactions;

CREATE POLICY "Users can add interactions"
ON public.interactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);