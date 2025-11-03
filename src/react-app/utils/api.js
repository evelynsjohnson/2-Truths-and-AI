// API utilities for communicating with backend/LLM services

/**
 * DATA STRUCTURE:
 * Players come in with truthSets array format from TruthInputs:
 * {
 *   id: number,
 *   name: string,
 *   icon: string,
 *   truthSets: [
 *     { setNumber: 1, truth1: "...", truth2: "..." },
 *     { setNumber: 2, truth1: "...", truth2: "..." },
 *     ...
 *   ]
 * }
 * 
 * API sends flattened truths array per player and receives array of lies per player:
 * Request: { players: [{ id, name, truths: ["truth1", "truth2", "truth3", "truth4", ...] }], aiModel }
 * Response: { lies: { "playerId": ["lie1", "lie2", ...] } }
 * 
 * IMPORTANT: Each player gets ONE LIE PER TRUTH SET (2 truths = 1 set = 1 lie)
 * Example: Player with 2 sets (4 truths) → receives 2 lies
 *          truths: ["set1truth1", "set1truth2", "set2truth1", "set2truth2"]
 *          lies:   ["set1lie", "set2lie"]
 */

/**
 * Get random lies from the sample lies list as fallback
 */
async function getRandomLiesFromSamples(count) {
  const response = await fetch('/assets/json/sample-lies.json');
  const data = await response.json();
  const lies = data[0].lies;
  
  // Get random lies without duplicates
  const selectedLies = [];
  const availableLies = [...lies];
  
  for (let i = 0; i < count && availableLies.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableLies.length);
    selectedLies.push(availableLies[randomIndex]);
    availableLies.splice(randomIndex, 1);
  }
  
  return selectedLies;
}

/**
 * Generate AI lies for all players based on their truths
 * @param players - Array of player objects with {id, name, truthSets: [{truth1, truth2}, ...]}
 * @param aiModel - AI model to use (default: 'gpt-5-nano')
 * @returns Object mapping player IDs to their generated lies array
 */
export async function generateLiesForAllPlayers(players, aiModel = 'gpt-5-nano') {
  try {
    // Transform players data to send all truth sets to API
    const playersData = players.map(p => {
      // Extract all truths from truthSets array
      const allTruths = [];
      if (p.truthSets && Array.isArray(p.truthSets)) {
        p.truthSets.forEach(set => {
          if (set.truth1) allTruths.push(set.truth1);
          if (set.truth2) allTruths.push(set.truth2);
        });
      }
      
      return {
        id: p.id,
        name: p.name,
        truths: allTruths
      };
    });

    const response = await fetch('/api/generate-lies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        players: playersData,
        aiModel 
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    // Expected format: { lies: { "player1": ["lie1", "lie2", ...], "player2": [...], ... } }
    // Each player gets an array of lies (one per truth set)
    return data.lies;
  } catch (error) {
    console.error('Error generating AI lies, falling back to random samples:', error);
    
    // Fallback to random lies from sample-lies.json
    try {
      // Calculate how many lies we need per player (based on their truth sets)
      const liesMap = {};
      
      for (const player of players) {
        const numLiesNeeded = player.truthSets?.length || 1;
        const playerLies = await getRandomLiesFromSamples(numLiesNeeded);
        liesMap[player.id] = playerLies;
      }
      
      return liesMap;
    } catch (fallbackError) {
      // If even the fallback fails, show error page
      console.error('Critical error: Unable to load fallback lies:', fallbackError);
      window.location.href = '/error';
      throw new Error('System error: Unable to generate lies');
    }
  }
}

/**
 * Export game statistics to PDF
 * @param gameStats - Game statistics object with players, rounds, scores, etc.
 */
export async function exportGameStatsToPDF(gameStats) {
  // Dynamically import jsPDF
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  // Helper function to add text and handle page breaks
  const addText = (text, x = 20, fontSize = 12, isBold = false) => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(fontSize);
    doc.setFont(undefined, isBold ? 'bold' : 'normal');
    doc.text(text, x, yPosition);
    yPosition += lineHeight;
  };
  
  // Title
  addText('2 TRUTHS AND AI - GAME STATISTICS', 20, 18, true);
  yPosition += 5;
  
  // Game Info
  addText(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 11);
  addText(`Total Rounds: ${gameStats.totalRounds || 0}`, 20, 11);
  addText(`AI Model: ${gameStats.aiModel || 'gpt-4'}`, 20, 11);
  yPosition += 5;
  
  // Leaderboard
  addText('FINAL LEADERBOARD', 20, 14, true);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 5;
  
  if (gameStats.players && gameStats.players.length > 0) {
    const sortedPlayers = [...gameStats.players].sort((a, b) => (b.score || 0) - (a.score || 0));
    sortedPlayers.forEach((player, index) => {
      addText(`${index + 1}. ${player.name}: ${player.score || 0} points`, 25, 11);
    });
  }
  yPosition += 5;
  
  // Round Details
  addText('ROUND DETAILS', 20, 14, true);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 5;
  
  if (gameStats.rounds && gameStats.rounds.length > 0) {
    gameStats.rounds.forEach((round, index) => {
      addText(`Round ${index + 1}:`, 20, 12, true);
      
      if (round.statements) {
        round.statements.forEach(statement => {
          const text = `${statement.player}: "${statement.text}"`;
          const tag = statement.isLie ? '(LIE)' : '(TRUTH)';
          
          // Split long text to fit page width
          const maxWidth = 150;
          const lines = doc.splitTextToSize(`${text} ${tag}`, maxWidth);
          lines.forEach(line => {
            addText(line, 25, 10);
          });
        });
      }
      
      if (round.scores) {
        addText(`Points awarded: ${JSON.stringify(round.scores)}`, 25, 10);
      }
      yPosition += 3;
    });
  }
  
  // Save the PDF
  doc.save(`2truths-ai-game-stats-${Date.now()}.pdf`);
}
