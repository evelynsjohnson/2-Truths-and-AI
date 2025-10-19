# Quick Start Guide

Get up and running with the React app in 5 minutes!

## Prerequisites

- Node.js (v14+)
- npm or yarn

## Installation

### Option 1: Automated Setup (Recommended)

```bash
cd react-app
./setup.sh
```

This will:
- Install all dependencies
- Copy assets from the original project
- Set up the project structure

### Option 2: Manual Setup

```bash
# Navigate to react-app
cd react-app

# Install dependencies
npm install

# Copy assets manually
cp -r ../img/* public/assets/img/
cp -r ../mp3/* public/assets/mp3/
```

## Running the App

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## First Run

1. **Consent Page** - Check all boxes and click Continue
2. **Start Screen** - Click "Start" or explore info pages
3. **Lobby Settings** - Configure number of players and AI model
4. **Truth Inputs** - Each player enters their name and two truths
5. **Round Screen** - Guess which statement is the AI-generated lie
6. **Leaderboard** - View scores and continue

## Testing Features

### Theme System
1. Click "Settings" from Start Screen
2. Try different themes (Default, Coral, Pink, Green, Gray)
3. Adjust volumes
4. Changes persist on refresh

### Game Flow
1. Set up a 2-player game
2. Enter truths for both players
3. Play through a round
4. Check the leaderboard

## Common Issues

### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Assets not loading
```bash
# Ensure assets are copied
ls public/assets/img/
ls public/assets/mp3/

# If empty, copy manually
cp -r ../img/* public/assets/img/
cp -r ../mp3/* public/assets/mp3/
```

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm start
```

## Development Tips

### Hot Reload
- Edit any file in `src/`
- Browser automatically refreshes
- Changes appear instantly

### React DevTools
1. Install React DevTools browser extension
2. Open browser DevTools
3. Use "Components" and "Profiler" tabs

### Debugging
- Open browser console (F12)
- Check for errors and warnings
- Use `console.log()` as needed

## Project Structure

```
react-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── context/        # State management
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Helper functions
│   └── App.js          # Main app with routing
├── public/
│   └── assets/         # Images, sounds, etc.
└── package.json        # Dependencies
```

## Next Steps

1. **Explore the code**
   - Start with `src/App.js` to see routing
   - Check `src/pages/` for page components
   - Review `src/context/` for state management

2. **Customize**
   - Add new themes in `SettingsContext.js`
   - Create new pages in `src/pages/`
   - Add components in `src/components/`

3. **Connect to Backend**
   - Implement LLM API in `src/utils/api.js`
   - Update `generateAILie()` function
   - Test with real AI-generated lies

## Documentation

- **Full Structure**: See `PROJECT_STRUCTURE.md`
- **Migration Guide**: See `MIGRATION_GUIDE.md`
- **Component API**: See `COMPONENT_INDEX.md`

## Building for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npx serve -s build
```

The `build/` folder contains production-ready files.

## Deployment

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd react-app
npm run build
netlify deploy --prod --dir=build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd react-app
vercel
```

### Deploy to GitHub Pages
```bash
# Add to package.json
"homepage": "https://yourusername.github.io/2-truths-ai"

# Install gh-pages
npm install --save-dev gh-pages

# Add deploy scripts to package.json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

## Getting Help

1. Check the documentation files
2. Review error messages in console
3. Use React DevTools to inspect state
4. Check the original HTML/JS files for reference

## Happy Coding! 🚀

You now have a fully functional React version of "2 Truths and AI"!

Start customizing and building new features.
