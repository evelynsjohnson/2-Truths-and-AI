# Quick Start Guide

Get "2 Truths and AI" running in 5 minutes.

## Prerequisites

- Node.js (v16+)
- npm (v8+)

## Installation

```bash
# Clone repository
git clone https://github.com/evelynsjohnson/2-Truths-and-AI.git
cd 2-Truths-and-AI

# Install dependencies
./setup.sh
```

## Running the App

```bash
# Development server (with hot reload)
npm run dev
```

App opens at [http://localhost:3000](http://localhost:3000)

## Note

Since you will not have access to the API key and endpoint for AI-generated lies, the app will run in demo mode with placeholder lies. To enable full functionality, you will need to set up your own backend with access to a large language model API (e.g., OpenAI GPT) and create a .dev.vars file with the necessary environment variables.

## First Run

1. **Consent Page** - Accept terms to proceed
2. **Start Screen** - Main menu with options
3. **Lobby Settings** - Configure players (2-6) and AI model
4. **Truth Inputs** - Each player enters name + 2 truths
5. **Loading** - AI generates lies
6. **Round Screen** - Vote to identify the lie
7. **Leaderboard** - View scores, continue to next round
8. **Final Results** - Winner announcement & game stats

## Common Issues

### Module errors
```bash
rm -rf node_modules package-lock.json
./setup.sh
```

### Port 3000 in use
```bash
PORT=3001 npm run dev
```

### Build errors
```bash
npm run build
# Check terminal output for specific errors
```

## Development

### Hot Reload
Edit files in `src/` - browser auto-refreshes

### React DevTools
Install browser extension for component inspection: [https://react.dev/tools](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)

### Debugging
- Browser console (F12) for errors
- React DevTools for state inspection

## Building for Production

```bash
# Build optimized files
npm run build

# Preview production build
npm run preview
```

## Deployment

### Cloudflare Workers (Recommended)
```bash
npm run deploy
```
Then follow command line prompts to deploy to Cloudflare Pages.

### Manual Deploy
1. `npm run build`
2. Upload `dist/` folder to hosting provider