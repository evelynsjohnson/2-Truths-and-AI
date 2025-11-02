/**
 * @fileoverview Hook to play sound effects based on user settings.
 */

import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

export function useSoundEffect() {
  const { settings } = useSettings(); // Access user settings

  // Function to play a sound effect
  const playSound = useCallback((soundFile = null) => {
    if (!settings.sfxEnabled) return;

    const file = soundFile || settings.sfxFile;
    const volume = (settings.masterVolume ?? 0.5) * (settings.sfxVolume ?? 0.8);

    try {
      const audio = new Audio(`/assets/mp3/sound-effects/${file}`);
      audio.volume = volume;
      audio.play().catch(e => {
        console.warn('Could not play sound effect', e);
      });
    } catch (e) {
      console.warn('Error creating sound effect', e);
    }
  }, [settings.sfxEnabled, settings.sfxFile, settings.masterVolume, settings.sfxVolume]);

  // Specific function to play click sound. It is used in Button component
  const playClick = useCallback(() => {
    playSound('button-click.mp3');
  }, [playSound]);

  return { playSound, playClick };
}
