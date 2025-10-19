# React App Project Structure

This document provides an overview of the React application structure for the "2 Truths and AI" game.

## Directory Structure

```
react-app/
├── public/
│   ├── assets/
│   │   ├── img/
│   │   │   ├── logos/          # Game logos
│   │   │   └── player-icons/   # Player avatars
│   │   └── mp3/
│   │       ├── bg-music/       # Background music files
│   │       └── sound-effects/  # Sound effect files
│   └── index.html              # HTML template
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.js
│   │   │   └── Button.css
│   │   ├── Card/
│   │   │   ├── Card.js
│   │   │   └── Card.css
│   │   └── Modal/
│   │       ├── Modal.js
│   │       └── Modal.css
│   │
│   ├── pages/                  # Page components
│   │   ├── ConsentPage/
│   │   ├── StartScreen/
│   │   ├── LobbySettings/
│   │   ├── TruthInputs/
│   │   ├── RoundScreen/
│   │   ├── Leaderboard/
│   │   ├── HowToPlay/
│   │   ├── AboutGame/
│   │   ├── AboutUs/
│   │   └── SettingsPage/
│   │
│   ├── context/                # React Context providers
│   │   ├── GameContext.js      # Game state management
│   │   └── SettingsContext.js  # Settings & theme management
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useBackgroundMusic.js
│   │   ├── useSoundEffect.js
│   │   └── useLocalStorage.js
│   │
│   ├── utils/                  # Utility functions
│   │   ├── helpers.js          # General helper functions
│   │   └── api.js              # API calls & data handling
│   │
│   ├── styles/                 # Global styles
│   │   └── index.css
│   │
│   ├── App.js                  # Main app component with routing
│   └── index.js                # Entry point
│
├── package.json                # Dependencies & scripts
├── .gitignore
├── setup.sh                    # Setup script
└── README.md
```

## Key Components

### Context Providers

1. **GameContext** (`src/context/GameContext.js`)
   - Manages game state (players, scores, rounds)
   - Provides functions for game operations
   - Handles data persistence

2. **SettingsContext** (`src/context/SettingsContext.js`)
   - Manages app settings (theme, volume, etc.)
   - Applies theme changes
   - Persists settings to localStorage

### Custom Hooks

1. **useBackgroundMusic** - Manages background music playback
2. **useSoundEffect** - Handles button click sounds and effects
3. **useLocalStorage** - Custom hook for localStorage operations

### Pages

1. **ConsentPage** - Entry point, consent form
2. **StartScreen** - Main menu
3. **LobbySettings** - Game configuration
4. **TruthInputs** - Players enter their truths
5. **RoundScreen** - Gameplay screen
6. **Leaderboard** - Round and final scores
7. **Info Pages** - How to Play, About Game, About Us
8. **SettingsPage** - Theme and audio settings

### Reusable Components

1. **Button** - Styled button with sound effects
2. **Card** - Container component with consistent styling
3. **Modal** - Popup dialog component

## State Management

The app uses React Context for global state management:

- **Game State**: Player data, scores, current round, game data
- **Settings State**: Theme, audio settings, custom preferences

Both contexts persist data to localStorage for continuity.

## Routing

React Router v6 is used for navigation:

- Protected routes require consent to be given
- Routes map to different game screens
- Automatic redirects for unauthorized access

## Styling Approach

- CSS Modules for component-specific styles
- CSS Custom Properties (variables) for theming
- Responsive design with flexbox and grid
- Theme system with multiple color schemes

## Data Flow

1. User gives consent → `GameContext.giveConsent()`
2. Configure game → `GameContext.initializeGame()`
3. Enter truths → Store in state
4. Play rounds → Update scores with `GameContext.updateScore()`
5. Show results → Read from `gameState.players`

## Audio System

- Background music loops continuously
- Volume controls via settings
- Sound effects on button clicks
- All managed through custom hooks

## Future Enhancements

- [ ] Connect to actual LLM API for lie generation
- [ ] Add player authentication
- [ ] Implement real-time multiplayer
- [ ] Add more themes and customization
- [ ] Enhanced analytics and statistics
- [ ] Social sharing features
- [ ] Achievement system

## Development

### Starting Development Server
```bash
npm start
```

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
npm test
```

## Migration from Original

This React version maintains the same:
- Visual design and theming
- Game flow and mechanics
- Audio system
- Settings persistence

Key improvements:
- Component-based architecture
- Better state management
- Type-safe routing
- Reusable UI components
- Easier maintenance and testing
