import { useEffect, useState } from 'react';
import { useAudioFeedback } from './useAudioFeedback';

export const useMedalAnimation = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [medalInfo, setMedalInfo] = useState<{ name: string; icon: string; tier: string } | null>(null);
  const { playMedalSound } = useAudioFeedback();

  const triggerMedalAnimation = (medalName: string, medalIcon: string, medalTier: string) => {
    setMedalInfo({ name: medalName, icon: medalIcon, tier: medalTier });
    setShowAnimation(true);
    playMedalSound(medalTier);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setShowAnimation(false);
      setTimeout(() => setMedalInfo(null), 500);
    }, 4000);
  };

  return {
    showAnimation,
    medalInfo,
    triggerMedalAnimation,
    hideAnimation: () => setShowAnimation(false),
  };
};
