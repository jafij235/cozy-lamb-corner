-- Adicionar constraint única para evitar interações duplicadas
ALTER TABLE public.interactions 
ADD CONSTRAINT unique_user_prayer_type 
UNIQUE (user_id, prayer_request_id, type);