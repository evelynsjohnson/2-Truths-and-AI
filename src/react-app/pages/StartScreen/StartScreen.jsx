/**
 * @fileoverview Start Screen Page Component
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './StartScreen.css';

export default function StartScreen() {
  const navigate = useNavigate();

  // Render the start screen UI
  return (
    <div className="stage">
      <div className="content">
        <img 
          src="/assets/img/logos/logo2.png"     // Game logo image
          alt="2 Truths and AI" 
          className="logo"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        
        <Button                             // Start Game button to navigate to lobby settings
          variant="primary" 
          size="xlarge"
          onClick={() => navigate('/lobby')}
          className="start-btn"
        >
          Start Game
        </Button>

        <div className="sub-row">
          <Button                               // How to Play button to navigate to instructions page
            variant="secondary"
            onClick={() => navigate('/how-to-play')}
            className="how-to-play-btn"
          >
            How to Play?
          </Button>

          <div className="right-controls">
            <Button                               // About Us button to navigate to about us page
              className="icon-btn info-btn" 
              onClick={() => navigate('/about-us')}
              title="About Us"
              variant="icon"
            >
              <img src="/assets/img/button-icons/letter-i.png" alt="About Us" />
              <div className="tooltip">About Us</div>
            </Button>

            <Button                            // Settings button to navigate to settings page
              className="icon-btn" 
              onClick={() => navigate('/settings')}
              title="Settings"
              variant="icon"
            >
              <img src="/assets/img/button-icons/setting.png" alt="Settings" />
              <div className="tooltip">Settings</div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
