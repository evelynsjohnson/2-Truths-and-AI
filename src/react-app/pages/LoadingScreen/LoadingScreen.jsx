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
      const liesData = await generateLiesForAllPlayers(gameState.players);
      
      setProgress('Building game rounds...');

      console.log('Generated lies:', liesData);

      // Build rounds array from truthSets and lies
      const rounds = [];
      const totalRounds = gameState.totalRounds || gameState.numRounds || 0;
      
      for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
        // Determine which player's turn it is for this round
        const playerIndex = roundIndex % gameState.players.length;
        const player = gameState.players[playerIndex];
        
        // Determine which truth set this is for the player (0-indexed)
        const setIndexForPlayer = Math.floor(roundIndex / gameState.players.length);
        
        // Get the truth set and lie for this round
        const truthSet = player.truthSets?.[setIndexForPlayer];
        const lie = liesData[player.id]?.[setIndexForPlayer];
        
        if (!truthSet || !lie) {
          console.warn(`Missing data for round ${roundIndex + 1}, player ${player.name}, set ${setIndexForPlayer + 1}`);
          continue;
        }
        
        // Build statements array: 2 truths + 1 lie, shuffled
        const statements = [
          { text: truthSet.truth1, type: 'truth', playerId: player.id },
          { text: truthSet.truth2, type: 'truth', playerId: player.id },
          { text: lie, type: 'lie', playerId: player.id }
        ];
        
        // Shuffle statements
        for (let i = statements.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [statements[i], statements[j]] = [statements[j], statements[i]];
        }
        
        rounds.push({
          player: player,
          statements: statements,
          votes: {},
          results: null
        });
      }

      console.log('Built rounds:', rounds);

      // Update game state with rounds
      updateGameState({ 
        rounds: rounds,
        currentRound: 0,
        isLiesGenerated: true,
        isGeneratingLies: false
      });

      console.log('Game setup complete, navigating to round screen...');

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

    // Check that all players have at least one complete truth set
    const hasAllTruths = gameState.players.every(
      player => player.truthSets && player.truthSets.length > 0
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
