-- Habilitar realtime para user_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;

-- Garantir que interactions também está habilitada
ALTER PUBLICATION supabase_realtime ADD TABLE public.interactions;