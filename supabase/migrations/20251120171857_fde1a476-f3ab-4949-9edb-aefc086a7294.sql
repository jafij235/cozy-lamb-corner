-- Drop the existing unique constraint
ALTER TABLE public.user_medals 
DROP CONSTRAINT IF EXISTS user_medals_user_id_medal_tier_key;

-- Create a new partial unique constraint that only applies to non-custom medals
-- This allows multiple custom medals but prevents duplicate standard medals
CREATE UNIQUE INDEX user_medals_standard_unique 
ON public.user_medals (user_id, medal_tier) 
WHERE custom_name IS NULL;

-- Also ensure custom medals are truly unique by their full definition
CREATE UNIQUE INDEX user_medals_custom_unique 
ON public.user_medals (user_id, medal_tier, custom_name, custom_icon) 
WHERE custom_name IS NOT NULL;