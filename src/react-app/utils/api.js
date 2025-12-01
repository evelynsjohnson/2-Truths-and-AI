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
  const pageWidth = doc.internal.pageSize.getWidth ? doc.internal.pageSize.getWidth() : doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.getHeight ? doc.internal.pageSize.getHeight() : doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin + 2;
  const lineHeight = 7;

  // Helper that splits long text and handles page breaks
  // Accepts an optional `fontFamily` so different sections (like votes)
  // can be rendered in a different font (e.g., monospace) without affecting others.
  const addText = (text, x = margin, fontSize = 12, isBold = false, fontFamily = 'helvetica') => {
    const maxWidth = pageWidth - margin - x;
    doc.setFontSize(fontSize);
    // Use the requested font family and style. jsPDF supports built-in
    // fonts like 'helvetica', 'times', and 'courier'.
    try {
      doc.setFont(fontFamily, isBold ? 'bold' : 'normal');
    } catch (e) {
      // Fallback to default if the font name isn't recognized
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    }

    const lines = doc.splitTextToSize(String(text), maxWidth);

    lines.forEach((line) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, x, yPosition);
      yPosition += lineHeight;
    });
  };

  // Helper function to calculate lie detection stats
  const getLieDetectionStats = (player) => {
    const totalRounds = gameState.rounds?.length || 0;
    const detectedLies = gameState.rounds?.filter(round => {
      const vote = round.votes?.[player.id];
      const normalized = vote && typeof vote === 'object' && 'statementIndex' in vote ? vote.statementIndex : (typeof vote === 'number' ? vote : null);
      const lieIndex = round.statements?.findIndex(s => s.type === 'lie');
      return normalized === lieIndex;
    }).length || 0;
    return { detectedLies, totalRounds };
  };

  // If a logo asset exists, try to load it and draw at the top of the first page
  try {
    let logoUrl;
    try {
      logoUrl = (await import('../assets/img/logos/logo.png')).default;
    } catch (e) {
      logoUrl = null;
    }

    if (logoUrl) {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = logoUrl;
      });

      const logoMaxWidth = pageWidth - margin * 2;
      const logoWidth = Math.min(logoMaxWidth, 50);
      const logoHeight = (img.naturalHeight / img.naturalWidth) * logoWidth;
      const logoX = (pageWidth - logoWidth) / 2;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Recolor the logo so white/colored pixels become black while
        // preserving transparency. This makes white logos visible on
        // white PDF backgrounds.
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imageData.data;
          for (let i = 0; i < d.length; i += 4) {
            const alpha = d[i + 3];
            // If pixel is transparent, leave it. Otherwise set to black.
            if (alpha > 8) {
              // set RGB to 0 (black). Keep alpha unchanged.
              d[i] = 0;
              d[i + 1] = 0;
              d[i + 2] = 0;
            }
          }
          ctx.putImageData(imageData, 0, 0);
        } catch (procErr) {
          // getImageData may fail if canvas is tainted; fall back to original
          console.warn('Logo recolor skipped (canvas tainted):', procErr);
        }

        const dataUrl = canvas.toDataURL('image/png');
        doc.addImage(dataUrl, 'PNG', logoX, yPosition, logoWidth, logoHeight);
        yPosition += logoHeight + 6;
      } catch (err) {
        console.warn('Unable to add logo to PDF:', err);
      }
    }
  } catch (err) {
    console.warn('Logo load skipped:', err);
  }

  // Title
  addText('2 TRUTHS AND AI - GAME STATISTICS', margin, 18, true);
  yPosition += 2;

  // (debugging removed)

  // Game Info
  addText(`Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`, margin, 11);
  addText(`Total Rounds: ${gameState.rounds?.length || 0}`, margin, 11);
  addText(`AI Model: ${gameState.aiModel || 'gpt-4'}`, margin, 11);
  addText(`Total Players: ${gameState.players?.length || 0}`, margin, 11);
  yPosition += 2;

  // Leaderboard
  addText('FINAL LEADERBOARD', margin, 14, true);
  if (yPosition > pageHeight - margin) { doc.addPage(); yPosition = margin; }
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  if (gameState.players && gameState.players.length > 0) {
    const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
    sortedPlayers.forEach((player, index) => {
      const stats = getLieDetectionStats(player);
      addText(`${index + 1}. ${player.name}: ${player.score || 0} points (${stats.detectedLies}/${stats.totalRounds} lies detected)`, margin + 5, 11);
    });
  }
  yPosition += 4;

  // Round Details
  addText('ROUND DETAILS', margin, 14, true);
  if (yPosition > pageHeight - margin) { doc.addPage(); yPosition = margin; }
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  if (gameState.rounds && gameState.rounds.length > 0) {
    gameState.rounds.forEach((round, roundIndex) => {
      addText(`Round ${roundIndex + 1}:`, margin, 12, true);

      if (round.statements) {
        const truths = round.statements.filter(s => s.type === 'truth');
        truths.forEach((statement) => {
          const playerName = statement.playerName || gameState.players.find(p => p.id === statement.playerId)?.name || 'Unknown';
          const text = `${playerName}: "${statement.text}"`;
          addText(text, margin + 5, 10);
        });

        const lie = round.statements.find(s => s.type === 'lie');
        if (lie) {
          addText(`AI: "${lie.text}" (LIE)`, margin + 5, 10);
        }
      }

      // Display votes in readable form
        if (round.votes && Object.keys(round.votes).length > 0) {
          // Robust sanitizer: remove control/invisible characters and collapse whitespace.
          // Uses Unicode property escapes when available (modern browsers),
          // with a fallback for older engines.
          function sanitize(s) {
            let str = String(s ?? '');
            // First, remove NULLs, control ranges and common zero-width / invisible
            // characters that often cause glyph spacing issues when embedded.
            str = str.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF\u2060-\u206F]+/g, '');
            // Best-effort: also remove any Unicode "Other" category chars if supported.
            try {
              str = str.replace(/\p{C}+/gu, '');
            } catch (e) {
              // ignore if Unicode property escapes aren't supported
            }
            // Replace a few common punctuation/glyphs with ASCII equivalents
            const map = {
              '\u2014': '-', '\u2013': '-', '\u2010': '-', '\u2011': '-',
              '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
              '\u00A0': ' ', '\uFEFF': '',
              '\u2713': '(correct)', '\u2717': '(wrong)'
            };
            for (const k in map) {
              str = str.split(k).join(map[k]);
            }
            // Collapse runs of whitespace to a single space and trim
            return str.replace(/\s+/g, ' ').trim();
          }

          addText('Votes:', margin + 5, 11, true);

          Object.entries(round.votes).forEach(([playerId, vote]) => {
            const player = gameState.players.find(p => p.id === parseInt(playerId));
            let statementIndex = null;
            if (vote && typeof vote === 'object' && 'statementIndex' in vote) statementIndex = vote.statementIndex;
            else if (typeof vote === 'number') statementIndex = vote;

            const lieIndex = round.statements?.findIndex(s => s.type === 'lie');
            const correct = (statementIndex != null && statementIndex === lieIndex) ? '✓' : '✗';
            const chosen = statementIndex != null ? `statement ${statementIndex + 1}` : 'no vote';
            const chosenText = (statementIndex != null && round.statements && round.statements[statementIndex]) ? round.statements[statementIndex].text : '';

            // Render votes the same way we render statements: playerName: "statement text"
            const playerName = player?.name || gameState.players.find(p => p.id === (vote && vote.playerId) || playerId)?.name || 'Unknown';
            const statementText = chosenText ? sanitize(chosenText) : 'no vote';
            const voteRow = `${sanitize(playerName)}: "${statementText}"`;
            // no debug logging
            // Use the same indentation and font size as statements
            addText(voteRow, margin + 5, 10);
          });
        }

      yPosition += 3;
    });
  }

  // Save the PDF
  doc.save(`2truths-ai-game-data-${Date.now()}.pdf`);
}
