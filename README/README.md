# 2 Truths and AI

A multiplayer party game where players try to identify AI-generated lies among real statements.

## Overview

**2 Truths and AI** is a modern twist on the classic "2 Truths and a Lie" game. Players submit true statements about themselves, and an AI generates a convincing lie. Everyone votes to identify the fake statement, earning points for correct guesses.

## Quick Start

```bash
# Install dependencies
./setup.sh

# Run development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000)

## Features

### Game Mechanics
- 2-6 player support
- Multiple rounds with configurable timer
- AI-generated lies using GPT models
- Real-time scoring and leaderboards
- Vote and timer persistence across refreshes (anti-cheat)

### User Experience
- 5 theme options
- Background music & sound effects
- Responsive design (mobile & desktop)
- Smooth animations
- Loading states & error handling

### Data Export
- JSON game data export
- PDF statistics report
- PNG leaderboard screenshot

## Technology

- **React** 18.3 + **Vite** 5.4
- **React Router** 6.26
- **Cloudflare Workers** API backend
- **sessionStorage** (game state)
- **localStorage** (user preferences)
- **jsPDF** + **html2canvas** (exports)

## Credits

- **Idea**: Riccardo Bonfanti
- **Music & SFX**: [Pixabay](https://pixabay.com/)
- **Icons**: [Flaticon](https://www.flaticon.com)
- **Logo**: Hand-designed by Evelyn Johnson in Adobe Illustrator
- **Research Project**: CS422 - Fall 2025 @ University of Illinois Chicago

---

**Status:** ✅ Production-ready | **License:** Educational Use
