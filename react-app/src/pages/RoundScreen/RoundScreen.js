/**
 * @fileoverview RoundScreen component where players guess the AI-generated lie.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import Button from '../../components/Button/Button';
import './RoundScreen.css';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

const FLAT_CORRECT_BONUS = 50;
const FIRST_GUESS_BONUS = 25;
const TRICKERY_BONUS = 25;
const STREAK_STEP = 10;
const SPEED_DIVISOR = 2;
const SCORE_ANIMATION_DURATION = 1200;

const toHalfPoints = (seconds) => {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  return Math.max(0, Math.round(safeSeconds / SPEED_DIVISOR));
};

const normalizeVote = (vote) => {
  if (!vote) return null;
  if (typeof vote === 'object' && vote !== null && 'statementIndex' in vote) {
    return {
      statementIndex: Number(vote.statementIndex),
      timeRemaining: Number(vote.timeRemaining) || 0
    };
  }
  return {
    statementIndex: Number(vote),
    timeRemaining: 0
  };
};

function calculateRoundResults({ players, votes, statements, chameleonId }) {
  const playerCount = players.length;
  const lieIndex = Math.max(0, statements.findIndex(statement => statement.type === 'lie'));

  const normalizedVotes = new Map();
  Object.entries(votes || {}).forEach(([playerId, vote]) => {
    const normalized = normalizeVote(vote);
    if (normalized) {
      normalizedVotes.set(Number(playerId), normalized);
    }
  });

  const results = {};
  const nonChameleonPlayers = players.filter(player => player.id !== chameleonId);

  const correctVotes = nonChameleonPlayers
    .map(player => {
      const vote = normalizedVotes.get(player.id);
      if (!vote || vote.statementIndex !== lieIndex) return null;
      return { playerId: player.id, timeRemaining: vote.timeRemaining || 0 };
    })
    .filter(Boolean);

  let bestTime = -1;
  correctVotes.forEach(({ timeRemaining }) => {
    if (timeRemaining > bestTime) {
      bestTime = timeRemaining;
    }
  });

  const firstGuessers = new Set();
  if (playerCount >= 3 && bestTime >= 0) {
    correctVotes.forEach(({ playerId, timeRemaining }) => {
      if (timeRemaining === bestTime) {
        firstGuessers.add(playerId);
      }
    });
  }

  const fooledPlayers = [];

  nonChameleonPlayers.forEach(player => {
    const vote = normalizedVotes.get(player.id);
    const previousStreak = Number.isFinite(player.streak) ? player.streak : 0;

    if (!vote) {
      results[player.id] = {
        total: 0,
        breakdown: { flat: 0, speed: 0, firstGuess: 0, streak: 0 },
        correct: false,
        newStreak: 0
      };
      return;
    }

    if (vote.statementIndex === lieIndex) {
      const speed = toHalfPoints(vote.timeRemaining);
      const flat = FLAT_CORRECT_BONUS;
      const firstGuess = playerCount >= 3 && firstGuessers.has(player.id) ? FIRST_GUESS_BONUS : 0;
      const newStreak = previousStreak + 1;
      const streakBonus = playerCount >= 3 ? newStreak * STREAK_STEP : 0;
      const total = flat + speed + firstGuess + streakBonus;

      results[player.id] = {
        total,
        breakdown: { flat, speed, firstGuess, streak: streakBonus },
        correct: true,
        newStreak
      };
    } else {
      fooledPlayers.push({
        playerId: player.id,
        timeBonus: toHalfPoints(vote.timeRemaining)
      });

      results[player.id] = {
        total: 0,
        breakdown: { flat: 0, speed: 0, firstGuess: 0, streak: 0 },
        correct: false,
        newStreak: 0
      };
    }
  });

  const chameleon = players.find(player => player.id === chameleonId);
  if (chameleon) {
    const trickeryBonus = fooledPlayers.length * TRICKERY_BONUS;
    const timeBonus = fooledPlayers.reduce((sum, fooled) => sum + fooled.timeBonus, 0);
    const total = trickeryBonus + timeBonus;

    results[chameleonId] = {
      total,
      breakdown: { trickeryBonus, timeBonus },
      correct: false,
      isChameleon: true,
      fooledPlayers,
      newStreak: Number.isFinite(chameleon.streak) ? chameleon.streak : 0
    };
  }

  players.forEach(player => {
    if (!results[player.id]) {
      const isCham = player.id === chameleonId;
      results[player.id] = {
        total: 0,
        breakdown: isCham ? { trickeryBonus: 0, timeBonus: 0 } : { flat: 0, speed: 0, firstGuess: 0, streak: 0 },
        correct: false,
        isChameleon: isCham,
        newStreak: isCham ? (Number.isFinite(player.streak) ? player.streak : 0) : 0
      };
    }
  });

  return {
    lieIndex,
    playerResults: results
  };
}

export default function RoundScreen() {
  const navigate = useNavigate();
  const { gameState, updateGameState } = useGame();
  const { playClick, playSound } = useSoundEffect();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [votes, setVotes] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const { setPlaybackRate } = useBackgroundMusic();
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedLieIndex, setRevealedLieIndex] = useState(null);
  const [scoreAnimations, setScoreAnimations] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [displayScores, setDisplayScores] = useState({});
  const scoreAnimationRefs = useRef({});
  const countdownPlayedRef = useRef(new Set());
  const finalPlayedRef = useRef(false);
  const [showTimeUp, setShowTimeUp] = useState(false);

  const currentRoundData = gameState.rounds?.[gameState.currentRound];

  const animateScore = useCallback((playerId, start, end) => {
    if (scoreAnimationRefs.current[playerId]) {
      cancelAnimationFrame(scoreAnimationRefs.current[playerId]);
    }

    const safeStart = Number.isFinite(start) ? start : 0;
    const safeEnd = Number.isFinite(end) ? end : 0;
    const delta = safeEnd - safeStart;

    if (delta === 0) {
      setDisplayScores(prev => ({ ...prev, [playerId]: safeEnd }));
      return;
    }

    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / SCORE_ANIMATION_DURATION);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      const current = Math.round(safeStart + delta * eased);

      setDisplayScores(prev => ({ ...prev, [playerId]: current }));

      if (progress < 1) {
        scoreAnimationRefs.current[playerId] = requestAnimationFrame(step);
      } else {
        scoreAnimationRefs.current[playerId] = null;
      }
    };

    scoreAnimationRefs.current[playerId] = requestAnimationFrame(step);
  }, []);

  const beginReveal = useCallback((trigger = 'manual') => {
    if (hasSubmitted || !currentRoundData || !Array.isArray(gameState.rounds)) {
      return;
    }

    setHasSubmitted(true);
    setSelectedPlayer(null);
    setPlaybackRate(1);

    const previousScores = new Map(
      (gameState.players || []).map(player => [player.id, player.score || 0])
    );

    const { lieIndex, playerResults } = calculateRoundResults({
      players: gameState.players,
      votes,
      statements: currentRoundData.statements || [],
      chameleonId: currentRoundData.player?.id
    });

    setRevealedLieIndex(lieIndex);
    setIsRevealing(true);
    setTimeRemaining(0);

    const updatedRounds = [...gameState.rounds];
    updatedRounds[gameState.currentRound] = {
      ...currentRoundData,
      votes,
      results: {
        lieIndex,
        playerResults,
        trigger
      }
    };

    const updatedPlayers = gameState.players.map(player => {
      const result = playerResults[player.id];
      if (!result) {
        return player;
      }

      const totalGain = Number.isFinite(result.total) ? result.total : 0;
      const nextScore = (player.score || 0) + totalGain;
      const nextStreak = Number.isFinite(result.newStreak) ? result.newStreak : (player.streak || 0);

      return {
        ...player,
        score: nextScore,
        streak: nextStreak
      };
    });

    updateGameState({ rounds: updatedRounds, players: updatedPlayers });

    const animatableResults = {};
    Object.entries(playerResults).forEach(([id, result]) => {
      const playerId = Number(id);
      animatableResults[id] = {
        ...result,
        previousScore: previousScores.get(playerId) || 0
      };
    });
    setScoreAnimations(animatableResults);
  }, [hasSubmitted, currentRoundData, gameState.rounds, gameState.currentRound, gameState.players, votes, updateGameState, setPlaybackRate]);

  useEffect(() => {
    if (gameState.roundLength) {
      const asNumber = Number(gameState.roundLength);
      setTimeRemaining(Number.isFinite(asNumber) ? asNumber : null);
    } else {
      setTimeRemaining(null);
    }

    setIsRevealing(false);
    setRevealedLieIndex(null);
    setScoreAnimations({});
    setHasSubmitted(false);
    setSelectedPlayer(null);
    setVotes({});
    countdownPlayedRef.current = new Set();
    finalPlayedRef.current = false;
    setShowTimeUp(false);

    setPlaybackRate(1);
    return () => setPlaybackRate(1);
  }, [gameState.roundLength, gameState.currentRound, setPlaybackRate]);

  useEffect(() => {
    if (currentRoundData?.votes) {
      setVotes(currentRoundData.votes);
    }
  }, [currentRoundData]);

  useEffect(() => {
    if (isRevealing || hasSubmitted || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        
        if (newTime <= 15 && prev > 15) {
          setPlaybackRate(1.15);
        } else if (newTime > 15 && prev <= 15) {
          setPlaybackRate(1);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, setPlaybackRate, isRevealing, hasSubmitted]);

  useEffect(() => {
    if (timeRemaining === 0 && !hasSubmitted) {
      beginReveal('timer');
    }
  }, [timeRemaining, hasSubmitted, beginReveal]);

  // Play countdown sounds for 3,2,1 and final at 0; also trigger time-up pop
  useEffect(() => {
    if (timeRemaining == null) return;

    if (timeRemaining > 0 && timeRemaining <= 3) {
      if (!countdownPlayedRef.current.has(timeRemaining)) {
        const file = timeRemaining === 3
          ? 'countdown1.mp3'
          : timeRemaining === 2
          ? 'countdown2.mp3'
          : 'countdown3.mp3';
        playSound(file);
        countdownPlayedRef.current.add(timeRemaining);
      }
    }

    if (timeRemaining === 0 && !finalPlayedRef.current) {
      finalPlayedRef.current = true;
      playSound('countdownFINAL.mp3');
      setShowTimeUp(true);
      // Hide pop after a slightly longer delay
      const t = setTimeout(() => setShowTimeUp(false), 2600);
      return () => clearTimeout(t);
    }
  }, [timeRemaining, playSound]);

  useEffect(() => {
    return () => {
      Object.values(scoreAnimationRefs.current).forEach(frameId => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!gameState.players) return;

    if (gameState.players.length === 0) {
      setDisplayScores({});
      return;
    }

    setDisplayScores(prev => {
      const next = { ...prev };
      gameState.players.forEach(player => {
        if (next[player.id] === undefined) {
          next[player.id] = player.score || 0;
        }
      });
      return next;
    });
  }, [gameState.players]);

  useEffect(() => {
    Object.entries(scoreAnimations).forEach(([id, result]) => {
      const playerId = Number(id);
      const player = gameState.players?.find(p => p.id === playerId);
      if (!player || !result) return;

      const startScore = Number.isFinite(result.previousScore)
        ? result.previousScore
        : (player.score || 0) - (result.total || 0);
      const endScore = startScore + (result.total || 0);
      animateScore(playerId, startScore, endScore);
    });
  }, [scoreAnimations, gameState.players, animateScore]);

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handlePlayerSelect = (playerId) => {
    if (isRevealing || hasSubmitted) return;

    playClick();
    if (selectedPlayer === playerId) {
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(playerId);
    }
  };

  const handleStatementSelect = (statementIndex) => {
    if (!selectedPlayer || isRevealing || hasSubmitted) return;

    playClick();
    setVotes(prev => ({
      ...prev,
      [selectedPlayer]: {
        statementIndex,
        timeRemaining: typeof timeRemaining === 'number' ? timeRemaining : 0
      }
    }));

    setSelectedPlayer(null);
  };

  const handleEndEarly = () => {
    playClick();
    if (window.confirm('Are you sure you want to end this round early?')) {
      beginReveal('manual');
    }
  };

  const handleSeeRoundLeaderboard = () => {
    playClick();
    navigate('/round-leaderboard');
  };

  if (!currentRoundData) {
    return (
      <div className="stage">
        <div className="error-message">
          <h1>No round data available</h1>
          <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
        </div>
      </div>
    );
  }

  const { statements } = currentRoundData;
  const roundNumber = gameState.currentRound + 1;
  const totalRounds = gameState.rounds?.length || 0;

  return (
    <div className="stage round-stage">
      <div className="round-header">
        <div className={`timer-box ${timeRemaining !== null && timeRemaining > 0 && timeRemaining <= 15 ? 'urgent' : ''} ${isRevealing ? 'hidden' : ''}`}>
          {formatTime(timeRemaining)}
        </div>
        
        <div className="header-center">
          <h1 className="round-title">{isRevealing ? 'The AI Is Revealed!' : 'Guess The AI Lie!'}</h1>
          <div className="round-label-under">Round {roundNumber} of {totalRounds}</div>
        </div>
        
        {!isRevealing ? (
          <button className="action-button" onClick={handleEndEarly}>
            <span className="button-label">End Round Early</span>
            <img src="/assets/img/button-icons/next.png" alt="Next" className="button-icon" />
          </button>
        ) : (
          <button className="action-button" onClick={handleSeeRoundLeaderboard}>
            <span className="button-label">See Round Leaderboard</span>
            <img src="/assets/img/button-icons/next.png" alt="Next" className="button-icon" />
          </button>
        )}
      </div>

      {showTimeUp && (
        <div className="timeup-pop" aria-live="polite">Time's up — revealing the AI!</div>
      )}

      <div className="statements-grid">
        {statements.map((statement, index) => {
          const voterIds = Object.entries(votes)
            .filter(([, voteValue]) => {
              const normalized = normalizeVote(voteValue);
              return normalized && normalized.statementIndex === index;
            })
            .map(([playerId]) => Number(playerId));

          const voters = gameState.players.filter(p => voterIds.includes(p.id));
          const isLie = index === revealedLieIndex;
          const statementClasses = [
            'statement-box',
            selectedPlayer && !isRevealing ? 'votable' : '',
            isRevealing ? 'revealing' : '',
            isRevealing && isLie ? 'lie-revealed' : '',
            isRevealing && !isLie ? 'truth-revealed' : ''
          ].filter(Boolean).join(' ');

          return (
            <div
              key={index}
              className={statementClasses}
              onClick={() => handleStatementSelect(index)}
            >
              <div className="statement-number">{index + 1}</div>
              <div className="statement-text">{statement.text}</div>
              
              {voters.length > 0 && (
                <div className="voter-icons">
                  {voters.map(voter => (
                    <img 
                      key={voter.id}
                      src={voter.icon} 
                      alt={voter.name}
                      className="voter-icon"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="players-section" onClick={() => setSelectedPlayer(null)}>
        <div className="players-grid">
          {gameState.players.map(player => {
            const normalizedVote = normalizeVote(votes[player.id]);
            const hasVoted = Boolean(normalizedVote);
            const isSelected = selectedPlayer === player.id;
            const displayScore = displayScores[player.id] ?? player.score ?? 0;
            const playerAnimation = scoreAnimations[player.id];
            const isChameleonPlayer = currentRoundData?.player?.id === player.id;
            
            // Determine if player was correct when revealing
            const playerResult = currentRoundData?.results?.playerResults?.[player.id];
            const isCorrect = isRevealing && playerResult?.correct;
            const isWrong = isRevealing && hasVoted && !playerResult?.correct && !playerResult?.isChameleon;

            return (
              <div
                key={player.id}
                className={`player-card ${isSelected ? 'selected' : ''} ${hasVoted ? 'voted' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={(e) => { e.stopPropagation(); handlePlayerSelect(player.id); }}
              >
                {isRevealing && isChameleonPlayer && (
                  <div className="chameleon-label">Chameleon</div>
                )}

                {playerAnimation && (
                  <div className={`score-float ${playerAnimation.total === 0 ? 'zero-score' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}>
                    +{playerAnimation.total}
                  </div>
                )}

                {hasVoted && !isRevealing && (
                  <div className="vote-checkmark">✓</div>
                )}

                <img src={player.icon} alt={player.name} className="player-icon" />
                <div className="player-name">{player.name}</div>
                <div className="player-score">{displayScore} pts</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}