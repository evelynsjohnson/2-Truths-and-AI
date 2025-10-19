/**
 * @fileoverview RoundLeaderboard component displays the leaderboard after each round, showing player rankings and scores.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './Leaderboard.css';

export default function RoundLeaderboard() {
  const navigate = useNavigate();
  const { gameState } = useGame();

  // Sort players by score to determine current standings
  const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));

  // Handler for Continue button to proceed to next round or final leaderboard
  //TODO: Implement logic to check if more rounds remain. The number of rounds is the same as the number of players (OR ASK PLAYERS IF THEY WANT MORE ROUNDS)
  const handleNextRound = () => {
    if (gameState.currentRound < 3) { // Example: 3 rounds total
      navigate('/round');
    } else {
      navigate('/final-leaderboard');
    }
  };

  // TODO: Render the round leaderboard as designed in mockups
  return (
    <div className="stage">
      <Card className="leaderboard-card">
        <h1>Round {gameState.currentRound} Complete!</h1>
        <p className="lead">Current Standings</p>

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
          <Button variant="primary" size="large" onClick={handleNextRound}>
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
