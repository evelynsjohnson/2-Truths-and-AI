// Minimal Express server to save JSON files to public/assets/json
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Helper to ensure folder exists
function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

// Save both files at once
app.post('/api/save-json', (req, res) => {
  try {
    const { playerTruths, aiLies } = req.body || {};
    if (!playerTruths || !aiLies) {
      return res.status(400).json({ error: 'Missing playerTruths or aiLies in body' });
    }

    const jsonDir = path.join(__dirname, '..', 'public', 'assets', 'json');
    ensureDir(jsonDir);

    fs.writeFileSync(path.join(jsonDir, 'player-truths.json'), JSON.stringify(playerTruths, null, 2), 'utf-8');
    fs.writeFileSync(path.join(jsonDir, 'ai-lies.json'), JSON.stringify(aiLies, null, 2), 'utf-8');

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error saving JSON files:', err);
    return res.status(500).json({ error: 'Failed to save JSON files' });
  }
});

app.listen(PORT, () => {
  console.log(`JSON save server running on http://localhost:${PORT}`);
});
