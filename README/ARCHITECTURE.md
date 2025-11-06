# 2 Truths and AI - Architecture & Project Structure

Updated: November 5, 2025

## Directory Structure

```
2-Truths-and-AI/
│
├── 📄 package.json              # Dependencies & scripts
├── 📄 vite.config.js            # Vite configuration
├── 📄 wrangler.json             # Cloudflare Workers config
├── � index.html                # Entry HTML
│
├── 📁 src/
│   ├── 📁 react-app/            # React application
│   │   ├── 📄 main.jsx          # Entry point
│   │   ├── 📄 App.jsx           # Main app + routing
│   │   │
│   │   ├── 📁 components/       # Reusable UI
│   │   │   ├── BackgroundMusicManager.jsx
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   └── Modal/
│   │   │
│   │   ├── 📁 pages/            # Page components
│   │   │   ├── ConsentPage/
│   │   │   ├── StartScreen/
│   │   │   ├── LobbySettings/
│   │   │   ├── TruthInputs/
│   │   │   ├── RoundScreen/
│   │   │   ├── Leaderboard/    # Round & Final
│   │   │   ├── GameStats/
│   │   │   ├── HowToPlay/
│   │   │   ├── AboutGame/
│   │   │   ├── AboutUs/
│   │   │   ├── SettingsPage/
│   │   │   ├── LoadingScreen/
│   │   │   └── ErrorPage/
│   │   │
│   │   ├── 📁 context/          # State management
│   │   │   ├── GameContext.jsx  # Game state (sessionStorage)
│   │   │   └── SettingsContext.jsx  # Settings (localStorage)
│   │   │
│   │   ├── 📁 hooks/            # Custom hooks
│   │   │   ├── useBackgroundMusic.js
│   │   │   ├── useSoundEffect.js
│   │   │   └── useLocalStorage.js
│   │   │
│   │   ├── 📁 utils/            # Utilities
│   │   │   ├── helpers.js       # Helper functions
│   │   │   └── api.js           # API + PDF export
│   │   │
│   │   ├── 📁 assets/           # Static assets
│   │   │   ├── img/             # Images, icons, logos
│   │   │   ├── json/            # Game data
│   │   │   ├── mp3/             # Audio files
│   │   │   └── mp4/             # Video files
│   │   │
│   │   └── 📁 styles/           # Global styles
│   │       └── index.css        # Global CSS + themes
│   │
│   └── 📁 worker/               # Cloudflare Worker
│       └── index.js             # API endpoints
│
└── 📁 README/                   # Documentation
    ├── README.md
    ├── ARCHITECTURE.md
    ├── COMPONENT_INDEX.md
    ├── PERSISTENCE.md
    ├── QUICKSTART.md
    └── INDEX.md
```

## Application Flow

```
ConsentPage (/) → StartScreen (/start) → LobbySettings (/lobby)
                   ↓
                  Info Pages:
                  • /how-to-play
                  • /about-game
                  • /about-us
                  • /settings

LobbySettings → TruthInputs (/truth-inputs) → LoadingScreen (/loading)
                                              ↓                                            
RoundLeaderboard (/round-leaderboard)  ←   RoundScreen (/round)
               ↓                              ↓
                     (loop for each round)       
               ↓
GameStats (/game-stats) → FinalLeaderboard (/final-leaderboard)
```

## Technology Stack

- ⚛️  **React** 18.3.1 - UI library
- ⚡ **Vite** 5.4.8 - Build tool & dev server
- 🛣️  **React Router** 6.26.2 - Navigation
- 🎨 **CSS** - Responsive styling with clamp()
- 💾 **sessionStorage/localStorage** - State persistence
- 🔊 **Web Audio API** - Sound management
- 📄 **jsPDF** - PDF export
- 📸 **html2canvas** - Screenshot export
- ☁️  **Cloudflare Workers** - API backend