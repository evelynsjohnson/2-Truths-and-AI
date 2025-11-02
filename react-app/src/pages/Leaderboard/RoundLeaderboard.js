/**
 * @fileoverview RoundLeaderboard component displays the leaderboard after each round, showing player rankings and scores.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import './Leaderboard.css';

export default function RoundLeaderboard() {
  const navigate = useNavigate();
  const { gameState } = useGame();

  // Sort players by score to determine current standings
  const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));

  const roundNumber = gameState.currentRound + 1;
  const totalRounds = gameState.rounds?.length || 0;

  // Handler for Continue button to proceed to next round or final leaderboard
  const handleNextRound = () => {
    if (gameState.currentRound < gameState.rounds.length - 1) {
      navigate('/round');
    } else {
      navigate('/final-leaderboard');
    }
  };

  const handleEndGameEarly = () => {
    if (window.confirm('Are you sure you want to end the game early?')) {
      navigate('/final-leaderboard');
    }
  };

  // Get medal/rank display for top 3 players
  const getRankDisplay = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getRankSuffix = (index) => {
    const num = index + 1;
    if (num === 1) return 'st';
    if (num === 2) return 'nd';
    if (num === 3) return 'rd';
    return 'th';
  };

  return (
    <div className="stage round-leaderboard-stage">
      <div className="round-leaderboard-header">
        <div className="round-info-label">
          Round {roundNumber} (out of {totalRounds})
        </div>
        
        <h1 className="leaderboard-title">Round Leaderboard</h1>
        
        <div className="header-actions">
          <button className="next-round-btn" onClick={handleNextRound}>
            Next Round ▶
          </button>
          <button className="end-game-btn" onClick={handleEndGameEarly}>
            ✕ End Game Early
          </button>
        </div>
      </div>

      <div className="podium-container">
        {sortedPlayers.slice(0, 3).map((player, index) => {
          const position = index === 0 ? 'first' : index === 1 ? 'second' : 'third';
          const displayIndex = index === 1 ? 0 : index === 0 ? 1 : 2; // Reorder for visual: 2nd, 1st, 3rd
          
          return (
            <div key={player.id} className={`podium-card ${position}`} style={{ order: displayIndex }}>
              <div className="podium-rank">{getRankDisplay(index)}</div>
              <img src={player.icon} alt={player.name} className="podium-icon" />
              <div className="podium-name">{player.name}</div>
              <div className="podium-score">{player.score || 0} Points</div>
            </div>
          );
        })}
      </div>

      <div className="lower-ranks">
        {sortedPlayers.slice(3).map((player, index) => {
          const actualIndex = index + 3;
          return (
            <div key={player.id} className="lower-rank-card">
              <div className="lower-rank-position">{actualIndex + 1}{getRankSuffix(actualIndex)}</div>
              <img src={player.icon} alt={player.name} className="lower-rank-icon" />
              <div className="lower-rank-name">{player.name}</div>
              <div className="lower-rank-score">{player.score || 0} pts</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
