# Migration Guide: HTML/JS to React

This guide explains how the original HTML/JavaScript application was translated into a React application.

## Overview

The original application consisted of multiple HTML pages with vanilla JavaScript. The React version consolidates everything into a single-page application (SPA) with component-based architecture.

## Key Changes

### 1. File Structure

**Original:**
```
index.html (consent)
start-screen.html
lobby-settings.html
truth-inputs.html
round-screen.html
...
js/game.js
js/settings.js
css/styles.css
```

**React:**
```
src/
  pages/ConsentPage/
  pages/StartScreen/
  pages/LobbySettings/
  ...
  App.js (routing)
```

### 2. Navigation

**Original:** Multiple HTML files with `<a href="...">` or `window.location.href`

**React:** Single-page app with React Router
```javascript
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/start');
```

### 3. State Management

**Original:** Global variables and localStorage

**React:** Context API with hooks
```javascript
// Before
let gameData = JSON.parse(localStorage.getItem('game'));

// After
const { gameState, updateScore } = useGame();
```

### 4. Event Handlers

**Original:** Direct DOM manipulation
```javascript
document.getElementById('btn').addEventListener('click', () => {
  // ...
});
```

**React:** Component event handlers
```javascript
<Button onClick={handleClick}>Click Me</Button>
```

### 5. Styling

**Original:** Global CSS with inline styles
```html
<style>
  .btn { background: var(--primary); }
</style>
```

**React:** Component-scoped CSS files
```javascript
import './Button.css';
<button className="btn">...</button>
```

## Component Mapping

| Original HTML File | React Component |
|-------------------|-----------------|
| `index.html` | `ConsentPage.js` |
| `start-screen.html` | `StartScreen.js` |
| `lobby-settings.html` | `LobbySettings.js` |
| `truth-inputs.html` | `TruthInputs.js` |
| `round-screen.html` | `RoundScreen.js` |
| `round-leaderboard.html` | `RoundLeaderboard.js` |
| `final-leaderboard.html` | `FinalLeaderboard.js` |
| `how-to-play.html` | `HowToPlay.js` |
| `about-the-game.html` | `AboutGame.js` |
| `about-us.html` | `AboutUs.js` |
| `app-settings.html` | `SettingsPage.js` |

## JavaScript Migration

### Settings (js/settings.js)

**Original:**
```javascript
const settings = {
  theme: 'theme-default',
  bgMusic: 'tell-me-what.mp3',
  // ...
};

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
```

**React:**
```javascript
// src/context/SettingsContext.js
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);
  
  // ...
}
```

### Audio Handling

**Original:**
```javascript
let bgAudio = new Audio('mp3/bg-music/song.mp3');
bgAudio.play();
```

**React:**
```javascript
// src/hooks/useBackgroundMusic.js
export function useBackgroundMusic() {
  const audioRef = useRef(null);
  
  const play = async () => {
    await audioRef.current.play();
  };
  
  return { play, pause, toggle };
}
```

### Game State

**Original:**
```javascript
let players = [];
let currentRound = 0;

function addPlayer(name) {
  players.push({ name, score: 0 });
}
```

**React:**
```javascript
// src/context/GameContext.js
export function GameProvider({ children }) {
  const [gameState, setGameState] = useState({
    players: [],
    currentRound: 0
  });
  
  const addPlayer = (name) => {
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, { name, score: 0 }]
    }));
  };
  
  return (
    <GameContext.Provider value={{ gameState, addPlayer }}>
      {children}
    </GameContext.Provider>
  );
}
```

## Benefits of React Version

### 1. Component Reusability
- `Button`, `Card`, `Modal` components can be used everywhere
- Consistent styling and behavior

### 2. State Management
- Centralized state in Context providers
- Predictable data flow
- Easy debugging with React DevTools

### 3. Developer Experience
- Hot reload during development
- Better error messages
- Component composition

### 4. Performance
- Virtual DOM for efficient updates
- Only re-render what changes
- Code splitting possible

### 5. Maintainability
- Clear component hierarchy
- Separation of concerns
- Easier testing

## Implementation Details

### Protected Routes

Only users who have given consent can access the app:

```javascript
function ProtectedRoute({ children }) {
  const { gameState } = useGame();
  
  if (!gameState.consentGiven) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
```

### Theme System

Themes are applied via CSS custom properties:

```javascript
// Setting a theme
updateSettings({ theme: 'theme-coral' });

// Applied automatically
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.setProperty('--primary', color);
}, [settings.theme]);
```

### Audio System

Audio is managed with refs to avoid recreating elements:

```javascript
const audioRef = useRef(null);

useEffect(() => {
  if (!audioRef.current) {
    audioRef.current = new Audio(src);
  }
  audioRef.current.volume = volume;
}, [src, volume]);
```

## Next Steps for Full Migration

### 1. Copy Assets
```bash
cd react-app
./setup.sh
```

### 2. Implement LLM Integration
Connect the `generateAILie()` function in `src/utils/api.js` to your actual backend.

### 3. Test All Flows
- Consent → Start → Lobby → Input → Round → Leaderboard
- Settings changes persist
- Audio works correctly
- Themes apply properly

### 4. Add Missing Features
- Any custom features from original
- Additional game modes
- Enhanced statistics

### 5. Deploy
```bash
npm run build
# Deploy the build/ folder
```

## Troubleshooting

### Audio Not Playing
- Check browser autoplay policies
- Ensure user interaction before playing
- Verify file paths in public/assets/

### Routes Not Working
- Ensure BrowserRouter wraps the app
- Check that all Routes are inside <Routes>
- Verify protected route logic

### Styling Issues
- Check CSS import statements
- Verify CSS custom properties are defined
- Ensure theme is applied to :root

### State Not Persisting
- Check localStorage is enabled
- Verify Context providers wrap components
- Check useEffect dependencies

## Conclusion

The React version maintains all functionality of the original while providing:
- Better code organization
- Improved maintainability
- Enhanced developer experience
- Foundation for future features

The component-based architecture makes it easier to add new features, test code, and collaborate with other developers.
