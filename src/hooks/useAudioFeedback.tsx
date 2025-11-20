import { useRef, useCallback } from 'react';

export const useAudioFeedback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playClick = useCallback(() => {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }, [initAudioContext]);

  const playHover = useCallback(() => {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.03);
  }, [initAudioContext]);

  const playSuccess = useCallback(() => {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.05);
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }, [initAudioContext]);

  const playMedalSound = useCallback((medalTier: string) => {
    const ctx = initAudioContext();
    
    // Configurações específicas por nível de medalha
    const medalConfigs: Record<string, { notes: number[], duration: number, volume: number, complexity: number }> = {
      bronze: { notes: [392, 440, 494], duration: 0.3, volume: 0.12, complexity: 1 },
      prata: { notes: [440, 494, 523], duration: 0.35, volume: 0.13, complexity: 1 },
      ouro: { notes: [523, 587, 659], duration: 0.4, volume: 0.14, complexity: 2 },
      platina: { notes: [587, 659, 784], duration: 0.45, volume: 0.15, complexity: 2 },
      diamante: { notes: [659, 784, 880], duration: 0.5, volume: 0.16, complexity: 3 },
      mestre: { notes: [784, 880, 988], duration: 0.55, volume: 0.17, complexity: 3 },
      grandmestre: { notes: [880, 988, 1047], duration: 0.6, volume: 0.18, complexity: 4 },
      lendario: { notes: [988, 1047, 1175], duration: 0.65, volume: 0.19, complexity: 4 },
      mitico: { notes: [1047, 1175, 1319], duration: 0.7, volume: 0.2, complexity: 5 },
      obsediana: { notes: [1175, 1319, 1568], duration: 0.75, volume: 0.22, complexity: 5 }
    };

    const config = medalConfigs[medalTier] || medalConfigs.bronze;
    
    // Toca notas principais
    config.notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + (index * 0.08));
      oscillator.type = index === config.notes.length - 1 ? 'triangle' : 'sine';
      
      gainNode.gain.setValueAtTime(config.volume, ctx.currentTime + (index * 0.08));
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (index * 0.08) + 0.15);
      
      oscillator.start(ctx.currentTime + (index * 0.08));
      oscillator.stop(ctx.currentTime + (index * 0.08) + 0.15);
    });

    // Adiciona harmonias para medalhas superiores
    if (config.complexity >= 3) {
      config.notes.forEach((freq, index) => {
        const harmonic = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        
        harmonic.connect(harmonicGain);
        harmonicGain.connect(ctx.destination);
        
        harmonic.frequency.setValueAtTime(freq * 1.5, ctx.currentTime + (index * 0.08) + 0.02);
        harmonic.type = 'sine';
        
        harmonicGain.gain.setValueAtTime(config.volume * 0.4, ctx.currentTime + (index * 0.08) + 0.02);
        harmonicGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (index * 0.08) + 0.12);
        
        harmonic.start(ctx.currentTime + (index * 0.08) + 0.02);
        harmonic.stop(ctx.currentTime + (index * 0.08) + 0.12);
      });
    }

    // Adiciona sub-bass épico para medalhas lendárias
    if (config.complexity >= 4) {
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      
      bass.connect(bassGain);
      bassGain.connect(ctx.destination);
      
      bass.frequency.setValueAtTime(config.notes[0] / 2, ctx.currentTime);
      bass.type = 'sawtooth';
      
      bassGain.gain.setValueAtTime(config.volume * 0.6, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);
      
      bass.start(ctx.currentTime);
      bass.stop(ctx.currentTime + config.duration);
    }

    // Efeito final crescendo para medalhas míticas
    if (config.complexity >= 5) {
      const finalNote = ctx.createOscillator();
      const finalGain = ctx.createGain();
      
      finalNote.connect(finalGain);
      finalGain.connect(ctx.destination);
      
      finalNote.frequency.setValueAtTime(config.notes[config.notes.length - 1] * 2, ctx.currentTime + 0.25);
      finalNote.type = 'triangle';
      
      finalGain.gain.setValueAtTime(0.01, ctx.currentTime + 0.25);
      finalGain.gain.exponentialRampToValueAtTime(config.volume * 0.8, ctx.currentTime + 0.35);
      finalGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);
      
      finalNote.start(ctx.currentTime + 0.25);
      finalNote.stop(ctx.currentTime + config.duration);
    }
  }, [initAudioContext]);

  return { playClick, playHover, playSuccess, playMedalSound };
};
