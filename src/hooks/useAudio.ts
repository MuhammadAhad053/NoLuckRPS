import { useCallback, useState } from 'react';
import { SOUNDS } from '../constants';

export function useAudio() {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('isMuted');
    return saved === 'true';
  });

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('isMuted', String(next));
      return next;
    });
  }, []);

  const playSound = useCallback((soundUrl: string) => {
    if (isMuted) return;
    const audio = new Audio(soundUrl);
    audio.play().catch(err => console.warn('Audio play failed:', err));
  }, [isMuted]);

  return { playSound, isMuted, toggleMute };
}
