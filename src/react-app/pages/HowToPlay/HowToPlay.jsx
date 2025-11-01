/**
 * @fileoverview HowToPlay component that explains the game rules and steps.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './HowToPlay.css';

export default function HowToPlay() {
  const navigate = useNavigate();

  // Render the How To Play page
  return (
    <main className="how-to-play-stage" role="main" aria-labelledby="howto-title">
      <div className="how-to-play-content">
        <header className="how-to-play-header">
          <Button                                                 // Home button to navigate back to start screen
            className="how-to-play-home-btn" 
            aria-label="Go home" 
            onClick={() => navigate('/start')}
            variant="icon"
          >
            <img src="/assets/img/button-icons/home.png" alt="Home" />
          </Button>

          <div>
            <h1 id="howto-title" className="how-to-play-title">How To Play?</h1>
            <div className="how-to-play-divider" aria-hidden="true"></div>
          </div>
        </header>

        <section className="how-to-play-steps" aria-label="How to play steps">                {/* Game steps section */}
          <div className="how-to-play-step-num" aria-hidden="true">1</div>
          <div className="how-to-play-step">
            <h3>Enter Your Truths</h3>
            <p>
              Each player writes 2 or more true statements about themselves. Be specific but concise to help the AI learn
              your writing style.
            </p>
          </div>

          <div className="how-to-play-step-num" aria-hidden="true">2</div>
          <div className="how-to-play-step">
            <h3>AI Generates Lies</h3>
            <p>
              Our AI crafts one believable lie for each pair of truths, matching your tone and style so other players
              have to think twice.
            </p>
          </div>

          <div className="how-to-play-step-num" aria-hidden="true">3</div>
          <div className="how-to-play-step">
            <h3>Spot the Lie!</h3>
            <p>
              In each round, players review the three statements (two truths and one AI-generated lie) and vote on which
              they think is the lie.
            </p>
          </div>

          <div className="how-to-play-step-num" aria-hidden="true">4</div>
          <div className="how-to-play-step">
            <h3>Earn Points</h3>
            <p>
              Score points for correct guesses and for fooling other players with your truths. The fastest correct
              guesses earn bonus points.
            </p>
          </div>
        </section>

        {/* Suggestions and tips */}
        <p className="how-to-play-note">Don't be afraid to discuss with other players before voting — that's what makes the game fun!</p>
      </div>
    </main>
  );
}
