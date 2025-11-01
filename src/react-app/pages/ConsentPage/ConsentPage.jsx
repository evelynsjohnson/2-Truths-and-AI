/**
 * @fileoverview ConsentPage component where users provide consent before starting the game.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './ConsentPage.css';

export default function ConsentPage() {
  const navigate = useNavigate();
  const { giveConsent } = useGame();        // Function to record user consent
  const { play } = useBackgroundMusic();    // Hook to play background music
  const [agreed, setAgreed] = useState({    // State to track agreement to terms
    understand: false,
    participate: false,
    research: false
  });

  const allAgreed = agreed.understand && agreed.participate && agreed.research;

  // Handle confirmation and proceed if all terms are agreed
  const handleConfirm = async () => {
    if (allAgreed) {
      giveConsent();
      
      // Start background music on user interaction (button click)
      try {
        await play();
        //console.log('🎵 Background music started');
      } catch (e) {
        console.warn('Could not start background music:', e);
      }
      
      navigate('/start');
    }
  };

  // Render the consent page
  return (
    <div className="stage">
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
            onClick={handleConfirm}
            disabled={!allAgreed}
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
