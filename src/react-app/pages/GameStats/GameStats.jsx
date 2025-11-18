/**
 * @fileoverview GameStats component computes and displays post-game statistics:
 * - Most Believable AI Lie
 * - Truth That Tricked the Most
 * - Sneakiest Chameleon
 * - Fastest Guesser
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './GameStats.css';
import '../LoadingScreen/LoadingScreen.css';

function safeText(str) {
  return typeof str === 'string' && str.trim().length > 0 ? str : 'Unknown';
}

export default function GameStats() {
  const navigate = useNavigate();
  const { gameState } = useGame();
  const [isLoading, setIsLoading] = useState(true);

  // Compute stats from gameState.rounds and gameState.players
  const stats = useMemo(() => {
    const rounds = Array.isArray(gameState.rounds) ? gameState.rounds : [];
    const players = Array.isArray(gameState.players) ? gameState.players : [];

    // Most Believable AI Lie: round where the AI-generated lie fooled the most players
    let mostBelievable = null; // {count, text, roundIndex, player}

    // Truth that tricked the most: a truth statement that was incorrectly chosen as the lie the most times
    const truthMistakeCounts = new Map(); // text -> {count, roundIndex, player}

    // Sneakiest Chameleon: player who tricked the most people across rounds
    const chameleonFooledCounts = new Map(); // playerId -> {count, name}

    // Fastest Guesser: smallest guess time (roundLength - timeRemaining) among correct guesses
    let fastestGuess = null; // {playerId, playerName, guessTime, roundIndex, statement}

    // Completed Rounds: not skipped over, at least 1 vote recorded
    let completedRounds = 0;

    const defaultRoundLength = Number(gameState.roundLength) || null;

    rounds.forEach((round, rIndex) => {
      const statements = Array.isArray(round.statements) ? round.statements : [];
      const votes = round.votes || {};
      const results = round.results || {};

      // Completed Rounds, where there is at least 1 vote.
      const hasVotes = round?.votes && Object.keys(round.votes).length > 0;
      if (hasVotes) {
        completedRounds += 1;
      }

      // Determine lie index
      const lieIndex = statements.findIndex(s => s.type === 'lie');

      // Count fooled players for this round using results (if available) or by analyzing votes
      let fooledCount = 0;
      // If results has chameleon info with fooledPlayers, use it
      const chameleonId = round.player?.id;
      if (results.playerResults && results.playerResults[chameleonId] && Array.isArray(results.playerResults[chameleonId].fooledPlayers)) {
        fooledCount = results.playerResults[chameleonId].fooledPlayers.length;
      } else {
        // Fallback: count how many non-chameleon players selected the lie statement index
        Object.entries(votes).forEach(([, vote]) => {
          const normalized = vote && typeof vote === 'object' && 'statementIndex' in vote ? vote.statementIndex : null;
          if (normalized === lieIndex && Number(vote?.playerId) !== chameleonId) {
            fooledCount += 1;
          }
        });
      }

      // Update most believable
      const lieText = statements[lieIndex]?.text;
      if (lieText) {
        if (!mostBelievable || fooledCount > mostBelievable.count) {
          mostBelievable = { count: fooledCount, text: lieText, roundIndex: rIndex + 1, player: round.player };
        }
      }

      // Update truthMistakeCounts by iterating truth statements and counting votes for them
      statements.forEach((st, sIndex) => {
        if (st.type !== 'truth') return;
        let mistaken = 0;
        Object.values(votes).forEach(vote => {
          const normalized = vote && typeof vote === 'object' && 'statementIndex' in vote ? vote.statementIndex : null;
          if (normalized === sIndex) mistaken += 1;
        });

        const existing = truthMistakeCounts.get(st.text) || { count: 0, roundIndex: rIndex + 1, player: round.player };
        existing.count += mistaken;
        truthMistakeCounts.set(st.text, existing);
      });

      // Update chameleon fooled totals
      if (round.player && typeof round.player.id !== 'undefined') {
        const prev = chameleonFooledCounts.get(round.player.id) || { count: 0, name: round.player.name };
        prev.count += fooledCount;
        chameleonFooledCounts.set(round.player.id, prev);
      }

      // Fastest guesser: iterate votes and find correct guesses (vote.statementIndex === lieIndex)
      Object.entries(votes).forEach(([playerId, vote]) => {
        const normalized = vote && typeof vote === 'object' && 'statementIndex' in vote ? vote.statementIndex : null;
        const timeRemaining = Number(vote?.timeRemaining);
        if (normalized === lieIndex) {
          // compute guessTime if we have roundLength
          const roundLen = Number(round.roundLength || defaultRoundLength) || null;
          const guessTime = roundLen !== null && Number.isFinite(timeRemaining) ? (roundLen - timeRemaining) : null;

          // If we don't have roundLen but vote includes a raw timer (unlikely), skip
          if (guessTime !== null) {
            if (!fastestGuess || guessTime < fastestGuess.guessTime) {
              const player = players.find(p => String(p.id) === String(playerId)) || { name: `Player ${playerId}` };
              fastestGuess = { playerId: Number(playerId), playerName: player.name || `Player ${playerId}`, guessTime, roundIndex: rIndex + 1, statement: statements[lieIndex]?.text };
            }
          }
        }
      });
    });

    // Pick truth that tricked the most
    let truthThatTricked = null;
    for (const [text, info] of truthMistakeCounts.entries()) {
      if (!truthThatTricked || info.count > truthThatTricked.count) {
        truthThatTricked = { text, count: info.count, roundIndex: info.roundIndex, player: info.player };
      }
    }

    // Pick sneakiest chameleon
    let sneakiest = null;
    for (const [playerId, info] of chameleonFooledCounts.entries()) {
      if (!sneakiest || info.count > sneakiest.count) {
        sneakiest = { playerId, name: info.name, count: info.count};
      }
    }
    return {
      mostBelievable,
      truthThatTricked,
      sneakiest,
      fastestGuess, 
      completedRounds
    };
  }, [gameState.rounds, gameState.players, gameState.roundLength]);

  useEffect(() => {
    // Keep loading message visible for 4 seconds so players have time to read it
    const t = setTimeout(() => setIsLoading(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const goToLeaderboard = () => navigate('/final-leaderboard');
  // look up full player info for sneakiest player avi based on id
  const sneakiestPlayer = stats.sneakiest
    ? gameState.players.find(p => p.id === stats.sneakiest.playerId)
    : null;

  return (
    <div className="stage stats-stage">
      <Card className="stats-card">
        {isLoading ? (
          <>
            <h1 className="stats-loading">The Game Is Over! Loading Game Stats...</h1>
            <p className="stats-sub">Crunching the numbers to find the most devious players and convincing AI lies.</p>

            {/* Use the same spinner used by LoadingScreen */}
            <div className="loading-spinner" role="status" aria-live="polite" aria-label="Loading game stats">
              <div className="spinner"></div>
            </div>
          </>
        ) : (
          <>
            <h1 className="stats-title">Game Stats</h1>
            <p className='stats-subtitle'>Here's a breakdown of the game based on {stats.completedRounds}/{gameState.numRounds} rounds completed.</p>
            <div className="stat-grid">
              {/* <section className="stat-block"> */}
                {stats.sneakiest ? (
                  <>
                    <div className='title-stat-card'>
                      <div className='stat-card-text'>
                        <p className='winning-player'>{sneakiestPlayer?.name}</p>
                        <p className='winning-title'>Sneakiest Chameleon</p>
                        <p className='title-desc'>Tricked a total of {stats.sneakiest.count} players.</p>
                      </div>
                      <div className='icon-frame'>
                        <img src={sneakiestPlayer?.icon} alt={sneakiestPlayer?.name} className="player-icon"></img>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                  <div className='title-stat-card'>
                    <p className='stat-card-blank'>No chameleons managed to trick anyone.</p>
                  </div>
                  </>
                )}
              {/* </section> */}

              {/* <section className="stat-block"> */}
                {stats.fastestGuess ? (
                  <>
                    <div className='title-stat-card'>
                      <div className='stat-card-text'>
                        <p className='winning-player'>{stats.fastestGuess.playerName}</p>
                        <p className='winning-title'>Fastest Guesser</p>
                        <p className='title-desc'>Got it right in {Math.max(0, Math.round(stats.fastestGuess.guessTime * 100) / 100)}s! (Round {stats.fastestGuess.roundIndex})</p>
                      </div>
                      <div className='icon-frame'>
                        <img src={sneakiestPlayer?.icon} alt={sneakiestPlayer?.name} className="player-icon"></img>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                  <div className='title-stat-card'>
                    <p className='stat-card-blank'>No correct guesses with timing information were recorded.</p>
                  </div>
                  </>
                )}
              {/* </section> */}
            </div>
            <section className="stat-block">
              <h2>Most Believable AI Lie:</h2>
              {stats.mostBelievable ? (
                <>
                <div className='quote-stat'>
                  <div className="stat-num-card">
                    <p className="stat-num">{stats.mostBelievable.count}</p>
                    <p className='stat-cap'>players successfully <br></br> guessed</p>
                  </div>
                  <div className="stat-quote-card">
                    <p><span className='quotation-mark'>" </span><span className='quote'>{safeText(stats.mostBelievable.text)}</span><span className='quotation-mark'> "</span></p>
                    <p className='quote-details'>{stats.mostBelievable.player?.name || 'a player'}'s truth in Round {stats.mostBelievable.roundIndex}</p>
                  </div>
                </div>
                </>
              ) : (
                <>
                <div className='quote-card-blank'>
                  <p>No AI lies fooled any players this game.</p>
                </div>
                </>
              )}
            </section>

            <section className="stat-block">
              <h2>Truth That Tricked the Most:</h2>
              {stats.truthThatTricked && stats.truthThatTricked.count > 0 ? (
                <>
                <div className='quote-stat'>
                  <div className="stat-num-card">
                    <p className="stat-num">{stats.truthThatTricked.count}</p>
                    <p className='stat-cap'>players incorrectly<br></br>guessed</p>
                  </div>
                  <div className="stat-quote-card">
                    <p><span className='quotation-mark'>" </span><span className='quote'>{safeText(stats.truthThatTricked.text)}</span><span className='quotation-mark'> "</span></p>
                    <p className='quote-details'>{stats.mostBelievable.player?.name || 'a player'}'s truth in Round {stats.truthThatTricked.roundIndex}</p>
                  </div>
                </div>
                </>
              ) : (
                <>
                  <div className='quote-card-blank'>
                    <p>No truths were commonly mistaken for AI lies.</p>
                  </div>
                </>
              )}
            </section>

            <div className="controls stats-controls">
              <Button variant="primary" size="large" onClick={goToLeaderboard}>
                To Leaderboard!
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
