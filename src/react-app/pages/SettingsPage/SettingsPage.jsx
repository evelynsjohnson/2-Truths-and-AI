/**
 * @fileoverview SettingsPage component for adjusting application settings.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import Button from '../../components/Button/Button';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { playClick } = useSoundEffect();
  
  // Local state for volume sliders and custom color
  const [masterVolume, setMasterVolume] = useState(settings.masterVolume * 100);
  const [sfxVolume, setSfxVolume] = useState(settings.sfxVolume * 100);
  const [bgMusicVolume, setBgMusicVolume] = useState(settings.bgMusicVolume * 100);
  const [customColor, setCustomColor] = useState(settings.customPrimary || '#6b63ff');

  // Sync local state with context settings on mount and when settings change
  useEffect(() => {
    setMasterVolume(settings.masterVolume * 100);
    setSfxVolume(settings.sfxVolume * 100);
    setBgMusicVolume(settings.bgMusicVolume * 100);
  }, [settings]);

  // Handlers for settings changes
  const handleMasterVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setMasterVolume(value);
    updateSettings({ masterVolume: value / 100 });
    playClick();
  };

  const handleSfxVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setSfxVolume(value);
    updateSettings({ sfxVolume: value / 100 });
    playClick();
  };

  const handleBgMusicVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setBgMusicVolume(value);
    updateSettings({ bgMusicVolume: value / 100 });
    playClick();
  };

  const handleBgMusicChange = (e) => {
    updateSettings({ bgMusic: e.target.value });
    playClick();
  };

  const handleThemeChange = (themeValue) => {
    updateSettings({ theme: themeValue });
    playClick();
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    updateSettings({ customPrimary: color });
    if (settings.theme === 'theme-custom') {
      document.documentElement.style.setProperty('--primary', color);
    }
  };

  const handleCustomSwatchClick = () => {
    handleThemeChange('theme-custom');
  };

  const handleResetDefaults = () => {
    playClick();
    resetSettings();
    // Local state will be updated by the useEffect when settings change
  };

  // Render the settings page
  return (
    <div className="settings-page-wrapper">
      <main className="settings-stage">
      <header className="settings-header">
        <Button                                 // Button to navigate back to home/start screen
          className="settings-home-btn" 
          aria-label="Home" 
          onClick={() => navigate('/start')}
          variant="icon"
        >
          <img src="/assets/img/button-icons/home.png" alt="Home" style={{width: '22px'}} />
        </Button>
        <div>
          <h1 className="settings-title">App Settings</h1>
          <div className="settings-divider" aria-hidden="true"></div>
        </div>
      </header>

      <section className="settings-controls">
        <div className="settings-row">                                    {/* Sounds volume control */}
          <label htmlFor="master-volume">Master Volume</label>
          <input 
            id="master-volume" 
            type="range" 
            min="0" 
            max="100" 
            value={masterVolume}
            onChange={handleMasterVolumeChange}
          />
          <span className="volume-label">{Math.round(masterVolume)}%</span>
        </div>

        <div className="settings-row">
          <label htmlFor="sfx-volume">Sound Effects</label>
          <input 
            id="sfx-volume" 
            type="range" 
            min="0" 
            max="100" 
            value={sfxVolume}
            onChange={handleSfxVolumeChange}
          />
          <span className="volume-label">{Math.round(sfxVolume)}%</span>
        </div>

        <div className="settings-row">
          <label htmlFor="bg-music-volume">Music Volume</label>
          <input 
            id="bg-music-volume" 
            type="range" 
            min="0" 
            max="100" 
            value={bgMusicVolume}
            onChange={handleBgMusicVolumeChange}
          />
          <span className="volume-label">{Math.round(bgMusicVolume)}%</span>
        </div>

        <div className="settings-row">                                 {/* Background music selection */}
          <label htmlFor="bg-music-select">Background Music</label>
          <select 
            id="bg-music-select" 
            className="music-select"
            value={settings.bgMusic}
            onChange={handleBgMusicChange}
          >
            <option value="bloop-vibes.mp3">Bloop Vibes (Default)</option>
            <option value="gardens-stylish-chill.mp3">Gardens Style</option>
            <option value="sandbreaker.mp3">Sandbreaker</option>
            <option value="experimental-cinematic-hip-hop.mp3">Experimental Cinematic</option>
            <option value="tell-me-what.mp3">Tell Me What</option>
          </select>
        </div>

        <div className="settings-row">
          <label>Theme</label>                                   {/* Theme selection swatches */}
          <div className="theme-swatches">
            <div 
              className={`theme-swatch ${settings.theme === 'theme-default' ? 'active-theme' : ''}`}
              data-theme-value="theme-default" 
              style={{background: '#6b63ff'}}
              onClick={() => handleThemeChange('theme-default')}
              role="button"
              tabIndex={0}
              aria-label="Default theme"
            />
            <div 
              className={`theme-swatch ${settings.theme === 'theme-coral' ? 'active-theme' : ''}`}
              data-theme-value="theme-coral" 
              style={{background: '#e86b6b'}}
              onClick={() => handleThemeChange('theme-coral')}
              role="button"
              tabIndex={0}
              aria-label="Coral theme"
            />
            <div 
              className={`theme-swatch ${settings.theme === 'theme-pink' ? 'active-theme' : ''}`}
              data-theme-value="theme-pink" 
              style={{background: '#f07ad9'}}
              onClick={() => handleThemeChange('theme-pink')}
              role="button"
              tabIndex={0}
              aria-label="Pink theme"
            />
            <div 
              className={`theme-swatch ${settings.theme === 'theme-green' ? 'active-theme' : ''}`}
              data-theme-value="theme-green" 
              style={{background: '#59b89b'}}
              onClick={() => handleThemeChange('theme-green')}
              role="button"
              tabIndex={0}
              aria-label="Green theme"
            />
            <div 
              className={`theme-swatch ${settings.theme === 'theme-gray' ? 'active-theme' : ''}`}
              data-theme-value="theme-gray" 
              style={{background: '#9a9a9a'}}
              onClick={() => handleThemeChange('theme-gray')}
              role="button"
              tabIndex={0}
              aria-label="Gray theme"
            />
            <div 
              className={`theme-swatch ${settings.theme === 'theme-custom' ? 'active-theme' : ''}`}
              data-theme-value="theme-custom"
              id="theme-swatch-custom"
              style={{background: settings.theme === 'theme-custom' ? customColor : 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)'}}
              onClick={handleCustomSwatchClick}
              role="button"
              tabIndex={0}
              aria-label="Custom theme"
            >
              <input 
                id="theme-custom-color" 
                type="color" 
                value={customColor}
                onChange={handleCustomColorChange}
                aria-label="Pick custom color"
              />
              <img 
                src="/assets/img/button-icons/color-picker.png" 
                className="swatch-icon" 
                alt="Pick color"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="settings-footer">
        <Button                                                       // Reset to default settings button
          className="reset-btn"
          onClick={handleResetDefaults}
          variant="icon"
        >
          Reset to Default
        </Button>
      </div>
    </main>
    </div>
  );
}
