# Component Index

Quick reference for all components in the React app.

## Context Providers

### GameContext
**File:** `src/context/GameContext.js`

**Purpose:** Manages global game state

**API:**
```javascript
const {
  gameState,        // Current game state object
  initializeGame,   // (numPlayers, aiModel) => void
  addPlayer,        // (playerName, playerId) => void
  updatePlayerName, // (playerId, newName) => void
  updateScore,      // (playerId, points) => void
  nextRound,        // () => void
  saveGameData,     // (data) => void
  loadGameData,     // () => data
  resetGame,        // () => void
  giveConsent       // () => void
} = useGame();
```

**State Structure:**
```javascript
{
  players: [],           // Array of player objects
  currentRound: 0,       // Current round number
  currentSet: 1,         // Current set number
  scores: {},            // Score tracking
  gameData: [],          // Game data for export
  aiModel: 'gpt-5-nano', // Selected AI model
  numAIStatements: 4,    // Number of AI statements
  consentGiven: false    // Consent status
}
```

### SettingsContext
**File:** `src/context/SettingsContext.js`

**Purpose:** Manages app settings and themes

**API:**
```javascript
const {
  settings,        // Current settings object
  updateSettings,  // (newSettings) => void
  resetSettings    // () => void
} = useSettings();
```

**Settings Structure:**
```javascript
{
  theme: 'theme-default',      // Current theme
  bgMusic: 'bloop-vibes.mp3', // Background music file
  masterVolume: 0.2,           // Master volume (0-1)
  bgMusicVolume: 0.2,          // Music volume (0-1)
  sfxVolume: 0.2,              // SFX volume (0-1)
  sfxEnabled: true,            // SFX on/off
  sfxFile: 'button-click.mp3', // Default SFX file
  customPrimary: '#ffffff'     // Custom theme color
}
```

---

## Custom Hooks

### useBackgroundMusic
**File:** `src/hooks/useBackgroundMusic.js`

**Purpose:** Manage background music playback

**API:**
```javascript
const { play, pause, toggle, isPlaying } = useBackgroundMusic();
```

### useSoundEffect
**File:** `src/hooks/useSoundEffect.js`

**Purpose:** Play sound effects

**API:**
```javascript
const { playSound, playClick } = useSoundEffect();

// Usage
playSound('custom-sound.mp3');
playClick(); // Plays default click sound
```

### useLocalStorage
**File:** `src/hooks/useLocalStorage.js`

**Purpose:** Persist state to localStorage

**API:**
```javascript
const [value, setValue] = useLocalStorage('key', defaultValue);
```

---

## Reusable Components

### Button
**File:** `src/components/Button/Button.js`

**Purpose:** Styled button with sound effects

**Props:**
```javascript
{
  children,           // Button content
  onClick,            // Click handler
  variant,            // 'primary' | 'secondary' | 'outline' | 'danger'
  size,               // 'small' | 'medium' | 'large' | 'xlarge'
  disabled,           // Boolean
  className,          // Additional CSS classes
  ...props            // Other HTML button props
}
```

**Usage:**
```javascript
<Button 
  variant="primary" 
  size="large" 
  onClick={handleClick}
>
  Click Me
</Button>
```

### Card
**File:** `src/components/Card/Card.js`

**Purpose:** Container component with consistent styling

**Props:**
```javascript
{
  children,   // Card content
  className,  // Additional CSS classes
  ...props    // Other HTML div props
}
```

**Usage:**
```javascript
<Card className="custom-class">
  <h1>Title</h1>
  <p>Content</p>
</Card>
```

### Modal
**File:** `src/components/Modal/Modal.js`

**Purpose:** Popup dialog component

**Props:**
```javascript
{
  isOpen,    // Boolean - show/hide modal
  onClose,   // Function - close handler
  children,  // Modal content
  title      // Optional modal title
}
```

**Usage:**
```javascript
const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Dialog Title"
>
  <p>Modal content here</p>
</Modal>
```

---

## Page Components

### ConsentPage
**File:** `src/pages/ConsentPage/ConsentPage.js`

**Purpose:** Entry point - consent form

**Features:**
- Consent checkboxes
- Validates all consents checked
- Grants access to app

### StartScreen
**File:** `src/pages/StartScreen/StartScreen.js`

**Purpose:** Main menu

**Features:**
- Game logo
- Start button
- Navigation to info pages
- Settings access

### LobbySettings
**File:** `src/pages/LobbySettings/LobbySettings.js`

**Purpose:** Game configuration

**Features:**
- Number of players selection
- AI model selection
- Initialize game

### TruthInputs
**File:** `src/pages/TruthInputs/TruthInputs.js`

**Purpose:** Players enter their truths

**Features:**
- Multi-step form (one player at a time)
- Name input
- Two truth inputs
- Validation

### RoundScreen
**File:** `src/pages/RoundScreen/RoundScreen.js`

**Purpose:** Gameplay screen

**Features:**
- Display statements
- Statement selection
- Submit answer
- Score tracking

### RoundLeaderboard
**File:** `src/pages/Leaderboard/RoundLeaderboard.js`

**Purpose:** Show scores after each round

**Features:**
- Current standings
- Rank visualization
- Continue to next round

### FinalLeaderboard
**File:** `src/pages/Leaderboard/FinalLeaderboard.js`

**Purpose:** Show final results

**Features:**
- Winner announcement
- Final standings
- Play again option
- Return to menu

### HowToPlay
**File:** `src/pages/HowToPlay/HowToPlay.js`

**Purpose:** Game instructions

**Features:**
- Game overview
- Rules explanation
- Tips and strategies

### AboutGame
**File:** `src/pages/AboutGame/AboutGame.js`

**Purpose:** Project information

**Features:**
- Research goals
- Technology info
- Project overview

### AboutUs
**File:** `src/pages/AboutUs/AboutUs.js`

**Purpose:** Team and credits

**Features:**
- Team information
- Credits
- Contact info

### SettingsPage
**File:** `src/pages/SettingsPage/SettingsPage.js`

**Purpose:** App settings

**Features:**
- Theme selection
- Volume controls
- SFX toggle
- Reset to defaults

---

## Utility Functions

### helpers.js
**File:** `src/utils/helpers.js`

**Functions:**
```javascript
shuffleArray(array)           // Shuffle array
formatScore(score)            // Format with commas
calculatePoints(...)          // Calculate game points
generateId()                  // Generate unique ID
debounce(func, wait)         // Debounce function
```

### api.js
**File:** `src/utils/api.js`

**Functions:**
```javascript
generateAILie(truth1, truth2, playerName, aiModel)  // Generate AI lie
submitGameData(gameData)                             // Submit to backend
exportGameDataToJSON(gameData)                       // Export as JSON
```

---

## Routing Structure

**File:** `src/App.js`

```
/ (ConsentPage) - Entry point
├── /start (StartScreen) - Main menu
│   ├── /how-to-play (HowToPlay)
│   ├── /about-game (AboutGame)
│   ├── /about-us (AboutUs)
│   └── /settings (SettingsPage)
│
├── /lobby (LobbySettings) - Game setup
├── /truth-inputs (TruthInputs) - Enter truths
├── /round (RoundScreen) - Gameplay
├── /round-leaderboard (RoundLeaderboard) - Round results
└── /final-leaderboard (FinalLeaderboard) - Final results
```

All routes except `/` are protected and require consent.

---

## CSS Classes

### Global Classes (index.css)
- `.stage` - Full-height centered container
- `.lead` - Subtitle text
- `.controls` - Button container

### Theme Variables
```css
--bg                 /* Background color */
--card               /* Card background */
--primary            /* Primary color */
--secondary          /* Secondary color */
--secondary-hover    /* Secondary hover color */
--muted              /* Muted text color */
--error              /* Error color */
--success            /* Success color */
```

### Available Themes
- `theme-default` (Purple)
- `theme-coral` (Red)
- `theme-pink` (Pink)
- `theme-green` (Green)
- `theme-gray` (Gray)