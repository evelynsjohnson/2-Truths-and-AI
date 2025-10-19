# Audio Files

## Background Music

The app expects background music files in this directory. 

### Expected Files:
- `tell-me-what.mp3` (default)
- Add your own MP3 files here

### File Format:
- Format: MP3
- Recommended bitrate: 128-192 kbps
- Loopable tracks work best

### Copying from Original Project:
```bash
cp ../../../mp3/bg-music/* .
```

### Testing Without Audio Files:

If you don't have audio files yet, the app will still work - it will just fail silently when trying to play music. Check the browser console for warnings.

### Adding Your Own Music:

1. Place MP3 files in this directory
2. Update the settings in the app to select your file
3. Or modify `src/context/SettingsContext.js` to change the default

## Note:

Due to browser autoplay policies, music will only start playing after the first user interaction (click, tap, etc.).
