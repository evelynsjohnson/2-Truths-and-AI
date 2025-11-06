/**
 * @fileoverview Context provider for managing game state and data.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

const GAME_DATA_KEY = '2tai_game_data';     // Key for storing game data separately
const GAME_STATE_KEY = '2tai_game_state';   // Key for storing overall game state

export function GameProvider({ children }) {
  // Load initial state from sessionStorage (tab-specific)
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(GAME_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.warn('Could not load game state', e);
    }
    
    // Default state if nothing saved
    return {
      players: [],
      currentRound: 0,
      currentSet: 1,
      scores: {},
      gameData: [],
      aiModel: 'gpt-5-nano',
      numAIStatements: 4,
      consentGiven: false
    };
  });

  // Save state to sessionStorage whenever it changes (tab-specific)
  useEffect(() => {
    try {
      sessionStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Could not save game state', e);
    }
  }, [gameState]);

  // Initialize game with players by assigning IDs, names and scores
  const initializeGame = (numPlayersOrOptions, aiModelArg = 'gpt-5-nano') => {
    // Support two call signatures:
    // initializeGame(numPlayers, aiModel)
    // initializeGame({ numPlayers, numRounds, roundLength, aiModel })
    let numPlayers = 0;
    let aiModel = aiModelArg;
    let extra = {};

    if (typeof numPlayersOrOptions === 'object' && numPlayersOrOptions !== null) {
      numPlayers = Number(numPlayersOrOptions.numPlayers) || 0;
      aiModel = numPlayersOrOptions.aiModel || aiModelArg;
      // preserve optional settings like numRounds and roundLength
      extra = {
        numRounds: numPlayersOrOptions.numRounds,
        roundLength: numPlayersOrOptions.roundLength
      };
    } else {
      numPlayers = Number(numPlayersOrOptions) || 0;
    }

    const players = [];
    for (let i = 1; i <= numPlayers; i++) {
      players.push({
        id: i,
        name: `Player ${i}`,
        score: 0,
        streak: 0
      });
    }

    // Update state with initialized players and settings
    setGameState(prev => ({
      ...prev,
      players,
      aiModel,
      currentRound: 0,
      currentSet: 1,
      scores: {},
      // merge any extra settings provided from lobby
      ...(extra.numRounds ? { numRounds: extra.numRounds } : {}),
      ...(extra.roundLength ? { roundLength: extra.roundLength } : {})
    }));
  };

  // Add a new player
  const addPlayer = (playerName, playerId) => {
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, { id: playerId, name: playerName, score: 0, streak: 0  }]
    }));
  };

  // Update a player's name
  const updatePlayerName = (playerId, newName) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, name: newName } : p
      )
    }));
  };

  // Update a player's score
  const updateScore = (playerId, points) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === playerId ? { ...p, score: (p.score || 0) + points } : p
      )
    }));
  };

  // Advance to the next round
  const nextRound = () => {
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1
    }));
  };

  // Save game data (e.g., statements, truths, lies)
  const saveGameData = (data) => {
    try {
      sessionStorage.setItem(GAME_DATA_KEY, JSON.stringify(data));
      setGameState(prev => ({ ...prev, gameData: data }));
    } catch (e) {
      console.warn('Could not save game data', e);
    }
  };

  // Load game data
  const loadGameData = () => {
    try {
      const stored = sessionStorage.getItem(GAME_DATA_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setGameState(prev => ({ ...prev, gameData: data }));
        return data;
      }
    } catch (e) {
      console.warn('Could not load game data', e);
    }
    throw new Error('No game data found');
  };

  // Reset game state to initial values
  const resetGame = () => {
    const newState = {
      players: [],
      currentRound: 0,
      currentSet: 1,
      scores: {},
      gameData: [],
      aiModel: 'gpt-5-nano',
      numAIStatements: 4,
      consentGiven: gameState.consentGiven // Keep consent status
    };
    
    setGameState(newState);
    
    // Clear game-related sessionStorage (keep app settings like music/sound preferences in localStorage)
    try {
      clearTruthInputData();
      clearCurrentPlayerIndex();
      sessionStorage.setItem(GAME_STATE_KEY, JSON.stringify(newState)); // Save reset state immediately
      // Note: We keep 'lobbySettings' in localStorage so users don't have to reconfigure every time
      // Note: We keep 'appSettings' in localStorage for music/sound preferences
    } catch (error) {
      console.error('Error resetting game state:', error);
    }
  };

  // Record that user has given consent (It will not be asked again for this session)
  const giveConsent = () => {
    setGameState(prev => ({ ...prev, consentGiven: true }));
  };

  // Generic update function to update any part of game state
  const updateGameState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  // Initialize round state when a round starts
  const initializeRoundState = (roundIndex) => {
    setGameState(prev => {
      const rounds = [...(prev.rounds || [])];
      if (rounds[roundIndex]) {
        rounds[roundIndex] = {
          ...rounds[roundIndex],
          state: {
            startTime: Date.now(),
            isRevealing: false,
            revealedLieIndex: null,
            timeIsUp: false,
            completedAt: null
          }
        };
      }
      return { ...prev, rounds };
    });
  };

  // Update round state (e.g., votes, revealing, timeIsUp)
  const updateRoundState = (roundIndex, stateUpdates) => {
    setGameState(prev => {
      const rounds = [...(prev.rounds || [])];
      if (rounds[roundIndex]) {
        rounds[roundIndex] = {
          ...rounds[roundIndex],
          state: {
            ...rounds[roundIndex].state,
            ...stateUpdates
          }
        };
      }
      return { ...prev, rounds };
    });
  };

  // Update votes for current round
  const updateRoundVotes = (roundIndex, votes) => {
    setGameState(prev => {
      const rounds = [...(prev.rounds || [])];
      if (rounds[roundIndex]) {
        rounds[roundIndex] = {
          ...rounds[roundIndex],
          votes
        };
      }
      return { ...prev, rounds };
    });
  };

  // Save truth input data to sessionStorage
  const saveTruthInputData = (data) => {
    try {
      sessionStorage.setItem('truthInputsPlayerData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving truth input data:', error);
    }
  };

  // Load truth input data from sessionStorage
  const loadTruthInputData = () => {
    try {
      const saved = sessionStorage.getItem('truthInputsPlayerData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading truth input data:', error);
    }
    return {};
  };

  // Clear truth input data from sessionStorage
  const clearTruthInputData = () => {
    try {
      sessionStorage.removeItem('truthInputsPlayerData');
    } catch (error) {
      console.error('Error clearing truth input data:', error);
    }
  };

  // Save current player index for truth inputs
  const saveCurrentPlayerIndex = (index) => {
    try {
      sessionStorage.setItem('truthInputsCurrentPlayer', String(index));
    } catch (error) {
      console.error('Error saving current player index:', error);
    }
  };

  // Load current player index for truth inputs
  const loadCurrentPlayerIndex = () => {
    try {
      const saved = sessionStorage.getItem('truthInputsCurrentPlayer');
      if (saved !== null) {
        return parseInt(saved, 10);
      }
    } catch (error) {
      console.error('Error loading current player index:', error);
    }
    return 0;
  };

  // Clear current player index
  const clearCurrentPlayerIndex = () => {
    try {
      sessionStorage.removeItem('truthInputsCurrentPlayer');
    } catch (error) {
      console.error('Error clearing current player index:', error);
    }
  };

  return (
    <GameContext.Provider value={{
      gameState,
      initializeGame,
      addPlayer,
      updatePlayerName,
      updateScore,
      nextRound,
      saveGameData,
      loadGameData,
      resetGame,
      giveConsent,
      updateGameState,
      initializeRoundState,
      updateRoundState,
      updateRoundVotes,
      saveTruthInputData,
      loadTruthInputData,
      clearTruthInputData,
      saveCurrentPlayerIndex,
      loadCurrentPlayerIndex,
      clearCurrentPlayerIndex
    }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the GameContext
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
