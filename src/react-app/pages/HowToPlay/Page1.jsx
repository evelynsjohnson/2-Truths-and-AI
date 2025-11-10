/**
 * @fileoverview Page1 component that explains how to fill out the player card.
 */

import React from 'react';
import './HowToPlay.css';

export default function Page1() {
  return (
    <div className="howto-page two-column">
      <div className="howto-left">
        <ol className="howto-list">
          <li><span className="howto-link">Enter your player name.</span><span className='howto-text'> This will show up on your player card and the leaderboard.</span></li>
          <li><span className="howto-link">Choose your icon!</span><span className='howto-text'> Flip through 10+ available icons, and choose the one that best suites you. Are you Kuchipatchi (the green little guy)?</span></li>
          <li><span className="howto-link">Enter your truths.</span><span className="howto-text"> This is what our AI will use to create the lies. Make sure to properly
            format your truths with full capitalization, grammar, and punctuation to help the AI create the most believable lie.</span></li>
        </ol>

        {/* Hover Tooltip */}
        <div className="help-hover" onMouseEnter={() => setShowShortcuts(true)}>
          <div className="help-bub">?</div>
          <div className="help-text">Tip: Toggle fullscreen for an immersive view!</div>

          <div className="shortcut-tooltip">
            <h4>Shortcut Commands</h4>
            <ul>
              <li><b>Mac: </b><kbd>Command ⌘ + Shift + F</kbd></li>
              <li><b>Windows: </b><kbd>Fn + F11</kbd></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="howto-right" aria-hidden="true">
        <video 
          className="demo-video" 
          autoPlay
          loop 
          muted
          playsInline
        >
          <source src="/assets/mp4/truth-input-demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
