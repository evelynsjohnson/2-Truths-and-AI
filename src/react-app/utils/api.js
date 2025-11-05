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
 * @param gameState - Game state object with players, rounds, scores, etc.
 */
export async function exportGameStatsToPDF(gameState) {
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
  addText(`Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`, 20, 11);
  addText(`Total Rounds: ${gameState.rounds?.length || 0}`, 20, 11);
  addText(`AI Model: ${gameState.aiModel || 'gpt-4'}`, 20, 11);
  addText(`Total Players: ${gameState.players?.length || 0}`, 20, 11);
  yPosition += 5;
  
  // Helper function to calculate lie detection stats
  const getLieDetectionStats = (player) => {
    const totalRounds = gameState.rounds?.length || 0;
    const detectedLies = gameState.rounds?.filter(round => {
      const vote = round.votes?.[player.id];
      const normalized = vote && typeof vote === 'object' && 'statementIndex' in vote ? vote.statementIndex : null;
      const lieIndex = round.statements?.findIndex(s => s.type === 'lie');
      return normalized === lieIndex;
    }).length || 0;
    return { detectedLies, totalRounds };
  };
  
  // Leaderboard
  addText('FINAL LEADERBOARD', 20, 14, true);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 5;
  
  if (gameState.players && gameState.players.length > 0) {
    const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
    sortedPlayers.forEach((player, index) => {
      const stats = getLieDetectionStats(player);
      addText(`${index + 1}. ${player.name}: ${player.score || 0} points (${stats.detectedLies}/${stats.totalRounds} lies detected)`, 25, 11);
    });
  }
  yPosition += 5;
  
  // Round Details
  addText('ROUND DETAILS', 20, 14, true);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 5;
  
  if (gameState.rounds && gameState.rounds.length > 0) {
    gameState.rounds.forEach((round, roundIndex) => {
      addText(`Round ${roundIndex + 1}:`, 20, 12, true);
      
      if (round.statements) {
        // Group statements by type
        const truths = round.statements.filter(s => s.type === 'truth');
        const lie = round.statements.find(s => s.type === 'lie');
        
        // Display truths
        truths.forEach((statement) => {
          const playerName = statement.playerName || gameState.players.find(p => p.id === statement.playerId)?.name || 'Unknown';
          const text = `${playerName}: "${statement.text}"`;
          const maxWidth = 150;
          const lines = doc.splitTextToSize(text, maxWidth);
          lines.forEach(line => {
            addText(line, 25, 10);
          });
        });
        
        // Display AI lie
        if (lie) {
          const text = `AI: "${lie.text}" (LIE)`;
          const maxWidth = 150;
          const lines = doc.splitTextToSize(text, maxWidth);
          lines.forEach(line => {
            addText(line, 25, 10);
          });
        }
      }
      
      // Display votes
      if (round.votes) {
        const voteResults = Object.entries(round.votes).map(([playerId, vote]) => {
          const player = gameState.players.find(p => p.id === parseInt(playerId));
          const statementIndex = vote && typeof vote === 'object' ? vote.statementIndex : vote;
          const lieIndex = round.statements?.findIndex(s => s.type === 'lie');
          const correct = statementIndex === lieIndex ? '✓' : '✗';
          return `${player?.name || 'Unknown'}: ${correct}`;
        });
        addText(`Votes: ${voteResults.join(', ')}`, 25, 9);
      }
      
      yPosition += 3;
    });
  }
  
  // Save the PDF
  doc.save(`2truths-ai-game-data-${Date.now()}.pdf`);
}
