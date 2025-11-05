# Game State Persistence

## Why Persistence?

**Problem**: Users could exploit browser features (back/forward buttons, refresh, direct URL navigation) to:
- Reset the round timer
- Change votes after seeing results
- Skip rounds or go back to previous rounds
- Break game flow and integrity

**Solution**: Persist all game state to sessionStorage, making game progression irreversible and immune to browser navigation tricks.

## Storage Strategy

### sessionStorage (Tab-Specific Game Data)
- Game state survives page refresh within same tab
- Each browser tab runs independent game
- Cleared when tab is closed
- **Keys used:**
  - `2tai_game_state` - Main game state
  - `2tai_game_data` - Statements and AI-generated content
  - `truthInputsPlayerData` - Player names, icons, and truths during input
  - `truthInputsCurrentPlayer` - Current player index during input

### localStorage (Cross-Tab User Settings)
- User preferences persist across tabs and browser restarts
- **Keys used:**
  - `appSettings` - Theme, music, volume preferences
  - `lobbySettings` - Default lobby configuration

## Game State Structure

```javascript
{
  players: [
    { id: 1, name: "Player 1", icon: "path/to/icon.png", score: 150, streak: 2 }
  ],
  currentRound: 1,
  rounds: [
    {
      player: { id: 2, name: "Player 2" },        // The chameleon
      statements: [
        { text: "Statement 1", type: "truth" },
        { text: "Statement 2", type: "lie" }
      ],
      startTime: 1699123456789,                   // Timestamp when round started
      votes: {
        1: { statementIndex: 1, timeRemaining: 45 }
      },
      results: {                                  // Populated after reveal
        lieIndex: 1,
        playerResults: {
          1: { total: 75, correct: true, breakdown: {...} }
        }
      }
    }
  ],
  aiModel: "gpt-4.1-mini",
  roundLength: 60,
  numRounds: 3
}
```

## How It Prevents Browser Exploits

### ✅ Page Refresh
- Timer continues from where it left off (calculated from `startTime`)
- Votes are preserved
- Cannot reset timer by refreshing

### ✅ Browser Back/Forward
- State is restored from sessionStorage
- Cannot go back to change votes
- Route guards redirect invalid navigation

### ✅ Direct URL Navigation
- Trying to navigate to `/lobby` during game redirects back to current screen
- Cannot skip ahead to future rounds

### ✅ Multiple Tab Protection
- Each tab has isolated game state (sessionStorage)
- Cannot interfere with game in other tabs

## Key Implementation Details

### Round Timer Persistence
```javascript
// On round start: Store timestamp
startTime: Date.now()

// On page reload: Calculate remaining time
const elapsed = (Date.now() - startTime) / 1000;
const remaining = Math.max(0, roundLength - elapsed);
```

### Vote Persistence
```javascript
// Immediately save votes to sessionStorage when cast
const newVotes = { ...votes, [playerId]: { statementIndex, timeRemaining } };
updateGameState({ rounds: updatedRounds }); // Auto-saves to sessionStorage
```

### Results Persistence
```javascript
// Once results exist, round cannot be replayed
if (currentRoundData.results) {
  // Show reveal state, disable voting
  setIsRevealing(true);
  setRevealedLieIndex(results.lieIndex);
}
```

## GameContext - Single Source of Truth

All game state lives in GameContext and automatically persists to sessionStorage:

```javascript
// Auto-save on every state change
useEffect(() => {
  sessionStorage.setItem('2tai_game_state', JSON.stringify(gameState));
}, [gameState]);

// Restore on app load
const [gameState, setGameState] = useState(() => {
  const saved = sessionStorage.getItem('2tai_game_state');
  return saved ? JSON.parse(saved) : defaultState;
});
```

## Benefits

✅ **Game Integrity**: Impossible to cheat or exploit browser features  
✅ **Accurate Timing**: Timer based on timestamps, not decrements  
✅ **Data Persistence**: All progress saved automatically  
✅ **Tab Isolation**: Multiple independent games can run simultaneously  
✅ **Simple Mental Model**: GameContext is the single source of truth  

## Reset Behavior

```javascript
resetGame() {
  // Clears game data
  sessionStorage.removeItem('2tai_game_state');
  sessionStorage.removeItem('truthInputsPlayerData');
  
  // Preserves user preferences
  // localStorage ('appSettings', 'lobbySettings') untouched
}
```
