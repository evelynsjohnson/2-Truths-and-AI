/**
 * @fileoverview FinalLeaderboard component displays the final scores and winner of the game.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './Leaderboard.css';

export default function FinalLeaderboard() {
  const navigate = useNavigate();
  const { gameState, resetGame } = useGame();     // Access game state and reset function from context

  // Sort players by score to determine final standings and get the winner
  const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sortedPlayers[0];

  // Handlers for Play Again and Main Menu buttons
  const handlePlayAgain = () => {
    resetGame();
    navigate('/lobby');
  };

  const handleMainMenu = () => {
    resetGame();
    navigate('/start');
  };

  // TODO: Render the final leaderboard
  return (
    <div className="stage">
      <Card className="leaderboard-card">
        <h1>🎉 Game Over! 🎉</h1>
        {winner && (
          <p className="lead winner-announcement">
            {winner.name || `Player ${winner.id}`} wins with {winner.score || 0} points!
          </p>
        )}

        <div className="leaderboard">
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className={`leaderboard-item rank-${index + 1}`}>
              <div className="rank">#{index + 1}</div>
              <div className="player-name">{player.name || `Player ${player.id}`}</div>
              <div className="score">{player.score || 0} pts</div>
            </div>
          ))}
        </div>

        <div className="controls">
          <Button variant="outline" onClick={handleMainMenu}>
            Main Menu
          </Button>
          <Button variant="primary" size="large" onClick={handlePlayAgain}>
            Play Again
          </Button>
        </div>
      </Card>
    </div>
  );
}
