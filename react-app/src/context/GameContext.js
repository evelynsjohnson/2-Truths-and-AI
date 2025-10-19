/**
 * @fileoverview Context provider for managing game state and data.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

const GAME_DATA_KEY = '2tai_game_data';     // Key for storing game data separately
const GAME_STATE_KEY = '2tai_game_state';   // Key for storing overall game state

export function GameProvider({ children }) {
  // Load initial state from localStorage
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(GAME_STATE_KEY);
      if (saved) {
        return JSON.parse(saved);
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Could not save game state', e);
    }
  }, [gameState]);

  // Initialize game with players by assigning IDs, names and scores
  const initializeGame = (numPlayers, aiModel = 'gpt-5-nano') => {
    const players = [];
    for (let i = 1; i <= numPlayers; i++) {
      players.push({
        id: i,
        name: `Player ${i}`,
        score: 0
      });
    }

    // Update state with initialized players and settings
    setGameState(prev => ({
      ...prev,
      players,
      aiModel,
      currentRound: 0,
      currentSet: 1,
      scores: {}
    }));
  };

  // Add a new player
  const addPlayer = (playerName, playerId) => {
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, { id: playerId, name: playerName, score: 0 }]
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
      localStorage.setItem(GAME_DATA_KEY, JSON.stringify(data));
      setGameState(prev => ({ ...prev, gameData: data }));
    } catch (e) {
      console.warn('Could not save game data', e);
    }
  };

  // Load game data
  const loadGameData = () => {
    try {
      const stored = localStorage.getItem(GAME_DATA_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setGameState(prev => ({ ...prev, gameData: data }));
        return data;
      }
    } catch (e) {
      console.warn('Could not load game data', e);
    }
    return null;
  };

  // Reset game state to initial values
  const resetGame = () => {
    setGameState({
      players: [],
      currentRound: 0,
      currentSet: 1,
      scores: {},
      gameData: [],
      aiModel: 'gpt-5-nano',
      numAIStatements: 4,
      consentGiven: gameState.consentGiven // Keep consent status
    });
  };

  // Record that user has given consent (It will not be asked again for this session)
  const giveConsent = () => {
    setGameState(prev => ({ ...prev, consentGiven: true }));
  };

  // Generic update function to update any part of game state
  const updateGameState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
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
      updateGameState
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
