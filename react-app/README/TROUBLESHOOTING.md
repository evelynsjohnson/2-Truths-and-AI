# Troubleshooting Guide

## Common Issues and Solutions

### ❌ Background Music Not Playing

**Symptoms:** No music plays when the app starts

**Causes & Solutions:**

1. **Missing Audio Files**
   - **Check:** Do files exist in `public/assets/mp3/bg-music/`?
   - **Fix:** Copy audio files from original project:
     ```bash
     cp -r ../mp3/bg-music/* public/assets/mp3/bg-music/
     ```

2. **Music Starts After Consent**
   - **Expected Behavior:** Music starts when you click "Continue" on the Consent page
   - **Not a Bug:** Music won't play until you give consent and click the button
   - **Verify:** After clicking "Continue", check browser console for "🎵 Background music started"

3. **Volume Set to Zero**
   - **Check:** Go to Settings and verify volumes aren't at 0%
   - **Fix:** Adjust Master Volume and Music Volume sliders

4. **Wrong File Path**
   - **Check:** Browser console for 404 errors
   - **Fix:** Ensure file is named exactly `bloop-vibes.mp3` (default) or update settings

5. **File Format Issue**
   - **Check:** Verify file is valid MP3 format
   - **Fix:** Re-encode file if necessary

**Debug Steps:**
```javascript
// Open browser console (F12) and check for:
- "🎵 Background music started" (success)
- 404 errors for .mp3 files (missing files)
- Autoplay policy errors (expected - will start on click)
```

---

### ⚠️ React Router Future Flag Warnings

**Symptoms:** Console warnings about v7 future flags

**Impact:** No functional impact - these are just warnings about future React Router versions

**Solution:** Already fixed! The warnings should be gone with the updated `App.js`:

```javascript
<Router
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
```

If you still see warnings, make sure your `App.js` includes the `future` prop on the Router component.

---

### 🔇 Sound Effects Not Working

**Solutions:**

1. **Check SFX is enabled**
   - Go to Settings
   - Ensure "Enable Sound Effects" is checked

2. **Copy sound files**
   ```bash
   cp -r ../mp3/sound-effects/* public/assets/mp3/sound-effects/
   ```

3. **Check volume**
   - Verify SFX Volume in Settings isn't 0%

---

### 🖼️ Logo Not Displaying

**Symptoms:** Broken image icon on Start Screen

**Solution:**
```bash
cp -r ../img/logos/* public/assets/img/logos/
```

Make sure logo file is named properly (check StartScreen.js for expected name).

---

### 📱 Console Errors on Page Load

**Common Errors:**

1. **"Module not found"**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **"Cannot find module 'react-router-dom'"**
   ```bash
   npm install react-router-dom
   ```

3. **"Failed to load resource: 404"**
   - Check file paths in code
   - Ensure assets are in `public/` folder (not `src/`)

---

### 🎨 Theme Not Changing

**Solutions:**

1. **Clear localStorage**
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Refresh page

2. **Check CSS is loaded**
   - Verify `src/styles/index.css` exists
   - Check for CSS errors in console

---

### 💾 Settings Not Persisting

**Symptoms:** Settings reset on page refresh

**Solutions:**

1. **Check localStorage is enabled**
   - Private/Incognito mode may block localStorage
   - Try regular browser window

2. **Clear corrupt data**
   ```javascript
   // In browser console:
   localStorage.removeItem('2tai_settings_v1');
   localStorage.removeItem('2tai_game_data');
   ```

3. **Check for errors**
   - Open browser console
   - Look for localStorage errors

---

### 🚀 Deployment Issues

**Build Errors:**

```bash
# Clean build
rm -rf build node_modules package-lock.json
npm install
npm run build
```

**Asset Paths in Production:**

If assets don't load after deployment, check:
1. Assets are in `public/` folder (will be copied to build)
2. Paths use absolute paths starting with `/`
3. No relative paths like `../../`

---

### 🔍 Debugging Tips

**Enable Verbose Logging:**

Add to `BackgroundMusicManager.js`:
```javascript
console.log('Music settings:', settings);
console.log('Audio element:', audioRef.current);
```

**Check Audio Element State:**

In browser console:
```javascript
// Find the audio element
const audio = document.querySelector('audio');
console.log('Audio src:', audio?.src);
console.log('Audio ready state:', audio?.readyState);
console.log('Audio paused:', audio?.paused);
```

**React DevTools:**

1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Check SettingsContext values
4. Verify GameContext state

---

### 📞 Still Having Issues?

1. **Check browser console** (F12) for error messages
2. **Verify all files copied** from original project
3. **Try in different browser** to rule out browser-specific issues
4. **Clear cache** and hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
5. **Check the documentation** in other .md files

---

## Quick Fixes Checklist

- [ ] Audio files copied to `public/assets/mp3/`
- [ ] Image files copied to `public/assets/img/`
- [ ] `npm install` completed successfully
- [ ] No errors in browser console
- [ ] Clicked on page to enable audio
- [ ] Volumes not set to 0 in Settings
- [ ] Not in Incognito/Private mode (for localStorage)
- [ ] Using modern browser (Chrome, Firefox, Safari, Edge)

---

## Verification Steps

After fixing issues, verify:

1. ✅ Consent page loads
2. ✅ Can navigate to Start screen
3. ✅ Music starts after first click
4. ✅ Button clicks make sound
5. ✅ Theme changes work
6. ✅ Settings persist on refresh
7. ✅ No console errors
8. ✅ No React Router warnings

---

**Last Updated:** October 18, 2025
