# Asset Setup

This directory contains game assets that need to be copied from the original project.

## Required Assets

### From `/img/logos/`:
- Copy all logo files to `public/assets/img/logos/`

### From `/img/player-icons/`:
- Copy all player icon files to `public/assets/img/player-icons/`

### From `/mp3/bg-music/`:
- Copy all background music files to `public/assets/mp3/bg-music/`

### From `/mp3/sound-effects/`:
- Copy all sound effect files to `public/assets/mp3/sound-effects/`

## Quick Setup

You can run this command from the `react-app` directory to copy assets:

```bash
# Copy images
cp -r ../img/* public/assets/img/

# Copy audio
cp -r ../mp3/* public/assets/mp3/
```

## Note

Make sure the original project assets exist before running the copy commands.
