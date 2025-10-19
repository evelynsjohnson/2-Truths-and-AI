/**
 * @fileoverview LoadingScreen component shown while AI generates lies for all players.
 * Handles API calls and retry logic using persisted game state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { generateLiesForAllPlayers } from '../../utils/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './LoadingScreen.css';

export default function LoadingScreen() {
  const navigate = useNavigate();
  const { gameState, updateGameState } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  // Function to generate lies via backend API - wrapped in useCallback
  const generateLies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProgress('Preparing player data...');

    try {
      setProgress(`Processing ${gameState.players.length} players...`);

      // Call API to generate lies for all players
      const data = await generateLiesForAllPlayers(gameState.players);
      
      setProgress('Finalizing game setup...');

      // Update game state with generated lies
      updateGameState({ 
        lies: data.lies,
        isLiesGenerated: true 
      });

      // Short delay for UX
      setTimeout(() => {
        navigate('/round');
      }, 500);

    } catch (err) {
      console.error('Failed to generate lies:', err);
      setError(err.message || 'Failed to generate lies. Please try again.');
      setIsLoading(false);
    }
  }, [gameState.players, updateGameState, navigate]);

  // Start generating lies on mount
  useEffect(() => {
    // Validate that we have player truths
    if (!gameState.players || gameState.players.length === 0) {
      navigate('/lobby');
      return;
    }

    const hasAllTruths = gameState.players.every(
      player => player.truth1 && player.truth2
    );

    if (!hasAllTruths) {
      navigate('/truth-inputs');
      return;
    }

    // Start generation
    generateLies();
  }, [gameState.players, navigate, generateLies]); // Run when these change

  // TODO: Render loading screen UI as per design
  return (
    <div className="stage loading-stage">
      <Card className="loading-card">
        {isLoading ? (
          <>
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <h1>AI is Crafting Lies...</h1>
            <p className="loading-message">
              Our AI is analyzing each player's truths and generating convincing lies.
              This may take a moment.
            </p>
            {progress && <p className="progress-text">{progress}</p>}
          </>
        ) : error ? (
          <>
            <div className="error-icon">⚠️</div>
            <h1>Oops! Something Went Wrong</h1>
            <p className="error-message">{error}</p>
            <div className="loading-controls">
              <Button 
                variant="outline" 
                onClick={() => navigate('/truth-inputs')}
              >
                Back to Truths
              </Button>
              <Button 
                variant="primary" 
                onClick={generateLies}
              >
                Try Again
              </Button>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}
