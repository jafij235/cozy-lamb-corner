import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MEDALS } from '@/hooks/useCompletions';

interface UserMedalBadgeProps {
  userId: string;
}

export const UserMedalBadge = ({ userId }: UserMedalBadgeProps) => {
  const [displayMedal, setDisplayMedal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserMedal();
  }, [userId]);

  const loadUserMedal = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('display_medal')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar medalha:', error);
        return;
      }

      setDisplayMedal(data?.display_medal || null);
    } catch (error) {
      console.error('Erro ao carregar medalha:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !displayMedal) return null;

  const medal = MEDALS.find(m => m.tier === displayMedal);
  if (!medal) return null;

  return (
    <span 
      className="inline-flex items-center justify-center w-6 h-6 text-sm font-bold text-primary"
      title={medal.name}
    >
      {medal.icon}
    </span>
  );
};
