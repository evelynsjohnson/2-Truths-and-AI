/* settings.js
Handles theme selection, background music selection, and button click sound effects.
Persists choices in localStorage and applies them on load.
*/
(function () {
    const STORE_KEY = '2tai_settings_v1';

    const defaultSettings = {
        theme: 'theme-default',
        bgMusic: 'bloop-vibes.mp3', // default background music filename
        // volumes are 0.0 - 1.0
        masterVolume: 0.2,
        bgMusicVolume: 0.2,
        sfxVolume: 0.2,
        sfxEnabled: true,
        sfxFile: 'button-click.mp3',
        // custom theme primary color (hex)
        customPrimary: '#ffffff'
    };

    let settings = Object.assign({}, defaultSettings, load());

    // Audio elements
    let bgAudio = null;
    let sfxAudio = null;

    // track whether we've shown the enable-sound prompt or the user has already
    // unlocked audible playback via a gesture so we don't repeatedly nag the user
    let enableSoundPromptShown = false;
    let userGestureUnlocked = false;

    function load() {
        try {
            const raw = localStorage.getItem(STORE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.warn('Could not load settings', e);
            return {};
        }
    }

    function save() {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings', e);
        }
    }

    // Apply theme by setting a data-theme attribute on <html>
    function applyTheme(theme) {
        // map of theme tokens to colors (primary, secondary, secondary-hover, bg)
        const themeDefs = {
            'theme-default': { primary: '#6b63ff', secondary: '#3b34d1', secondaryHover: '#5048e5', bg: '#0d0d0d' },
            'theme-coral': { primary: '#e86b6b', secondary: '#d9534f', secondaryHover: '#f08a84', bg: '#0d0d0d' },
            'theme-pink': { primary: '#f07ad9', secondary: '#d94ec9', secondaryHover: '#f59fe0', bg: '#0d0d0d' },
            'theme-green': { primary: '#59b89b', secondary: '#48a17f', secondaryHover: '#6fc2a9', bg: '#0d0d0d' },
            'theme-gray': { primary: '#9a9a9a', secondary: '#7f7f7f', secondaryHover: '#a9a9a9', bg: '#0d0d0d' }
        };

        document.documentElement.setAttribute('data-theme', theme);
        settings.theme = theme;
        save();

        if (theme === 'theme-custom') {
            // apply via computed variants
            applyCustomTheme(settings.customPrimary || defaultSettings.customPrimary);
        } else {
            const def = themeDefs[theme];
            if (def) {
                document.documentElement.style.setProperty('--primary', def.primary);
                document.documentElement.style.setProperty('--secondary', def.secondary);
                document.documentElement.style.setProperty('--secondary-hover', def.secondaryHover);
                document.documentElement.style.setProperty('--bg', def.bg);
            }
        }
    }

    // Setup background music audio element and controls
    function applyBgMusic(filename) {
        settings.bgMusic = filename || '';
        save();

        if (bgAudio) {
            bgAudio.pause();
            bgAudio.src = '';
            bgAudio = null;
        }

        if (filename) {
            bgAudio = new Audio('mp3/bg-music/' + filename);
            bgAudio.preload = 'auto';
            bgAudio.loop = true;
            bgAudio.volume = (settings.masterVolume ?? 0.5) * (settings.bgMusicVolume ?? 0.8);

            const savedTime = Number(localStorage.getItem('2tai_bg_time') || 0) || 0;
            let triedSetTime = false;
            bgAudio.addEventListener('loadedmetadata', () => {
                try {
                    if (savedTime > 0 && savedTime < bgAudio.duration) {
                        bgAudio.currentTime = savedTime;
                        triedSetTime = true;
                    }
                } catch (e) {
                    // ignore
                }
            });

            const showEnableSoundPrompt = () => {
                // don't show repeatedly during the same session if we've already
                // shown it or the user already unlocked sound via gesture
                if (enableSoundPromptShown || userGestureUnlocked) return;
                // create a minimal, accessible prompt if not already present
                if (document.getElementById('enable-sound-prompt')) return;

                const wrapper = document.createElement('div');
                wrapper.id = 'enable-sound-prompt';
                wrapper.setAttribute('role', 'dialog');
                wrapper.setAttribute('aria-modal', 'true');
                wrapper.style.position = 'fixed';
                wrapper.style.left = '0';
                wrapper.style.top = '0';
                wrapper.style.width = '100%';
                wrapper.style.height = '100%';
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.justifyContent = 'center';
                wrapper.style.background = 'rgba(0,0,0,0.45)';
                wrapper.style.zIndex = '9999';

                const card = document.createElement('div');
                card.style.background = '#0f0f12';
                card.style.color = '#fff';
                card.style.padding = '18px';
                card.style.borderRadius = '10px';
                card.style.maxWidth = '420px';
                card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
                card.style.textAlign = 'center';

                const title = document.createElement('div');
                title.textContent = 'Enable sound?';
                title.style.fontWeight = '700';
                title.style.fontSize = '1.1rem';
                title.style.marginBottom = '8px';

                const desc = document.createElement('div');
                desc.textContent = 'The browser blocked autoplay. Please enable sound.';
                desc.style.fontSize = '0.95rem';
                desc.style.opacity = '0.95';
                desc.style.marginBottom = '14px';

                const btnEnable = document.createElement('button');
                btnEnable.textContent = 'Enable sound';
                btnEnable.style.background = '#6b63ff';
                btnEnable.style.color = '#fff';
                btnEnable.style.border = 'none';
                btnEnable.style.padding = '10px 14px';
                btnEnable.style.borderRadius = '8px';
                btnEnable.style.cursor = 'pointer';
                btnEnable.style.fontWeight = '700';
                btnEnable.style.marginRight = '8px';

                card.appendChild(title);
                card.appendChild(desc);
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.justifyContent = 'center';
                row.style.gap = '8px';
                row.appendChild(btnEnable);
                card.appendChild(row);
                wrapper.appendChild(card);
                document.body.appendChild(wrapper);
                enableSoundPromptShown = true;

                function cleanup() {
                    try { wrapper.remove(); } catch (e) { }
                }

                btnEnable.addEventListener('click', () => {
                    try {
                        if (bgAudio) {
                            bgAudio.muted = false;
                            bgAudio.volume = (settings.masterVolume ?? 0.5) * (settings.bgMusicVolume ?? 0.8);
                            bgAudio.play().catch(() => { });
                        }
                    } catch (e) { }
                    // mark that the user explicitly enabled sound so we don't prompt again
                    userGestureUnlocked = true;
                    enableSoundPromptShown = true;
                    cleanup();
                });

                // No dismiss button: prompt will be removed when user enables sound or
                // when they interact (first gesture unmute listener will also remove it).
            };

            const playNow = async () => {
                try {
                    // First try to play with sound (best UX). Modern browsers may reject this
                    // attempt if there's no prior user interaction.
                    const p = bgAudio.play();
                    if (p && typeof p.then === 'function') {
                        await p.catch(() => { throw new Error('play-rejected'); });
                    }
                    // If we reached here, unmuted playback started successfully.
                    if (bgAudio) bgAudio.muted = false;
                    return;
                } catch (err) {
                    // Unmuted play was blocked. Fall back to a muted autoplay so the audio
                    // element can start (browsers generally allow muted autoplay). We'll
                    // then unmute on the first user gesture.
                    try {
                        bgAudio.muted = true;
                        const p2 = bgAudio.play();
                        if (p2 && typeof p2.then === 'function') {
                            await p2.catch(() => { /* still couldn't autoplay muted */ });
                        }
                    } catch (e) {
                        // ignore
                    }

                    // Listen for a single user gesture to unmute and restore audible volume.
                    const unmuteOnce = () => {
                        try {
                            if (!bgAudio) return;
                            bgAudio.muted = false;
                            bgAudio.volume = (settings.masterVolume ?? 0.5) * (settings.bgMusicVolume ?? 0.8);
                            // try to resume playback in case it wasn't started
                            bgAudio.play().catch(() => { /* ignore */ });
                        } catch (e) { }
                        // remove any prompt UI if present
                        try {
                            const wrapper = document.getElementById('enable-sound-prompt');
                            if (wrapper) wrapper.remove();
                        } catch (e) { }
                        userGestureUnlocked = true;
                        document.removeEventListener('click', unmuteOnce);
                        document.removeEventListener('keydown', unmuteOnce);
                        document.removeEventListener('touchstart', unmuteOnce);
                    };

                    // show a prompt to help users enable sound if they want
                    if (!enableSoundPromptShown && !userGestureUnlocked) showEnableSoundPrompt();

                    document.addEventListener('click', unmuteOnce, { once: true, passive: true });
                    document.addEventListener('keydown', unmuteOnce, { once: true, passive: true });
                    document.addEventListener('touchstart', unmuteOnce, { once: true, passive: true });
                }
            };

            playNow();
        }
    }

    function playSfx() {
        if (!settings.sfxEnabled) return Promise.resolve();
        try {
            const src = 'mp3/sound-effects/' + (settings.sfxFile || 'button-click.mp3');
            // create a fresh Audio so each click can overlap and we get a fresh play() promise
            const pcm = new Audio(src);
            pcm.preload = 'auto';
            // respect sfxVolume and masterVolume
            pcm.volume = (settings.sfxVolume !== undefined ? settings.sfxVolume : 0.72) * (settings.masterVolume !== undefined ? settings.masterVolume : 0.5);
            const p = pcm.play();
            // ensure we return a promise so callers can wait for playback to start
            if (p && typeof p.then === 'function') {
                p.catch(() => { });
                return p;
            }
            return Promise.resolve();
        } catch (e) {
            return Promise.resolve();
        }
    }

    // Initialize UI controls if present on the page
    function initControls() {
        // Theme buttons: any element with data-theme-value
        document.querySelectorAll('[data-theme-value]').forEach(btn => {
            const v = btn.getAttribute('data-theme-value');
            btn.addEventListener('click', () => {
                applyTheme(v);
                highlightThemeButtons();
                playSfx();
            });
        });

        // Background music select (if present)
        const bgSelect = document.getElementById('bg-music-select');
        if (bgSelect) {
            // populate options if empty
            if (bgSelect.children.length <= 1) {
                // try to fetch list via a JSON manifest if present
                // fallback: leave as-is; user can place filenames manually in options
            }

            bgSelect.value = settings.bgMusic || '';
            bgSelect.addEventListener('change', () => {
                applyBgMusic(bgSelect.value);
                playSfx();
            });
        }

        // SFX toggle
        const sfxToggle = document.getElementById('sfx-toggle');
        if (sfxToggle) {
            sfxToggle.checked = !!settings.sfxEnabled;
            sfxToggle.addEventListener('change', () => {
                settings.sfxEnabled = !!sfxToggle.checked;
                save();
            });
        }

        // Master volume control
        const masterVol = document.getElementById('master-volume');
        if (masterVol) {
            const masterLabel = document.getElementById('master-volume-label');
            masterVol.value = Math.round((settings.masterVolume !== undefined ? settings.masterVolume : 0.5) * 100);
            if (masterLabel) masterLabel.textContent = masterVol.value + '%';
            masterVol.addEventListener('input', () => {
                const v = Math.max(0, Math.min(100, Number(masterVol.value)));
                settings.masterVolume = v / 100;
                save();
                // update UI label
                if (masterLabel) masterLabel.textContent = v + '%';
                // apply to bg and future sfx
                if (bgAudio) bgAudio.volume = settings.masterVolume * (settings.bgMusicVolume || 0.8);
            });
        }

        // SFX volume control
        const sfxVol = document.getElementById('sfx-volume');
        if (sfxVol) {
            const sfxLabel = document.getElementById('sfx-volume-label');
            sfxVol.value = Math.round((settings.sfxVolume !== undefined ? settings.sfxVolume : 0.72) * 100);
            if (sfxLabel) sfxLabel.textContent = sfxVol.value + '%';
            sfxVol.addEventListener('input', () => {
                const v = Math.max(0, Math.min(100, Number(sfxVol.value)));
                settings.sfxVolume = v / 100;
                save();
                if (sfxLabel) sfxLabel.textContent = v + '%';
            });
        }

        // Background music volume control (relative multiplier)
        const bgVol = document.getElementById('bg-music-volume');
        if (bgVol) {
            const bgLabel = document.getElementById('bg-music-volume-label');
            bgVol.value = Math.round((settings.bgMusicVolume !== undefined ? settings.bgMusicVolume : 0.8) * 100);
            if (bgLabel) bgLabel.textContent = bgVol.value + '%';
            bgVol.addEventListener('input', () => {
                const v = Math.max(0, Math.min(100, Number(bgVol.value)));
                settings.bgMusicVolume = v / 100;
                save();
                if (bgLabel) bgLabel.textContent = v + '%';
                if (bgAudio) bgAudio.volume = (settings.masterVolume ?? 0.5) * (settings.bgMusicVolume ?? 0.8);
            });
        }

        // Custom theme color input
        const customColorInput = document.getElementById('theme-custom-color');
        if (customColorInput) {
            customColorInput.value = settings.customPrimary || defaultSettings.customPrimary;
            customColorInput.addEventListener('input', () => {
                settings.customPrimary = customColorInput.value;
                save();
                if (document.documentElement.getAttribute('data-theme') === 'theme-custom') {
                    applyCustomTheme(settings.customPrimary);
                }
            });
        }

        highlightThemeButtons();
    }

    // Reset to defaults utility
    function resetToDefaults() {
        settings = Object.assign({}, defaultSettings);
        save();
        // apply theme and bg music according to defaults
        applyTheme(settings.theme || defaultSettings.theme);
        applyBgMusic(settings.bgMusic || '');

        // update UI elements if present
        const masterVol = document.getElementById('master-volume');
        const masterLabel = document.getElementById('master-volume-label');
        if (masterVol) { masterVol.value = Math.round(settings.masterVolume * 100); if (masterLabel) masterLabel.textContent = masterVol.value + '%'; }

        const sfxVol = document.getElementById('sfx-volume');
        const sfxLabel = document.getElementById('sfx-volume-label');
        if (sfxVol) { sfxVol.value = Math.round(settings.sfxVolume * 100); if (sfxLabel) sfxLabel.textContent = sfxVol.value + '%'; }

        const bgVol = document.getElementById('bg-music-volume');
        const bgLabel = document.getElementById('bg-music-volume-label');
        if (bgVol) { bgVol.value = Math.round(settings.bgMusicVolume * 100); if (bgLabel) bgLabel.textContent = bgVol.value + '%'; }

        const sfxToggle = document.getElementById('sfx-toggle');
        if (sfxToggle) sfxToggle.checked = !!settings.sfxEnabled;

        const bgSelect = document.getElementById('bg-music-select');
        if (bgSelect) bgSelect.value = settings.bgMusic || '';

        const colorInput = document.getElementById('theme-custom-color');
        if (colorInput) colorInput.value = settings.customPrimary || defaultSettings.customPrimary;

        // update custom theme swatch appearance if present
        const customSwatch = document.getElementById('theme-swatch-custom');
        if (customSwatch) {
            const gradientPreview = 'linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8b00ff)';

            if (settings.theme === 'theme-custom') {
                customSwatch.style.background = settings.customPrimary || defaultSettings.customPrimary;
            } else {
                customSwatch.style.background = gradientPreview;
            }
        }

        highlightThemeButtons();
    }

    function highlightThemeButtons() {
        const current = settings.theme || defaultSettings.theme;
        document.querySelectorAll('[data-theme-value]').forEach(btn => {
            btn.classList.toggle('active-theme', btn.getAttribute('data-theme-value') === current);
        });
    }

    // Compute lighter/darker variants and apply custom theme given a primary hex color
    function applyCustomTheme(hex) {
        // set CSS variables on documentElement for custom theme
        // convert hex to HSL
        function hexToHsl(h) {
            h = h.replace('#', '');
            const bigint = parseInt(h, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
            const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
            let hHue, s, l = (max + min) / 2;
            if (max === min) { hHue = s = 0; } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case rNorm: hHue = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                    case gNorm: hHue = (bNorm - rNorm) / d + 2; break;
                    case bNorm: hHue = (rNorm - gNorm) / d + 4; break;
                }
                hHue /= 6;
            }
            return { h: hHue * 360, s: s * 100, l: l * 100 };
        }

        function hslToHex(h, s, l) {
            s /= 100; l /= 100;
            const k = n => (n + h / 30) % 12;
            const a = s * Math.min(l, 1 - l);
            const f = n => {
                const color = l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        }

        try {
            const hsl = hexToHsl(hex);
            // make lighter and darker variants
            const lighter = hslToHex(hsl.h, Math.max(10, hsl.s - 5), Math.min(90, hsl.l + 18));
            const darker = hslToHex(hsl.h, Math.max(8, hsl.s - 8), Math.max(18, hsl.l - 10));
            // apply
            document.documentElement.style.setProperty('--primary', hex);
            document.documentElement.style.setProperty('--secondary', darker);
            document.documentElement.style.setProperty('--secondary-hover', lighter);
        } catch (e) {
            // fallback: do nothing
        }
    }

    // Attach click sound to buttons across pages
    function wireGlobalButtonSfx() {
        function handler(e) {
            // play on left-button clicks only
            if (e instanceof MouseEvent && e.button !== 0) return;
            playSfx();
        }

        document.addEventListener('click', (e) => {
            const tgt = e.target.closest('button, a');
            if (!tgt) return;
            handler(e);
        });
    }

    // Public init
    function init() {
        // apply theme
        applyTheme(settings.theme || defaultSettings.theme);

        // start bg music (if allowed by browser)
        if (settings.bgMusic) applyBgMusic(settings.bgMusic);
        // if custom theme active, make sure custom colors applied
        if ((settings.theme || defaultSettings.theme) === 'theme-custom') {
            applyCustomTheme(settings.customPrimary || defaultSettings.customPrimary);
        }

        // wire controls
        initControls();
        wireGlobalButtonSfx();

        // Preload SFX for lower-latency playback and so play() can resolve quickly
        try {
            sfxAudio = new Audio('mp3/sound-effects/' + (settings.sfxFile || defaultSettings.sfxFile));
            sfxAudio.preload = 'auto';
            sfxAudio.load();
        } catch (e) {
            // ignore
        }

        // save bg audio playback time periodically so other pages can resume
        setInterval(() => {
            if (bgAudio && !isNaN(bgAudio.currentTime)) {
                try { localStorage.setItem('2tai_bg_time', String(bgAudio.currentTime)); } catch (e) { }
            }
        }, 2000);
    }

    // Run when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // expose for debug & programatic control
    window._appSettings = {
        get: () => settings,
        setTheme: applyTheme,
        setBgMusic: applyBgMusic,
        playSfx,
        // Pause background audio (useful when navigating away)
        pauseBg: () => { if (bgAudio) try { bgAudio.pause(); } catch (e) { } },
        // Resume background audio
        resumeBg: () => { if (bgAudio) try { bgAudio.play().catch(() => { }); } catch (e) { } },
        // Reset settings to defaults (updates storage and UI)
        resetDefaults: resetToDefaults
    };
})();

