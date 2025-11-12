/**
 * @fileoverview Custom hook to manage background music playback based on user settings.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

// Singleton audio element shared across all hook instances
let sharedAudioElement = null;
let isPlayingShared = false;

export function useBackgroundMusic() {
  const { settings } = useSettings();
  const audioRef = useRef(sharedAudioElement);
  const isPlayingRef = useRef(isPlayingShared);

  // Effect to initialize and update background music audio element
  useEffect(() => {
    if (!settings.bgMusic) return;

    // Create audio element if it doesn't exist (singleton)
    if (!sharedAudioElement) {
      sharedAudioElement = new Audio();
      sharedAudioElement.loop = true;
      sharedAudioElement.preload = 'auto';
      
      // Track when audio actually starts/stops playing
      sharedAudioElement.addEventListener('play', () => {
        isPlayingShared = true;
      });
      
      sharedAudioElement.addEventListener('pause', () => {
        isPlayingShared = false;
      });
      
      audioRef.current = sharedAudioElement;
    }

    // Update volume
    const volume = (settings.masterVolume ?? 0.5) * (settings.bgMusicVolume ?? 0.8);
    sharedAudioElement.volume = volume;

    // Update source if bgMusic changed
    const expectedSrc = `/assets/mp3/bg-music/${settings.bgMusic}`;
    const currentSrc = sharedAudioElement.src;
    
    // Check if source needs updating (compare the filename part)
    if (!currentSrc || !currentSrc.endsWith(expectedSrc)) {
      const wasPlaying = !sharedAudioElement.paused;
      
      // Pause and stop the old music first
      sharedAudioElement.pause();
      sharedAudioElement.currentTime = 0;
      
      // Update to new source
      sharedAudioElement.src = expectedSrc;
      sharedAudioElement.load();
      isPlayingShared = false;
      isPlayingRef.current = false;
      
      // Resume playing if it was playing before
      if (wasPlaying) {
        sharedAudioElement.play().catch(e => console.warn('Could not resume music:', e));
      }
    }

    // Cleanup only when component unmounts, not on every re-render
    return undefined;
  }, [settings.bgMusic, settings.masterVolume, settings.bgMusicVolume]);

  // Function to play the background music
  const play = useCallback(async () => {
    if (!sharedAudioElement) return;

    // Check if audio is already playing using the element's paused property
    if (!sharedAudioElement.paused) {
      return; // Already playing, don't try again
    }

    try {
      await sharedAudioElement.play();
      isPlayingShared = true;
      isPlayingRef.current = true;
    } catch (e) {
      console.warn('Could not play background music:', e);
      throw e; // Re-throw so caller knows it failed
    }
  }, []);

  // Function to pause the background music
  const pause = useCallback(() => {
      if (sharedAudioElement && isPlayingShared) {
        sharedAudioElement.pause();
      isPlayingShared = false;
      isPlayingRef.current = false;
    }
  }, []);

  // Allow callers to control playback rate (e.g., speed up under 15s)
  const setPlaybackRate = useCallback((rate) => {
    if (sharedAudioElement) {
      sharedAudioElement.playbackRate = rate;
    }
  }, []);

  // Function to toggle playback state
  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);
  
  // Return control functions and current playing state
  return { play, pause, toggle, setPlaybackRate, isPlaying: isPlayingRef.current };
}
