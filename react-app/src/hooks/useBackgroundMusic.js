/**
 * @fileoverview Custom hook to manage background music playback based on user settings.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

export function useBackgroundMusic() {
  const { settings } = useSettings();
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Effect to initialize and update background music audio element
  useEffect(() => {
    if (!settings.bgMusic) return;

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(`/assets/mp3/bg-music/${settings.bgMusic}`);
      audioRef.current.loop = true;
      audioRef.current.preload = 'auto';
      
      // Track when audio actually starts/stops playing
      audioRef.current.addEventListener('play', () => {
        isPlayingRef.current = true;
      });
      
      audioRef.current.addEventListener('pause', () => {
        isPlayingRef.current = false;
      });
    }

    // Update volume
    const volume = (settings.masterVolume ?? 0.5) * (settings.bgMusicVolume ?? 0.8);
    audioRef.current.volume = volume;

    // Update source if bgMusic changed
    const expectedSrc = `/assets/mp3/bg-music/${settings.bgMusic}`;
    if (!audioRef.current.src.endsWith(expectedSrc)) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = expectedSrc;
      audioRef.current.load();
      isPlayingRef.current = false;
      
      // Resume playing if it was playing before
      if (wasPlaying) {
        audioRef.current.play().catch(e => console.warn('Could not resume music:', e));
      }
    }

    // Cleanup only when component unmounts, not on every re-render
    return undefined;
  }, [settings.bgMusic, settings.masterVolume, settings.bgMusicVolume]);

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        isPlayingRef.current = false;
      }
    };
  }, []);

  // Function to play the background music
  const play = useCallback(async () => {
    if (!audioRef.current) return;
    
    // Check if audio is already playing using the element's paused property
    if (!audioRef.current.paused) {
      return; // Already playing, don't try again
    }
    
    try {
      await audioRef.current.play();
      isPlayingRef.current = true;
    } catch (e) {
      console.warn('Could not play background music:', e);
      throw e; // Re-throw so caller knows it failed
    }
  }, []);

  // Function to pause the background music
  const pause = useCallback(() => {
    if (audioRef.current && isPlayingRef.current) {
      audioRef.current.pause();
      isPlayingRef.current = false;
    }
  }, []);

  // Allow callers to control playback rate (e.g., speed up under 15s)
  const setPlaybackRate = useCallback((rate) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
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
