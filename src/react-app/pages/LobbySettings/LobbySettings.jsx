/**
 * @fileoverview LobbySettings component allows users to configure game settings such as number of players and AI model before starting the game.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './LobbySettings.css';

// Small chevron icons (simple inline SVG) used for increment/decrement
const ChevronLeft = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LobbySettings() {
  const navigate = useNavigate();
  const { initializeGame } = useGame();

  // Wireframe ranges and defaults
  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 6;
  const MIN_ROUNDS = 2;
  const MAX_ROUNDS = 20;
  const MIN_ROUND_LENGTH = 30; // seconds
  const MAX_ROUND_LENGTH = 600; // seconds

  const [numPlayers, setNumPlayers] = useState(2);
  const [numRounds, setNumRounds] = useState(2);
  const [roundLength, setRoundLength] = useState(30);
  const [aiModel, setAiModel] = useState('gpt-5-nano');

  // Assumption: Each round each player supplies 2 truths ("2-Truths-and-AI"),
  // so truths per player is ceil(numRounds / numPlayers) * 2.
  const truthsPerPlayer = useMemo(() => Math.ceil(numRounds / numPlayers) * 2, [numRounds, numPlayers]);

  // Guard rounds not to be less than players
  const clampRounds = (value) => Math.max(MIN_ROUNDS, Math.min(MAX_ROUNDS, value));

  const decPlayers = () => { setNumPlayers(p => Math.max(MIN_PLAYERS, p - 1)); };
  const incPlayers = () => { setNumPlayers(p => Math.min(MAX_PLAYERS, p + 1)); };

  // Ensure numRounds is always at least the number of players.
  // If players increase above the current rounds, automatically bump rounds.
  useEffect(() => {
    setNumRounds(r => Math.max(r, numPlayers));
  }, [numPlayers]);

  const decRounds = () => {
    setNumRounds(r => {
      const newR = Math.max(MIN_ROUNDS, r - 1);
      // ensure not less than players
      return Math.max(newR, numPlayers);
    });
  };
  const incRounds = () => { setNumRounds(r => Math.min(MAX_ROUNDS, r + 1)); };

  const decLength = () => { setRoundLength(l => Math.max(MIN_ROUND_LENGTH, l - 30)); };
  const incLength = () => { setRoundLength(l => Math.min(MAX_ROUND_LENGTH, l + 30)); };

  const AI_MODELS = ['gpt-5-nano', 'gpt-4.1-mini', 'gpt-35-turbo'];
  const decAiModel = () => {
    setAiModel(prev => {
      const idx = AI_MODELS.indexOf(prev);
      const newIdx = idx <= 0 ? AI_MODELS.length - 1 : idx - 1;
      return AI_MODELS[newIdx];
    });
  };
  const incAiModel = () => {
    setAiModel(prev => {
      const idx = AI_MODELS.indexOf(prev);
      const newIdx = (idx === -1 || idx >= AI_MODELS.length - 1) ? 0 : idx + 1;
      return AI_MODELS[newIdx];
    });
  };

  // When user clicks Start, initialize game by using context provider method and navigate to truth inputs page for the first player
  const handleStart = () => {
    // initializeGame signature in GameContext may accept an object; fall back to known args
    try {
      if (initializeGame) initializeGame({ numPlayers, numRounds, roundLength, aiModel });
    } catch (e) {
      try { initializeGame(numPlayers, aiModel); } catch (e) { navigate('/start'); }
    }
    navigate('/truth-inputs');
  };

  // Reset all settings to defaults
  const resetDefaults = () => {
    setNumPlayers(2);
    setNumRounds(2);
    setRoundLength(30);
    setAiModel('gpt-5-nano');
  };

  //Render the lobby settings
    return (
    <div className="lobby-stage">
      <Button variant="icon" className="home-btn" aria-label="Home" onClick={() => navigate('/')}>
        <img src="/assets/img/button-icons/home.png" alt="Home" style={{width: '22px'}} />
      </Button>

      <Card className="lobby-card">
        <h1 className="title">Lobby Creation Settings</h1>
        <div className="divider" />

        <div className="setting-row">
          <div className="setting-label">Number of Players <span className="muted">(2-6)</span></div>
          <div className="dots" aria-hidden />
          <div className="setting-control">
            <Button className="chev" onClick={decPlayers} aria-label="Decrease players" disabled={numPlayers <= MIN_PLAYERS}><ChevronLeft /></Button>
            <div className="setting-value">{numPlayers}</div>
            <Button className="chev" onClick={incPlayers} aria-label="Increase players" disabled={numPlayers >= MAX_PLAYERS}><ChevronRight /></Button>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-label">Number of Rounds <span className="muted">(2-20)</span></div>

          <div className="dots" aria-hidden />
          <div className="setting-control">
            <Button className="chev" onClick={decRounds} aria-label="Decrease rounds" disabled={numRounds <= Math.max(MIN_ROUNDS, numPlayers)}><ChevronLeft /></Button>
            <div className="setting-value">{numRounds}</div>
            <Button className="chev" onClick={incRounds} aria-label="Increase rounds" disabled={numRounds >= MAX_ROUNDS}><ChevronRight /></Button>
          </div>
          <div className="help-text">You cannot set the number of rounds to be less than the number of players.</div>

        </div>

        <div className="setting-row">
          <div className="setting-label">Round Length</div>
          <div className="dots" aria-hidden />
          <div className="setting-control">
            <Button className="chev" onClick={decLength} aria-label="Decrease round length" disabled={roundLength <= MIN_ROUND_LENGTH}><ChevronLeft /></Button>
            <div className="setting-value">{roundLength} seconds</div>
            <Button className="chev" onClick={incLength} aria-label="Increase round length" disabled={roundLength >= MAX_ROUND_LENGTH}><ChevronRight /></Button>
          </div>
          <div className="help-text">Quicker rounds place a higher importance on correctly identifying lies.</div>

        </div>

        <div className="setting-row ai-row">
          <div className="setting-label">AI Model</div>
          <div className="dots" aria-hidden />
          <div className="setting-control">
            <Button className="chev" onClick={decAiModel} aria-label="Previous AI model"><ChevronLeft /></Button>
            <div className="setting-value">{aiModel}</div>
            <Button className="chev" onClick={incAiModel} aria-label="Next AI model"><ChevronRight /></Button>
          </div>
          <div className="help-text">
            {aiModel === 'gpt-5-nano' ?
              '"Normal" difficulty. Generates highly convincing lies. Slower than mini. Recommended for first time players.' :
              aiModel === 'gpt-4.1-mini' ?
                '"Easy" difficulty. Generates fairly believable lies. Fastest model.' :
                '"Extremely Easy" difficulty. Generates poorly conceived lies. Not recommended for first time players.'}
          </div>
        </div>

        <div className="unchangeable">
          <div className="small-muted">(Unchangeable)</div>
          <div className="truths-label">Number of Truths Per Player: <span className="truths-value">{truthsPerPlayer}</span></div>
          <div className="help-text">Calculated so that there are enough truths to cover all rounds.</div>
        </div>

        <div className="confirm-row">
          <Button className="confirm-btn" onClick={handleStart}>Confirm Settings and Start!</Button>
          <Button className="reset-link" variant="outline" onClick={resetDefaults}>Reset to Default Settings</Button>
        </div>
      </Card>
    </div>
  );
}
