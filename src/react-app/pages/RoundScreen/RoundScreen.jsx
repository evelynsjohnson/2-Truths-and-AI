/**
 * @fileoverview RoundScreen component where players guess the AI-generated lie.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './RoundScreen.css';

// Scoring constants
const FLAT_CORRECT_BONUS = 50;
const FIRST_GUESS_BONUS = 25;
const TRICKERY_BONUS = 50;
const STREAK_STEP = 10;
const SPEED_DIVISOR = 2;
const SCORE_ANIMATION_DURATION = 1200;
// Duration to show the time-up overlay before revealing results (ms)
const NATURAL_OVERLAY_DURATION = 2000;
const EARLY_OVERLAY_DURATION = 3000;

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
  const [countdownValue, setCountdownValue] = useState(null);
  const overlayTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const [isVotingHelpVisible, setIsVotingHelpVisible] = useState(false);
  const lastTickTimeRef = useRef(null);
  const hasInitializedRef = useRef(false);

  //Get current round data
  const currentRoundData = gameState.rounds?.[gameState.currentRound];

  // Warn user before leaving page during active round (page refresh/close)
  useEffect(() => {
    const shouldWarn = !isRevealing && timeRemaining !== null && timeRemaining > 0;
    
    if (shouldWarn) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isRevealing, timeRemaining]);



  // Animate score changes for a player
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

    // Animation step function
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

  // Begin the reveal phase, calculating results and updating state
  const beginReveal = useCallback((trigger = 'manual') => {
    if (hasSubmitted || !currentRoundData || !Array.isArray(gameState.rounds)) {
      return;
    }

    // Mark as submitted to prevent re-entry
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
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Validate we have the necessary game state
    if (!gameState.rounds || gameState.rounds.length === 0) {
      console.error('No rounds available, redirecting to lobby');
      navigate('/lobby', { replace: true });
      return;
    }

    if (!currentRoundData) {
      console.error('No current round data, redirecting to lobby');
      navigate('/lobby', { replace: true });
      return;
    }

    // Check if this round already has results (completed)
    if (currentRoundData.results) {
      const { lieIndex, playerResults } = currentRoundData.results;
      
      // Restore the completed state
      setIsRevealing(true);
      setRevealedLieIndex(lieIndex);
      setHasSubmitted(true);
      setTimeRemaining(0);
      setVotes(currentRoundData.votes || {});
      
      // Prepare score animations
      const previousScores = new Map(
        (gameState.players || []).map(player => [
          player.id, 
          (player.score || 0) - (playerResults[player.id]?.total || 0)
        ])
      );
      
      const animatableResults = {};
      Object.entries(playerResults).forEach(([id, result]) => {
        const playerId = Number(id);
        animatableResults[id] = {
          ...result,
          previousScore: previousScores.get(playerId) || 0
        };
      });
      setScoreAnimations(animatableResults);
      
      return;
    }

    // Check if round is in progress (has start time but no results yet)
    if (currentRoundData.startTime) {
      console.log('Restoring round in progress');
      
      // Calculate elapsed time and remaining time
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - currentRoundData.startTime) / 1000);
      const roundLength = Number(gameState.roundLength) || 0;
      const calculatedRemaining = Math.max(0, roundLength - elapsedSeconds);
      
      setTimeRemaining(calculatedRemaining);
      lastTickTimeRef.current = now;
      
      // Load any existing votes
      if (currentRoundData.votes) {
        setVotes(currentRoundData.votes);
      }
    } else {
      // Initialize fresh round
      const now = Date.now();
      
      if (gameState.roundLength) {
        const asNumber = Number(gameState.roundLength);
        setTimeRemaining(Number.isFinite(asNumber) ? asNumber : null);
        lastTickTimeRef.current = now;
      } else {
        setTimeRemaining(null);
      }
      
      // Store start time for this round
      const updatedRounds = [...gameState.rounds];
      updatedRounds[gameState.currentRound] = {
        ...currentRoundData,
        startTime: now
      };
      updateGameState({ rounds: updatedRounds });
    }
    
    setIsRevealing(false);
    setRevealedLieIndex(null);
    setScoreAnimations({});
    setHasSubmitted(false);
    setSelectedPlayer(null);
    countdownPlayedRef.current = new Set();
    finalPlayedRef.current = false;
    setShowTimeUp(false);
    setCountdownValue(null);
    setPlaybackRate(1);
    
    // Clear any pending timeouts
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    return () => {
      setPlaybackRate(1);
      hasInitializedRef.current = false;
    };
  }, [gameState.roundLength, gameState.currentRound, gameState.rounds, gameState.players, currentRoundData, setPlaybackRate, navigate]);

  // Fail-safe: If timer is 0 and we're not revealing, trigger reveal
  useEffect(() => {
    if (timeRemaining === 0 && !isRevealing && !showTimeUp && currentRoundData && !currentRoundData.results) {
      const timer = setTimeout(() => {
        if (!isRevealing) {
          beginReveal('timer');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isRevealing, showTimeUp, currentRoundData, beginReveal]);

  useEffect(() => {                 //Timer countdown effect
    if (isRevealing || hasSubmitted || timeRemaining === null || timeRemaining <= 0) return;

    // Use more accurate timing based on actual elapsed time
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = lastTickTimeRef.current ? (now - lastTickTimeRef.current) / 1000 : 1;
      lastTickTimeRef.current = now;

      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - Math.round(elapsed));
        
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
      console.log('Timer reached 0, finalPlayedRef:', finalPlayedRef.current);
      finalPlayedRef.current = true;
      
      // If results already exist (from reload), skip the overlay and go straight to reveal
      if (currentRoundData?.results) {
        beginReveal('timer');
        return;
      }
      
      setShowTimeUp(true);
      
      // Natural timer expiry: play countdownFINAL and go straight to final message
      playSound('countdownFINAL.mp3');
      setCountdownValue(0);

      // Use shared overlay timeout ref so manual and timer paths behave
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = null;
      }
      overlayTimeoutRef.current = setTimeout(() => {
        setShowTimeUp(false);
        setCountdownValue(null);
        // Trigger reveal after overlay is gone - use setTimeout to ensure state updates
        setTimeout(() => {
          beginReveal('timer');
        }, 50);
        overlayTimeoutRef.current = null;
      }, NATURAL_OVERLAY_DURATION);
      return () => {
        if (overlayTimeoutRef.current) {
          clearTimeout(overlayTimeoutRef.current);
          overlayTimeoutRef.current = null;
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      };
    }
  }, [timeRemaining, playSound, beginReveal, currentRoundData]);

  // Cleanup any pending overlay timeout when component unmounts
  useEffect(() => () => {
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

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
    const newVotes = {
      ...votes,
      [selectedPlayer]: {
        statementIndex,
        timeRemaining: typeof timeRemaining === 'number' ? timeRemaining : 0
      }
    };
    
    setVotes(newVotes);
    
    // Persist votes to GameContext
    const updatedRounds = [...gameState.rounds];
    updatedRounds[gameState.currentRound] = {
      ...currentRoundData,
      votes: newVotes
    };
    updateGameState({ rounds: updatedRounds });

    setSelectedPlayer(null);
  };

  const handleEndEarly = () => {
    if (!window.confirm('Are you sure you want to end this round early?')) return;

    // If overlay is already playing, do nothing — beginReveal will run when it completes
    if (overlayTimeoutRef.current || showTimeUp) return;

    // Freeze the timer by marking as submitted
    setHasSubmitted(true);
    
    finalPlayedRef.current = true;
    setShowTimeUp(true);

    // Start countdown at 3 (same as timer expiry)
    setCountdownValue(3);
    playSound('countdown1.mp3');
    
    let currentCount = 3;
    countdownIntervalRef.current = setInterval(() => {
      currentCount--;
      
      if (currentCount === 2) {
        playSound('countdown2.mp3');
        setCountdownValue(2);
      } else if (currentCount === 1) {
        playSound('countdown3.mp3');
        setCountdownValue(1);
      } else if (currentCount === 0) {
        playSound('countdownFINAL.mp3');
        setCountdownValue(0);
        // Clear the interval when we reach 0
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 1000);

    overlayTimeoutRef.current = setTimeout(() => {
      setShowTimeUp(false);
      setCountdownValue(null);
      overlayTimeoutRef.current = null;
      beginReveal('manual');
    }, EARLY_OVERLAY_DURATION + 1500);
  };

  const handleSeeRoundLeaderboard = () => {
    const roundNumber = gameState.currentRound + 1;
    const totalRounds = gameState.rounds?.length || 0;
    
    // If this is the last round, go to game stats instead of round leaderboard
    if (roundNumber >= totalRounds) {
      navigate('/game-stats');
    } else {
      navigate('/round-leaderboard');
    }
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

  //TODO: Render the round screen UI as per design
  
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
          <Button 
            className={`action-button end-early-btn ${timeRemaining <= 5 ? 'disabled' : ''}`} 
            onClick={timeRemaining > 5 ? handleEndEarly : undefined}
            disabled={timeRemaining <= 5}
          >
            <span className="button-label">End Round Early</span>
            <img src="/assets/img/button-icons/next.png" alt="Next" className="button-icon" />
          </Button>
        ) : (
          <Button 
            className="action-button leaderboard-btn"
            onClick={handleSeeRoundLeaderboard}
          >
            <span className="button-label">Current Leaderboard</span>
            <img src="/assets/img/button-icons/next.png" alt="Next" className="button-icon" />
          </Button>
        )}
      </div>

      {showTimeUp && (
        <div className="timeup-overlay" aria-hidden={!showTimeUp}>
          <div className="timeup-pop-large" aria-live="polite">
            <div className="overlay-title">Round {roundNumber} Is Over!</div>
            <div className="overlay-subtitle">
              {countdownValue !== null && countdownValue > 0 ? 'Revealing the AI Lie in...' : 'Revealing the AI Lie...'}
            </div>
            {countdownValue !== null && countdownValue > 0 && (
              <div className="overlay-countdown">{countdownValue}</div>
            )}
          </div>
        </div>
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
          const showingReveal = isRevealing && !showTimeUp;
          
          const statementClasses = [
            'statement-box',
            selectedPlayer && !showingReveal ? 'votable' : '',
            showingReveal ? 'revealing' : '',
            showingReveal && isLie ? 'lie-revealed' : '',
            showingReveal && !isLie ? 'truth-revealed' : ''
          ].filter(Boolean).join(' ');

          return (
            <div
              key={index}
              className={statementClasses}
              onClick={() => handleStatementSelect(index)}
            >
              <div className="statement-number">
                {showingReveal && isLie ? 'AI' : index + 1}
              </div>
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

      {/* Voting Help Tooltip */}
      <div className="voting-help-container">
        <div 
          className="voting-help-trigger"
          onMouseEnter={() => setIsVotingHelpVisible(true)}
          onMouseLeave={() => setIsVotingHelpVisible(false)}
        >
          <span className="help-icon">?</span>
          <span className="help-text">Unsure how to vote? Hover Here!</span>
        </div>
        {isVotingHelpVisible && (
          <div className="voting-help-popup">
            <video 
              src="/src/react-app/assets/mp4/voting-demo.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
              className="voting-demo-video"
            />
          </div>
        )}
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
            
            // Determine if player was correct when revealing (but don't show while overlay is visible)
            const playerResult = currentRoundData?.results?.playerResults?.[player.id];
            const showingRevealForPlayer = isRevealing && !showTimeUp;
            const isCorrect = showingRevealForPlayer && playerResult?.correct;
            const isWrong = showingRevealForPlayer && hasVoted && !playerResult?.correct && !playerResult?.isChameleon;

            return (
                    <div
                      key={player.id}
                      className={`player-card ${isSelected ? 'selected' : ''} ${hasVoted ? 'voted' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${showingRevealForPlayer && isChameleonPlayer ? 'chameleon' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handlePlayerSelect(player.id); }}
                    >
                {isRevealing && !showTimeUp && currentRoundData?.results?.playerResults && isChameleonPlayer && (
                  <div className="chameleon-label">Chameleon</div>
                )}

                {playerAnimation && (
                        <div className={`score-float ${playerAnimation.total === 0 ? 'zero-score' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${playerAnimation.isChameleon ? 'chameleon-float' : ''}`}>
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
