# Sound Effects

The app expects sound effect files in this directory.

### Expected Files:
- `button-click.mp3` (default for button clicks)
- Add your own sound effect files here

### File Format:
- Format: MP3
- Keep files small (< 100KB recommended)
- Short sounds (< 1 second) work best for UI feedback

### Copying from Original Project:
```bash
cp ../../../mp3/sound-effects/* .
```

### Testing Without Audio Files:

The app will work without sound effects - they'll just fail silently. You can disable sound effects entirely in the Settings page.

## Note:

Sound effects will only play if `sfxEnabled` is true in settings, and after the first user interaction due to browser policies.
