import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type MedalTier = 'bronze' | 'prata' | 'ouro' | 'platina' | 'diamante' | 'mestre' | 'grandmestre' | 'lendario' | 'mitico' | 'obsediana';

interface Medal {
  tier: MedalTier;
  name: string;
  icon: string;
  requiredCompletions: number;
}

export const MEDALS: Medal[] = [
  { tier: 'bronze', name: 'Bronze', icon: '◆', requiredCompletions: 10 },
  { tier: 'prata', name: 'Prata', icon: '◇', requiredCompletions: 20 },
  { tier: 'ouro', name: 'Ouro', icon: '★', requiredCompletions: 30 },
  { tier: 'platina', name: 'Platina', icon: '✦', requiredCompletions: 40 },
  { tier: 'diamante', name: 'Diamante', icon: '◈', requiredCompletions: 50 },
  { tier: 'mestre', name: 'Mestre', icon: '✧', requiredCompletions: 60 },
  { tier: 'grandmestre', name: 'Grande Mestre', icon: '❖', requiredCompletions: 70 },
  { tier: 'lendario', name: 'Lendário', icon: '☆', requiredCompletions: 80 },
  { tier: 'mitico', name: 'Mítico', icon: '✪', requiredCompletions: 90 },
  { tier: 'obsediana', name: 'Obsediana', icon: '◉', requiredCompletions: 100 },
];

export const useCompletions = () => {
  const { user } = useAuth();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [medals, setMedals] = useState<MedalTier[]>([]);
  const [displayMedal, setDisplayMedal] = useState<MedalTier | null>(null);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCompletions();
      loadMedals();
      loadDisplayMedal();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCompletions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_completions')
        .select('item_id, item_type')
        .eq('user_id', user.id);

      if (error) throw error;

      const completed = new Set(data?.map(c => `${c.item_type}_${c.item_id}`) || []);
      setCompletedItems(completed);
      setTotalCompletions(data?.length || 0);
    } catch (error) {
      console.error('Erro ao carregar conclusões:', error);
    }
  };

  const loadMedals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_medals')
        .select('medal_tier')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: true });

      if (error) throw error;

      setMedals(data?.map(m => m.medal_tier as MedalTier) || []);
    } catch (error) {
      console.error('Erro ao carregar medalhas:', error);
    }
  };

  const loadDisplayMedal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('display_medal')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setDisplayMedal(data?.display_medal as MedalTier || null);
    } catch (error) {
      console.error('Erro ao carregar medalha de exibição:', error);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (itemId: string, itemType: 'devotional' | 'challenge') => {
    if (!user) return;

    const key = `${itemType}_${itemId}`;
    
    try {
      const { error } = await supabase
        .from('user_completions')
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_type: itemType,
        });

      if (error) throw error;

      // Atualizar estado local
      const newCompleted = new Set(completedItems);
      newCompleted.add(key);
      setCompletedItems(newCompleted);
      setTotalCompletions(newCompleted.size);

      // Verificar e conceder medalhas
      await supabase.rpc('check_and_grant_medals', { _user_id: user.id });
      
      // Recarregar medalhas
      await loadMedals();

      toast.success('Concluído!', {
        description: `Total de conclusões: ${newCompleted.size}`,
      });
    } catch (error: any) {
      // Ignorar erro de duplicata (usuário clicou duas vezes)
      if (error.code !== '23505') {
        console.error('Erro ao marcar como concluído:', error);
        toast.error('Erro ao salvar conclusão');
      }
    }
  };

  const setMedalToDisplay = async (medal: MedalTier | null) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          display_medal: medal,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setDisplayMedal(medal);
      toast.success(medal ? 'Medalha selecionada!' : 'Medalha removida');
    } catch (error) {
      console.error('Erro ao definir medalha:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const isCompleted = (itemId: string, itemType: 'devotional' | 'challenge') => {
    return completedItems.has(`${itemType}_${itemId}`);
  };

  return {
    isCompleted,
    markComplete,
    medals,
    displayMedal,
    setMedalToDisplay,
    totalCompletions,
    loading,
  };
};
