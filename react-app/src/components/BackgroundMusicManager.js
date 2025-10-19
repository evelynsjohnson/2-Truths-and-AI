/**
 * @fileoverview Background music manager component, it maintains music playback state after consent is given
 * Note: Music is initially started by ConsentPage button click
 */

import { useEffect } from 'react';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import { useGame } from '../context/GameContext';

export default function BackgroundMusicManager() {
  const { play } = useBackgroundMusic();
  const { gameState } = useGame();

  useEffect(() => {
    // Keep music playing when navigating between pages
    // Only if consent was given (music should have been started by ConsentPage)
    if (gameState.consentGiven) {
      // Try to resume if paused (won't error if already playing)
      play().catch(() => {
        // Silently fail - music may already be playing or not yet started
      });
    }
  }, [gameState.consentGiven, play]);

  return null; // This component doesn't render anything
}
