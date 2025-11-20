import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievements: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Load all achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });

  // Load user's earned achievements
  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user,
  });

  // Check and grant achievements
  const checkAchievements = async () => {
    if (!user) return;

    try {
      // Get user stats
      const { data: completions } = await supabase
        .from('user_completions')
        .select('id')
        .eq('user_id', user.id);

      const { data: interactions } = await supabase
        .from('interactions')
        .select('id')
        .eq('user_id', user.id);

      const { data: prayerRequests } = await supabase
        .from('prayer_requests')
        .select('id')
        .eq('user_id', user.id);

      const stats = {
        completions: completions?.length || 0,
        interactions: interactions?.length || 0,
        prayer_requests: prayerRequests?.length || 0,
      };

      // Check each achievement
      for (const achievement of achievements) {
        const alreadyEarned = userAchievements.some(
          ua => ua.achievement_id === achievement.id
        );

        if (alreadyEarned) continue;

        let shouldGrant = false;

        if (achievement.requirement_type === 'completions' && 
            stats.completions >= achievement.requirement_value) {
          shouldGrant = true;
        } else if (achievement.requirement_type === 'interactions' && 
                   stats.interactions >= achievement.requirement_value) {
          shouldGrant = true;
        } else if (achievement.requirement_type === 'prayer_requests' && 
                   stats.prayer_requests >= achievement.requirement_value) {
          shouldGrant = true;
        }

        if (shouldGrant) {
          const { error } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id,
            });

          if (!error) {
            setNewAchievement(achievement);
            queryClient.invalidateQueries({ queryKey: ['user-achievements', user.id] });
            
            // Show toast after a short delay
            setTimeout(() => {
              toast.success(`🎉 Nova conquista desbloqueada: ${achievement.name}!`);
            }, 500);
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  return {
    achievements,
    userAchievements,
    newAchievement,
    clearNewAchievement: () => setNewAchievement(null),
    checkAchievements,
  };
};
