/**
 * @fileoverview RoundScreen component where players guess the AI-generated lie.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './RoundScreen.css';

export default function RoundScreen() {
  const navigate = useNavigate();
  const { gameState, updateScore, nextRound } = useGame();
  const [selectedStatement, setSelectedStatement] = useState(null);

  // Mock data - in real implementation, this would come from game state
  const mockStatements = [
    { id: 1, text: "I learned to rollerblade in elementary school.", isLie: false },
    { id: 2, text: "I have never broke a bone.", isLie: false },
    { id: 3, text: "I once won a local scavenger hunt competition.", isLie: true }
  ];

  const handleSelectStatement = (statementId) => {
    setSelectedStatement(statementId);
  };

  // TODO: This logic is wrong. All players should be able to vote on each round by clicking on their icon and then selecting the lie OR we rotate through players automatically
  // and signal turn changes with a modal that appears and disappears over screen breifly and highlighting/enlarging current player's icon.
  const handleSubmit = () => {
    const selectedStmt = mockStatements.find(s => s.id === selectedStatement);
    if (selectedStmt?.isLie) {
      // Correct guess - award points
      // TODO: Fix this to use actual current player index when implementing proper turn logic
      updateScore(gameState.players[0]?.id, 10);
    }
    
    // Move to next round or show results
    nextRound();
    navigate('/round-leaderboard');
  };

  //TODO: Render the round screen UI as per design
  return (
    <div className="stage">
      <Card className="round-card">
        <h1>Round {gameState.currentRound + 1}</h1>
        <p className="lead">Which statement is the AI-generated lie?</p>

        <div className="player-info">
          <h2>Current Player: {gameState.players[0]?.name || 'Player 1'}</h2>
        </div>

        <div className="statements-container">
          {mockStatements.map((statement) => (
            <button
              key={statement.id}
              className={`statement-card ${selectedStatement === statement.id ? 'selected' : ''}`}
              onClick={() => handleSelectStatement(statement.id)}
            >
              {statement.text}
            </button>
          ))}
        </div>

        <div className="controls">
          <Button 
            variant="primary" 
            size="large"
            onClick={handleSubmit}
            disabled={!selectedStatement}
          >
            Submit Answer
          </Button>
        </div>
      </Card>
    </div>
  );
}
