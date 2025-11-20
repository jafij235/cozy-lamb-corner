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
        setDisplayMedal(medalId);
        setLoading(false);
        return;
      }

      // Se não for padrão, buscar medalha personalizada
      const { data: customMedal, error: customError } = await supabase
        .from('user_medals')
        .select('custom_name, custom_icon')
        .eq('id', medalId)
        .eq('user_id', userId)
        .maybeSingle();

      if (customError) {
        console.error('Erro ao carregar medalha personalizada:', customError);
      }

      if (customMedal?.custom_name) {
        setDisplayMedal(medalId);
      }
    } catch (error) {
      console.error('Erro ao carregar medalha:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !displayMedal) return null;

  // Buscar medalha padrão
  const standardMedal = MEDALS.find(m => m.tier === displayMedal);
  if (standardMedal) {
    return (
      <span 
        className="inline-flex items-center justify-center w-6 h-6 text-sm font-bold text-primary"
        title={standardMedal.name}
      >
        {standardMedal.icon}
      </span>
    );
  }

  // Se não for padrão, renderizar ícone personalizado
  // (o ícone e nome já foram carregados no loadUserMedal)
  return (
    <span 
      className="inline-flex items-center justify-center w-6 h-6 text-sm font-bold text-primary"
    >
      ⭐
    </span>
  );
};
