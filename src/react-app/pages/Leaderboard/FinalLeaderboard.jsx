/**
 * @fileoverview FinalLeaderboard component displays the final scores and winner of the game.
 */

import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Button from '../../components/Button/Button';
import html2canvas from 'html2canvas';
import { exportGameStatsToPDF } from '../../utils/api';
import './Leaderboard.css';

// Import button icons
import homeIcon from '../../assets/img/button-icons/home.png';
import returnIcon from '../../assets/img/button-icons/return.png';
import addIcon from '../../assets/img/button-icons/add.png';
import downloadIcon from '../../assets/img/button-icons/download.png';
import exportIcon from '../../assets/img/button-icons/expand-arrows.png';
import logoIcon from '../../assets/img/logos/logo.png';

export default function FinalLeaderboard() {
  const navigate = useNavigate();
  const { gameState, resetGame } = useGame();
  const leaderboardRef = useRef(null);

  // Sort players by score to determine final standings
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    // Sort by score descending, then by name alphabetically for ties
    if ((b.score || 0) !== (a.score || 0)) {
      return (b.score || 0) - (a.score || 0);
    }
    return (a.name || '').localeCompare(b.name || '');
  });
  
  // Group players by score to handle ties
  const groupByScore = () => {
    const groups = [];
    let currentRank = 1;
    
    sortedPlayers.forEach((player, index) => {
      if (index === 0 || player.score === sortedPlayers[index - 1].score) {
        // Same rank as previous or first player
        if (groups.length === 0 || groups[groups.length - 1].score !== player.score) {
          groups.push({ rank: currentRank, score: player.score, players: [player] });
        } else {
          groups[groups.length - 1].players.push(player);
        }
      } else {
        currentRank = index + 1;
        groups.push({ rank: currentRank, score: player.score, players: [player] });
      }
    });
    
    return groups;
  };
  
  const scoreGroups = groupByScore();
  
  // Get podium groups (only show on podium if not tied)
  const podiumGroups = [];
  const gridGroups = [];
  
  scoreGroups.forEach((group, index) => {
    if (group.rank <= 3 && group.players.length === 1) {
      podiumGroups.push({ ...group, position: group.rank });
    } else {
      gridGroups.push(group);
    }
  });
  
  // Get medal/rank display
  const getRankDisplay = (rank) => {
    if (rank === 1) return { emoji: '🥇', text: '1st', color: '#FFD700' }; // Gold
    if (rank === 2) return { emoji: '🥈', text: '2nd', color: '#C0C0C0' }; // Silver
    if (rank === 3) return { emoji: '🥉', text: '3rd', color: '#CD7F32' }; // Bronze
    return { emoji: null, text: `${rank}th`, color: '#6B63FF' };
  };
  
  // Get ordinal suffix
  const getOrdinal = (rank) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  // Handlers for Play Again and Main Menu buttons
  const handlePlayAgain = () => {
    resetGame();
    navigate('/lobby');
  };

  const handleMainMenu = () => {
    resetGame();
    navigate('/start');
  };
  
  const handleBackToGameStats = () => {
    navigate('/game-stats');
  };

  // Download game data as JSON
  const handleDownloadGameData = () => {
    // Format: metadata object followed by round data
    const exportData = [
      {
        aiModel: gameState.aiModel || 'gpt-4',
        dateExported: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
        numAIStatements: gameState.rounds?.length || 0,
        numPlayers: gameState.players?.length || 0
      }
    ];

    // Add each round's data
    gameState.rounds?.forEach((round, roundIndex) => {
      const roundStatements = round.statements || [];
      
      // Group statements by player
      const playerStatements = {};
      roundStatements.forEach((statement) => {
        if (statement.type === 'truth' && statement.playerId) {
          if (!playerStatements[statement.playerId]) {
            playerStatements[statement.playerId] = {
              truths: [],
              playerName: statement.playerName || gameState.players.find(p => p.id === statement.playerId)?.name || ''
            };
          }
          playerStatements[statement.playerId].truths.push(statement.text);
        }
      });

      // Find AI statement
      const aiStatement = roundStatements.find(s => s.type === 'lie');

      // Create entry for each player in this round
      Object.keys(playerStatements).forEach((playerId) => {
        const playerData = playerStatements[playerId];
        const entry = {
          id: exportData.length,
          set: roundIndex + 1,
          playerID: parseInt(playerId),
          playerName: playerData.playerName
        };

        // Add truth statements
        playerData.truths.forEach((truth, idx) => {
          entry[`playerStatement${idx + 1}`] = truth;
        });

        // Add AI statement
        if (aiStatement) {
          entry.aiStatement = aiStatement.text;
        }

        exportData.push(entry);
      });
    });

    const dataStr = JSON.stringify(exportData, null, 4);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `2truths-ai-game-data-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download game data as PDF
  const handleDownloadGameDataPDF = async () => {
    try {
      await exportGameStatsToPDF(gameState);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Export leaderboard as PNG
  const handleExportLeaderboard = async () => {
    if (!leaderboardRef.current) return;
    
    try {
      // Hide all buttons and navigation elements
      const buttons = leaderboardRef.current.querySelectorAll('.leaderboard-actions, .nav-buttons-left, .icon-btn');
      buttons.forEach(btn => btn.style.display = 'none');

      const canvas = await html2canvas(leaderboardRef.current, {
        backgroundColor: '#0f0f10',
        scale: 2,
        logging: false
      });

      // Restore buttons
      buttons.forEach(btn => btn.style.display = '');

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `2truths-ai-leaderboard-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error exporting leaderboard:', error);
      alert('Failed to export leaderboard. Please try again.');
    }
  };
  
  // Calculate lie detection stats for a player
  const getLieDetectionStats = (player) => {
    const totalRounds = gameState.rounds?.length || 0;
    const detectedLies = gameState.rounds?.filter(round => {
      const vote = round.votes?.[player.id];
      const normalized = vote && typeof vote === 'object' && 'statementIndex' in vote ? vote.statementIndex : null;
      const lieIndex = round.statements?.findIndex(s => s.type === 'lie');
      return normalized === lieIndex;
    }).length || 0;
    return { detectedLies, totalRounds };
  };

  return (
    <div className="stage final-leaderboard-stage" ref={leaderboardRef}>
      <div className="final-leaderboard-top">
        <div className="nav-buttons-left">
          {/* Home above Back */}
          <button className="icon-btn home-btn" onClick={handleMainMenu} title="Back to Home">
            <img src={homeIcon} alt="Home" />
          </button>
          <button className="icon-btn back-btn-icon" onClick={handleBackToGameStats} title="Back to Game Stats">
            <img src={returnIcon} alt="Back" />
          </button>
        </div>

        <div className="final-leaderboard-header">
          <div className="header-title-row">
            <img src={logoIcon} alt="Logo" className="header-logo" />
            <h1 className="final-title">Leaderboard</h1>
          </div>
          <div className="title-underline"></div>
          <div className="header-meta-row">
            <div className="leaderboard-date">{new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}</div>
            <div className="rounds-played">{gameState.rounds?.length || 0} rounds played</div>
          </div>
        </div>

        <div className="header-right">
          <div className="leaderboard-actions top-actions">
            <Button className="start-new-game-btn" onClick={handlePlayAgain}>
              <img src={addIcon} alt="Add" className="btn-icon" />
              <div className="start-new-game-btn-content">
                <span className="btn-main-text">START A NEW GAME</span>
                <span className="subtitle">with different truths and settings</span>
              </div>
            </Button>
          </div>
          <div className="leaderboard-actions secondary-actions">
            <Button className="download-btn" onClick={handleDownloadGameData}>
              <img src={downloadIcon} alt="Download" className="btn-img" />
              <div>
                <div className="btn-label">DOWNLOAD</div>
                <span className="subtitle">Game Data (JSON)</span>
              </div>
            </Button>
            <Button className="download-btn pdf-btn" onClick={handleDownloadGameDataPDF}>
              <img src={downloadIcon} alt="Download PDF" className="btn-img" />
              <div>
                <div className="btn-label">DOWNLOAD</div>
                <span className="subtitle">Game Data (PDF)</span>
              </div>
            </Button>
            <Button className="export-btn" onClick={handleExportLeaderboard}>
              <img src={exportIcon} alt="Export" className="btn-img" />
              <div>
                <div className="btn-label">EXPORT</div>
                <span className="subtitle">The Leaderboard</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Single horizontal axis for ALL players */}
      <div className="final-all-ranks-horizontal">
        {scoreGroups.map((group) => (
          <React.Fragment key={`group-${group.rank}`}>
            {group.players.map((player) => {
              const rank = getRankDisplay(group.rank);
              const stats = getLieDetectionStats(player);
              
              return (
                <div key={player.id} className={`final-rank-card rank-${group.rank}`}>
                  <div className="rank-badge-top" style={{ backgroundColor: rank.color }}>
                    {rank.emoji || getOrdinal(group.rank)}
                  </div>
                  <img src={player.icon} alt={player.name} className="rank-player-icon" />
                  <div className="rank-player-name">{player.name}</div>
                  <div className="rank-player-label">Player {gameState.players.findIndex(p => p.id === player.id) + 1}</div>
                  <div className="rank-player-score">{player.score || 0} points</div>
                  <div className="rank-lies-detected">{stats.detectedLies} out of {stats.totalRounds} lies detected!</div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
