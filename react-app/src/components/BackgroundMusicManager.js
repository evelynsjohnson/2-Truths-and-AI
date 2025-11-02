/**
 * @fileoverview Background music manager component, it maintains music playback state after consent is given
 * Note: Music is initially started by ConsentPage button click
 */

import { useEffect, useState } from 'react';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import { useGame } from '../context/GameContext';
import Modal from './Modal/Modal';
import Button from './Button/Button';

export default function BackgroundMusicManager() {
  const { play } = useBackgroundMusic();
  const { gameState } = useGame();
  const [showEnableSoundModal, setShowEnableSoundModal] = useState(false);

  useEffect(() => {
    // Keep music playing when navigating between pages
    // Only if consent was given (music should have been started by ConsentPage)
    if (gameState.consentGiven) {
      // Try to resume if paused (won't error if already playing)
      play().catch(() => {
        // If resume fails (browsers may block autoplay), surface a prompt
        // so the user can retry via an explicit gesture.
        setShowEnableSoundModal(true);
      });
    }
  }, [gameState.consentGiven, play]);

  const handleEnableSound = async () => {
    try {
      await play();
      setShowEnableSoundModal(false);
    } catch (e) {
      console.warn('Retry to enable sound failed:', e);
    }
  };

  if (showEnableSoundModal) {
    return (
      <Modal isOpen={true} title="Sound disabled" blocking={true}>
        <p>Auto sound playback is disabled. Please enable sound.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="primary" size="medium" onClick={handleEnableSound}>
            Enable Sound
          </Button>
        </div>
      </Modal>
    );
  }

  return null; // This component doesn't render anything when not showing the modal
}
