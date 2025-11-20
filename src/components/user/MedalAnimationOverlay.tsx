import { useEffect, useState } from 'react';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';

interface MedalAnimationOverlayProps {
  show: boolean;
  medalName: string;
  medalIcon: string;
  onComplete: () => void;
}

export const MedalAnimationOverlay = ({ 
  show, 
  medalName, 
  medalIcon,
  onComplete 
}: MedalAnimationOverlayProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);
  const { playSuccess } = useAudioFeedback();

  useEffect(() => {
    if (show) {
      playSuccess();
      // Generate confetti particles
      const particles = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
      }));
      setConfetti(particles);

      // Auto-hide confetti after 3 seconds
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, playSuccess]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={onComplete}
    >
      {/* Confetti */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            top: '-10%',
            animationDelay: `${particle.delay}s`,
            background: `hsl(${Math.random() * 360}, 70%, 60%)`,
          }}
        />
      ))}

      {/* Medal Display */}
      <div className="relative animate-scale-in">
        {/* Glow effect */}
        <div className="absolute inset-0 animate-pulse-glow">
          <div className="w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
        </div>

        {/* Medal card */}
        <div className="relative bg-card border-2 border-primary rounded-2xl p-8 shadow-2xl text-center space-y-4 animate-bounce-in">
          <div className="text-7xl animate-rotate-badge">
            {medalIcon}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary animate-slide-up">
              Nova Medalha!
            </h2>
            <p className="text-3xl font-bold text-foreground animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {medalName}
            </p>
            <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Parabéns pela sua conquista!
            </p>
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute -top-4 -right-4 text-4xl animate-sparkle">✦</div>
          <div className="absolute -bottom-4 -left-4 text-3xl animate-sparkle" style={{ animationDelay: '0.3s' }}>✧</div>
          <div className="absolute top-1/2 -left-6 text-2xl animate-sparkle" style={{ animationDelay: '0.5s' }}>◈</div>
          <div className="absolute top-1/4 -right-6 text-2xl animate-sparkle" style={{ animationDelay: '0.7s' }}>★</div>
        </div>
      </div>
    </div>
  );
};
