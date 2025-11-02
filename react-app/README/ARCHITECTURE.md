# 2 Truths and AI - React App
## Complete Skeleton Structure

Created: October 16, 2025
Status: ✅ Ready for Development

## Directory Tree

```
react-app/
│
├── 📄 package.json              # Dependencies & scripts
├── 📄 .gitignore                # Git ignore rules
├── 📄 README.md                 # Main documentation
├── 📄 QUICKSTART.md             # 5-minute guide
├── 📄 PROJECT_STRUCTURE.md      # Architecture details
├── 📄 MIGRATION_GUIDE.md        # HTML→React guide
├── 📄 COMPONENT_INDEX.md        # Component API
├── 📄 SUMMARY.md                # This summary
├── 🔧 setup.sh                  # Setup script
│
├── 📁 public/
│   ├── index.html               # HTML template
│   └── assets/
│       ├── img/
│       │   ├── logos/           # Game logos
│       │   └── player-icons/    # Player avatars
│       └── mp3/
│           ├── bg-music/        # Background music
│           └── sound-effects/   # Sound effects
│
└── 📁 src/
    ├── 📄 index.js              # Entry point
    ├── 📄 App.js                # Main app + routing
    │
    ├── 📁 components/           # Reusable UI
    │   ├── Button/
    │   │   ├── Button.js
    │   │   └── Button.css
    │   ├── Card/
    │   │   ├── Card.js
    │   │   └── Card.css
    │   └── Modal/
    │       ├── Modal.js
    │       └── Modal.css
    │
    ├── 📁 pages/                # 11 Page components
    │   ├── ConsentPage/
    │   ├── StartScreen/
    │   ├── LobbySettings/
    │   ├── TruthInputs/
    │   ├── RoundScreen/
    │   ├── Leaderboard/
    │   ├── HowToPlay/
    │   ├── AboutGame/
    │   ├── AboutUs/
    │   └── SettingsPage/
    │
    ├── 📁 context/              # State management
    │   ├── GameContext.js       # Game state
    │   └── SettingsContext.js   # Settings & themes
    │
    ├── 📁 hooks/                # Custom hooks
    │   ├── useBackgroundMusic.js
    │   ├── useSoundEffect.js
    │   └── useLocalStorage.js
    │
    ├── 📁 utils/                # Utilities
    │   ├── helpers.js           # Helper functions
    │   └── api.js               # API integration
    │
    └── 📁 styles/               # Global styles
        └── index.css            # Global CSS + themes
```

## Quick Commands

```bash
# Setup
cd react-app
./setup.sh

# Development
npm start          # Run dev server (http://localhost:3000)
npm test           # Run tests
npm run build      # Build for production

# Asset copying (if needed)
cp -r ../img/* public/assets/img/
cp -r ../mp3/* public/assets/mp3/
```

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Opens App                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  ConsentPage   │ ◄── Entry Point (/)
         │  Give consent  │
         └────────┬───────┘
                  │ Consent Given
                  ▼
         ┌────────────────┐
         │  StartScreen   │ ◄── Main Menu (/start)
         │  Click Start   │
         └────────┬───────┘
                  │
                  ▼
      ┌──────────────────────┐
      │  LobbySettings       │ ◄── Configure Game (/lobby)
      │  Set players & AI    │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │  TruthInputs         │ ◄── Enter Truths (/truth-inputs)
      │  Each player enters  │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │  RoundScreen         │ ◄── Play Game (/round)
      │  Guess the lie       │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │  RoundLeaderboard    │ ◄── Show Scores (/round-leaderboard)
      │  View standings      │
      └──────────┬───────────┘
                 │
                 │ After all rounds
                 ▼
      ┌──────────────────────┐
      │  FinalLeaderboard    │ ◄── Winner! (/final-leaderboard)
      │  Show final results  │
      └──────────────────────┘
```

## Component Hierarchy

```
<App>
  <SettingsProvider>
    <GameProvider>
      <Routes>
        ├── <ConsentPage />
        ├── <ProtectedRoute>
        │   ├── <StartScreen />
        │   ├── <LobbySettings />
        │   ├── <TruthInputs />
        │   ├── <RoundScreen />
        │   ├── <RoundLeaderboard />
        │   ├── <FinalLeaderboard />
        │   ├── <HowToPlay />
        │   ├── <AboutGame />
        │   ├── <AboutUs />
        │   └── <SettingsPage />
        └── </ProtectedRoute>
      </Routes>
    </GameProvider>
  </SettingsProvider>
</App>
```

## State Flow

```
┌─────────────────────────────────────────────────────────┐
│                  SettingsContext                        │
│  • Theme (5 options)                                    │
│  • Audio (volumes, music, SFX)                          │
│  • Persisted to localStorage                            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Provides to all components
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   GameContext                           │
│  • Players (names, scores)                              │
│  • Current round                                        │
│  • Game data                                            │
│  • Consent status                                       │
│  • Persisted to localStorage                            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Provides to game pages
                          ▼
                  ┌───────────────┐
                  │  Game Pages   │
                  └───────────────┘
```

## Technology Stack

- ⚛️  **React** 18.2.0 - UI library
- 🛣️  **React Router** 6.22.0 - Navigation
- 🎨 **CSS** - Styling with custom properties
- 💾 **localStorage** - Data persistence
- 🔊 **Web Audio API** - Sound management

## Features Checklist

### ✅ Implemented
- [x] Component-based architecture
- [x] React Router navigation
- [x] Context API state management
- [x] Theme system (5 themes)
- [x] Audio system (music + SFX)
- [x] localStorage persistence
- [x] Protected routes
- [x] Responsive design
- [x] 11 complete pages
- [x] Reusable components
- [x] Custom hooks
- [x] Comprehensive documentation

### 🔜 To Implement
- [ ] LLM API integration
- [ ] Real AI lie generation
- [ ] Enhanced animations
- [ ] Additional themes
- [ ] More sound effects
- [ ] Analytics tracking
- [ ] Multiplayer support
- [ ] Achievement system

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `QUICKSTART.md` | 5-minute getting started |
| `PROJECT_STRUCTURE.md` | Detailed architecture |
| `MIGRATION_GUIDE.md` | HTML→React migration |
| `COMPONENT_INDEX.md` | Component API reference |
| `SUMMARY.md` | Project overview |

## 🎉 Success!

You now have a complete React skeleton for "2 Truths and AI"!

**Next Step:** Run `./setup.sh` and start building! 🚀
