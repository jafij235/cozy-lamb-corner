import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MEDALS } from '@/hooks/useCompletions';

interface UserMedalBadgeProps {
  userId: string;
}

interface MedalData {
  type: 'standard' | 'custom';
  id: string;
  icon: string;
  name: string;
}

export const UserMedalBadge = ({ userId }: UserMedalBadgeProps) => {
  const [medalData, setMedalData] = useState<MedalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserMedal();

    // Configurar realtime para atualizar medalha quando mudar
    const channel = supabase
      .channel(`user-medal-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadUserMedal();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadUserMedal = async () => {
    try {
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('display_medal')
        .eq('user_id', userId)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Erro ao carregar medalha:', settingsError);
        return;
      }

      const medalId = settings?.display_medal;
      if (!medalId) {
        setLoading(false);
        return;
      }

      // Verificar se é uma medalha padrão
      const standardMedal = MEDALS.find(m => m.tier === medalId);
      if (standardMedal) {
        setMedalData({
          type: 'standard',
          id: medalId,
          icon: standardMedal.icon,
          name: standardMedal.name
        });
        setLoading(false);
        return;
      }

      // Se não for padrão, buscar medalha personalizada
      const { data: customMedal, error: customError } = await supabase
        .from('user_medals')
        .select('custom_name, custom_icon')
        .eq('id', medalId)
        .maybeSingle();

      if (customError) {
        console.error('Erro ao carregar medalha personalizada:', customError);
        setLoading(false);
        return;
      }

      if (customMedal?.custom_name && customMedal?.custom_icon) {
        setMedalData({
          type: 'custom',
          id: medalId,
          icon: customMedal.custom_icon,
          name: customMedal.custom_name
        });
      }
    } catch (error) {
      console.error('Erro ao carregar medalha:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !medalData) return null;

  return (
    <span 
      className="inline-flex items-center justify-center w-6 h-6 text-sm font-bold text-primary"
      title={medalData.name}
    >
      {medalData.icon}
    </span>
  );
};
