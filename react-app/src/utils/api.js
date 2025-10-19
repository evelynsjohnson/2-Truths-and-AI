// API utilities for communicating with backend/LLM services
//TODO: Replace mock implementations with actual API calls

/**
 * Generate AI lie based on player truths
 */
export async function generateAILie(truth1, truth2, playerName, aiModel = 'gpt-5-nano') {
  // This would make an actual API call to your LLM backend
  // For now, returning a mock implementation
  
  try {
    // Example structure for API call:
    // const response = await fetch('/api/generate-lie', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ truth1, truth2, playerName, aiModel })
    // });
    // return await response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          lie: "I once won a local scavenger hunt competition.",
          confidence: 0.85
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Error generating AI lie:', error);
    throw error;
  }
}

/**
 * Submit game data for research purposes
 */
export async function submitGameData(gameData) {
  try {
    // Example API call:
    // const response = await fetch('/api/submit-game-data', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(gameData)
    // });
    // return await response.json();
    
    console.log('Game data submitted:', gameData);
    return { success: true };
  } catch (error) {
    console.error('Error submitting game data:', error);
    throw error;
  }
}

/**
 * Generate lies for all players based on their truths
 * @param {Array} players - Array of player objects with truths
 * @returns {Promise<Object>} - Object mapping player IDs to their generated lies
 */
export async function generateLiesForAllPlayers(players) {
  try {
    // TODO: Replace with actual serverless function endpoint
    // const response = await fetch('/api/generate-lies', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ players })
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`);
    // }
    // 
    // return await response.json();

    // Mock implementation - simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const lies = {};
        players.forEach(player => {
          lies[player.id] = [
            `${player.name} once climbed Mount Everest without oxygen.`,
            `${player.name} can speak 7 languages fluently.`,
            `${player.name} won a Nobel Prize in Physics.`,
            `${player.name} has a pet tiger named Fluffy.`
          ];
        });
        resolve({ lies });
      }, 2000); // 2 second delay to simulate API call
    });
  } catch (error) {
    console.error('Error generating lies for all players:', error);
    throw error;
  }
}

/**
 * Export game data to JSON
 */
export function exportGameDataToJSON(gameData) {
  const dataStr = JSON.stringify(gameData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `2truths-ai-game-${Date.now()}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}
