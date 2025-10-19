/**
 * @fileoverview TruthInputs component for collecting player names and truths before starting the game.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './TruthInputs.css';

export default function TruthInputs() {
  const navigate = useNavigate();
  const { gameState, updatePlayerName, updateGameState } = useGame();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerData, setPlayerData] = useState({});

  // Get the current player based on index
  const currentPlayer = gameState.players[currentPlayerIndex];

  // Handle input changes for name and truths
  const handleInputChange = (field, value) => {
    setPlayerData({
      ...playerData,
      [currentPlayer.id]: {
        ...playerData[currentPlayer.id],
        [field]: value
      }
    });
  };

  // Save all truths to game state and navigate to loading screen
  const saveAllTruthsAndProceed = () => {
    // Update all players with their truths in game state
    const updatedPlayers = gameState.players.map(player => ({
      ...player,
      truth1: playerData[player.id]?.truth1 || '',
      truth2: playerData[player.id]?.truth2 || ''
    }));

    updateGameState({ players: updatedPlayers });
    
    // Navigate to loading screen where API call happens
    navigate('/loading');
  };

  // Proceed to next player or finish collecting truths
  const handleNext = () => {
    if (currentPlayerIndex < gameState.players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      // All players done, save truths and go to loading screen
      saveAllTruthsAndProceed();
    }
  };

  // Check if current player's inputs are complete
  const canProceed = () => {
    const data = playerData[currentPlayer?.id];
    return data?.name && data?.truth1 && data?.truth2;
  };

  // If no players are configured, show a message
  if (!currentPlayer) {
    return (
      <div className="stage">
        <Card>
          <h1>No players configured</h1>
          <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
        </Card>
      </div>
    );
  }

  // TODO: Render the truth inputs form for the current player as designed in mockups
  return (
    <div className="stage">
      <Card className="truth-input-card">
        <h1>Player {currentPlayerIndex + 1} of {gameState.players.length}</h1>
        <p className="lead">Enter your name and two true statements about yourself</p>

        <div className="input-group">
          <label htmlFor="player-name">Your Name</label>
          <input
            type="text"
            id="player-name"
            className="text-input"
            placeholder="Enter your name"
            value={playerData[currentPlayer.id]?.name || ''}
            onChange={(e) => {
              handleInputChange('name', e.target.value);
              updatePlayerName(currentPlayer.id, e.target.value);
            }}
          />
        </div>

        <div className="input-group">
          <label htmlFor="truth-1">Truth #1</label>
          <textarea
            id="truth-1"
            className="text-input textarea"
            placeholder="Enter your first truth..."
            rows="3"
            value={playerData[currentPlayer.id]?.truth1 || ''}
            onChange={(e) => handleInputChange('truth1', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="truth-2">Truth #2</label>
          <textarea
            id="truth-2"
            className="text-input textarea"
            placeholder="Enter your second truth..."
            rows="3"
            value={playerData[currentPlayer.id]?.truth2 || ''}
            onChange={(e) => handleInputChange('truth2', e.target.value)}
          />
        </div>

        <div className="controls">
          <Button 
            variant="outline" 
            onClick={() => {
              if (currentPlayerIndex > 0) {
                setCurrentPlayerIndex(currentPlayerIndex - 1);
              } else {
                navigate('/lobby');
              }
            }}
          >
            Back
          </Button>
          <Button 
            variant="primary" 
            size="large" 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentPlayerIndex < gameState.players.length - 1 ? 'Next Player' : 'Start Game'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
