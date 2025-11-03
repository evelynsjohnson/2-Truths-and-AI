/**
 * @fileoverview ConsentPage component where users provide consent before starting the game.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import './ConsentPage.css';

/**
 * ConsentPage can be used as a full page (default) or as an embeddable modal form.
 * Props:
 * - modalMode (bool): when true, the component will render only the Card (no outer stage)
 * - onConfirm (func): optional callback to call after consent is recorded (used by modal)
 */

export default function ConsentPage({ modalMode = false, onConfirm } = {}) {
  const navigate = useNavigate();
  const { giveConsent } = useGame();        // Function to record user consent
  const { play } = useBackgroundMusic();    // Hook to play background music
  const [agreed, setAgreed] = useState({    // State to track agreement to terms
    understand: false,
    participate: false,
    research: false
  });
  const [showEnableSoundModal, setShowEnableSoundModal] = useState(false);

  const allAgreed = agreed.understand && agreed.participate && agreed.research;

  // Handle confirmation and proceed if all terms are agreed
  // Support being used as a modal: if an onConfirm prop is provided we'll call it
  // instead of navigating. This makes the consent UI reusable as a popup.
  const handleConfirm = async (callback) => {
    if (!allAgreed) return;

    giveConsent();

    // Start background music on user interaction (button click)
    try {
      await play();
      //console.log('🎵 Background music started');
    } catch (e) {
      console.warn('Could not start background music:', e);
      // If autoplay is blocked, prompt the user with a modal to enable sound
      setShowEnableSoundModal(true);
    }

    if (typeof callback === 'function') {
      callback();
    } else {
      navigate('/start');
    }
  };

  // Render the consent page/card. When used as a modal, callers should pass
  // modalMode={true} to avoid the outer page wrapper and optionally an onConfirm callback.
  // Decide wrapper: when used as a modal we render just the Card so the Modal
  // provides the overlay; otherwise render the full page stage wrapper.
  const card = (
    <Card className="consent-card">
      <h1>Welcome — Consent</h1>
      <p className="lead">
        Before we begin, please review and agree to the following:
      </p>

      <div className="terms">
        <div className="term-item">
          <input
            type="checkbox"
            id="understand"
            checked={agreed.understand}
            onChange={(e) => setAgreed({ ...agreed, understand: e.target.checked })}
          />
          <label htmlFor="understand">
            I understand this is a research study exploring AI-generated content in social games
          </label>
        </div>

        <div className="term-item">
          <input
            type="checkbox"
            id="participate"
            checked={agreed.participate}
            onChange={(e) => setAgreed({ ...agreed, participate: e.target.checked })}
          />
          <label htmlFor="participate">
            I voluntarily agree to participate in this study
          </label>
        </div>

        <div className="term-item">
          <input
            type="checkbox"
            id="research"
            checked={agreed.research}
            onChange={(e) => setAgreed({ ...agreed, research: e.target.checked })}
          />
          <label htmlFor="research">
            I consent to my gameplay data being collected for research purposes
          </label>
        </div>
      </div>

      <div className="controls">
        <Button                                 // Confirm button to proceed if all terms are agreed
          variant="primary"
          size="large"
          onClick={() => handleConfirm(onConfirm)}
          disabled={!allAgreed}
        >
          Continue
        </Button>
      </div>
    </Card>
  );

    if (modalMode) {
    return card;
  }
 
  return (
    <div className="stage">
      {card}
      <Modal isOpen={showEnableSoundModal} title="Sound disabled" blocking={true}>
        <p>Auto sound playback is disabled. Please enable sound.</p>
        <div className="controls" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            size="large"
            onClick={async () => {
              try {
                await play();
                setShowEnableSoundModal(false);
              } catch (err) {
                console.warn('Retry to enable sound failed:', err);
              }
            }}
          >
            Enable Sound
          </Button>
        </div>
      </Modal>
    </div>
  );
}
