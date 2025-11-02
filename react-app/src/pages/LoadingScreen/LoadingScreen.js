/**
 * @fileoverview LoadingScreen component shown while AI generates lies for all players.
 * Handles API calls and retry logic using persisted game state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './LoadingScreen.css';

export default function LoadingScreen() {
  const navigate = useNavigate();
  const { gameState, updateGameState } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  // Function to clean text (capitalize, spell check, punctuate)
  const cleanText = (text) => {
    if (!text) return '';
    
    // Basic cleanup: trim and capitalize first letter
    let cleaned = text.trim();
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    // Ensure it ends with punctuation
    if (cleaned && !/[.!?]$/.test(cleaned)) {
      cleaned += '.';
    }
    
    return cleaned;
  };

  // Function to call Azure OpenAI API
  const callAzureAPI = async (truth1, truth2, model) => {
    const apiKey = "EL31NwAeLvELKRwTLPff4sRfkLxMcdyBJJ4Zo3BnTX49e0XDLfphJQQJ99BIACHYHv6XJ3w3AAABACOGoeVN";
    const endpoint = "https://truth-or-ai.openai.azure.com/";
    const apiVersion = "2024-12-01-preview";
    
    const url = `${endpoint}openai/deployments/${model}/chat/completions?api-version=${apiVersion}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: (
              "You are the engine of a game called \"2 Truths or AI\".\n" +
              "Rules:\n" +
              "- The user provides two true personal statements.\n" +
              "- You generate exactly one believable false statement.\n" +
              "- Output format: return ONLY the generated statement, with no explanations, introductions, or extra text.\n" +
              "- The statement must not be offensive, contain offensive language, or derogatory terms.\n" +
              "- If the user's facts are vague, make the lie vague too, but avoid being too obvious.\n" +
              "- If the user's facts are specific, generate a similarly specific fake statement.\n" +
              "- Match the user's tone and style of writing.\n" +
              "- Do not repeat any statement the user has provided, your response should be on different topics.\n" +
              "- Do not say things strictly tied to the user's statements.\n"
            )
          },
          {
            role: "user",
            content: `Statement1: ${truth1}\nStatement2: ${truth2}\n`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  // Function to save data to JSON files (backend writes into public/assets/json)
  const saveToJsonFiles = async (playerTruths, aiLies) => {
    try {
      const resp = await fetch('/api/save-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerTruths, aiLies })
      });
      
      if (!resp.ok) {
        // Server not running - save to sessionStorage instead and log warning
        console.warn('Backend server not running. Files not saved to disk, but data is in sessionStorage.');
        sessionStorage.setItem('player-truths', JSON.stringify(playerTruths, null, 2));
        sessionStorage.setItem('ai-lies', JSON.stringify(aiLies, null, 2));
        return; // Don't throw error, just continue
      }
    } catch (err) {
      // Network error or server not running - continue anyway
      console.warn('Could not save JSON files to disk:', err.message);
      sessionStorage.setItem('player-truths', JSON.stringify(playerTruths, null, 2));
      sessionStorage.setItem('ai-lies', JSON.stringify(aiLies, null, 2));
    }
  };

  // Function to generate lies via API
  const generateLies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProgress(`Calling ${gameState.aiModel || 'gpt-5-nano'}...`);

    try {
      // First, clean all player truths
      setProgress('Cleaning and preparing truths...');
      
      const cleanedPlayers = gameState.players.map(player => ({
        ...player,
        truthSets: player.truthSets?.map(set => ({
          ...set,
          truth1: cleanText(set.truth1),
          truth2: cleanText(set.truth2)
        })) || []
      }));

      // Prepare player truths JSON structure
      const playerTruths = cleanedPlayers.map(player => ({
        playerId: player.id,
        playerNumber: player.id,
        playerName: player.name,
        playerIcon: player.icon,
        truthSets: player.truthSets.map((set, index) => ({
          setNumber: index + 1,
          truth1: set.truth1,
          truth2: set.truth2
        }))
      }));

      // Now generate AI lies for each truth set
      const roundsData = [];
      const aiLiesData = [];
      let roundNumber = 1;

      for (const player of cleanedPlayers) {
        setProgress(`Generating lies for ${player.name}...`);
        
        for (let setIndex = 0; setIndex < (player.truthSets || []).length; setIndex++) {
          const truthSet = player.truthSets[setIndex];
          
          try {
            const aiLie = await callAzureAPI(
              truthSet.truth1, 
              truthSet.truth2, 
              gameState.aiModel || 'gpt-5-nano'
            );
            
            const cleanedLie = cleanText(aiLie);
            
            // Store AI lie data
            aiLiesData.push({
              playerId: player.id,
              playerNumber: player.id,
              playerName: player.name,
              truthSetNumber: setIndex + 1,
              truth1: truthSet.truth1,
              truth2: truthSet.truth2,
              aiGeneratedLie: cleanedLie,
              model: gameState.aiModel || 'gpt-5-nano'
            });
            
            // Create round data with statements in random order
            const statements = [
              { text: truthSet.truth1, type: 'truth', playerId: player.id },
              { text: truthSet.truth2, type: 'truth', playerId: player.id },
              { text: cleanedLie, type: 'lie', playerId: player.id }
            ];
            
            // Shuffle statements
            for (let i = statements.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [statements[i], statements[j]] = [statements[j], statements[i]];
            }
            
            roundsData.push({
              roundNumber: roundNumber++,
              player: player,
              statements: statements,
              votes: {}
            });
          } catch (err) {
            console.error(`Failed to generate lie for ${player.name}:`, err);
            throw new Error(`Failed to generate lie for ${player.name}: ${err.message}`);
          }
        }
      }

      setProgress('Saving data files...');
      
      // Save JSON files
      saveToJsonFiles(playerTruths, aiLiesData);

      setProgress('Finalizing game setup...');

      // Update game state with cleaned players and rounds data
      updateGameState({ 
        players: cleanedPlayers,
        rounds: roundsData,
        currentRound: 0,
        isLiesGenerated: true,
        playerTruths: playerTruths,
        aiLies: aiLiesData
      });

      // Navigate to first round
      setTimeout(() => {
        navigate('/round');
      }, 500);

    } catch (err) {
      console.error('Failed to generate lies:', err);
      setError(err.message || 'Failed to generate lies. Please try again.');
      setIsLoading(false);
    }
  }, [gameState.players, gameState.aiModel, updateGameState, navigate]);

  // Start generating lies on mount
  useEffect(() => {
    // Validate that we have player truths
    if (!gameState.players || gameState.players.length === 0) {
      navigate('/lobby');
      return;
    }

    const hasAllTruths = gameState.players.every(
      player => player.truthSets && player.truthSets.length > 0
    );

    if (!hasAllTruths) {
      navigate('/truth-inputs');
      return;
    }

    // Start generation
    generateLies();
  }, []); // Only run once on mount

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
              {progress || `Calling ${gameState.aiModel || 'gpt-5-nano'}...`}
            </p>
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
