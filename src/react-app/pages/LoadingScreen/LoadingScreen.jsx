/**
 * @fileoverview LoadingScreen component shown while AI generates lies for all players.
 * Handles API calls and retry logic using persisted game state.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const hasRunRef = useRef(false);

  // Function to generate lies via backend API
  const generateLies = async () => {
    setIsLoading(true);
    setError(null);
    setProgress('Preparing player data...');

    try {
      setProgress(`Processing ${gameState.players.length} players...`);

      //Make sure that we mark that lies are being generated to prevent duplicates
      updateGameState({ isGeneratingLies: true });


      // Call API to generate lies for all players
      const data = await generateLiesForAllPlayers(gameState.players);
      
      setProgress('Finalizing game setup...');

      // Update game state with generated lies
      updateGameState({ 
        lies: data,
        isLiesGenerated: true,
        isGeneratingLies: false
      });

      console.log('Updated game state with generated lies.');
      console.log('Generated lies:', data);

      // Short delay for UX
      setTimeout(() => {
        navigate('/round');
      }, 500);

    } catch (err) {
      console.error('Failed to generate lies:', err);
      setError(err.message || 'Failed to generate lies. Please try again.');
      setIsLoading(false);
      updateGameState({ isGeneratingLies: false });
    }
  };

  // Start generating lies on mount
  useEffect(() => {
    // Validate that we have players and truths
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

    // Prevent duplicate calls to the backend
    if (gameState.isGeneratingLies || hasRunRef.current) {
      return;
    }

    // Mark as run to prevent duplicates
    hasRunRef.current = true;

    // Start generation
    generateLies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
