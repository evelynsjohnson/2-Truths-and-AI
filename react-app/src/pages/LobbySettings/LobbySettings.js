/**
 * @fileoverview LobbySettings component allows users to configure game settings such as number of players and AI model before starting the game.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './LobbySettings.css';

export default function LobbySettings() {
  const navigate = useNavigate();
  const { initializeGame } = useGame();       // Function to initialize game with settings
  const [numPlayers, setNumPlayers] = useState(2);      // Default to 2 players
  const [aiModel, setAiModel] = useState('gpt-5-nano');  // Default AI model

  // When user clicks Start, initialize game by using context provider method and navigate to truth inputs page for the first player
  const handleStart = () => {
    initializeGame(numPlayers, aiModel);
    navigate('/truth-inputs');
  };

  //TODO: Render the lobby settings form as we sketched in mockups
  return (
    <div className="stage">
      <Card className="lobby-card">
        <h1>Game Setup</h1>
        <p className="lead">Configure your game settings</p>

        <div className="settings-group">
          <label htmlFor="num-players">Number of Players</label>
          <select 
            id="num-players"
            value={numPlayers}
            onChange={(e) => setNumPlayers(Number(e.target.value))}
            className="select-input"
          >
            {[2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Players</option>
            ))}
          </select>
        </div>

        <div className="settings-group">
          <label htmlFor="ai-model">AI Model</label>
          <select 
            id="ai-model"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="select-input"
          >
            <option value="gpt-5-nano">GPT-5 Nano</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3">Claude 3</option>
          </select>
        </div>

        <div className="controls">
          <Button variant="outline" onClick={() => navigate('/start')}>
            Back
          </Button>
          <Button variant="primary" size="large" onClick={handleStart}>
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
