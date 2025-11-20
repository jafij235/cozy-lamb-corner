import { useEffect, useState } from 'react';
import { useAudioFeedback } from './useAudioFeedback';

export const useMedalAnimation = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [medalInfo, setMedalInfo] = useState<{ name: string; icon: string } | null>(null);
  const { playSuccess } = useAudioFeedback();

  const triggerMedalAnimation = (medalName: string, medalIcon: string) => {
    setMedalInfo({ name: medalName, icon: medalIcon });
    setShowAnimation(true);
    playSuccess();
    
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
