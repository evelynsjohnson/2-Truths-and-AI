/**
 * @fileoverview Context for managing application settings like theme and sound preferences.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext();

// Initialize default settings
const defaultSettings = {
  theme: 'theme-default',
  bgMusic: 'bloop-vibes.mp3',
  masterVolume: 0.2,
  bgMusicVolume: 0.2,
  sfxVolume: 0.2,
  sfxEnabled: true,
  sfxFile: 'button-click.mp3',
  // sensible defaults for custom theme values
  customPrimary: '#6b63ff',
  customSecondary: '#3b34d1',
  customSecondaryHover: '#5048e5'
};

// Predefined theme color definitions
const themeDefs = {
  'theme-default': { primary: '#6b63ff', secondary: '#3b34d1', secondaryHover: '#5048e5', bg: '#0d0d0d' },
  'theme-coral': { primary: '#e86b6b', secondary: '#d9534f', secondaryHover: '#f08a84', bg: '#0d0d0d' },
  'theme-pink': { primary: '#f07ad9', secondary: '#d94ec9', secondaryHover: '#f59fe0', bg: '#0d0d0d' },
  'theme-green': { primary: '#59b89b', secondary: '#48a17f', secondaryHover: '#6fc2a9', bg: '#0d0d0d' },
  'theme-gray': { primary: '#9a9a9a', secondary: '#7f7f7f', secondaryHover: '#a9a9a9', bg: '#0d0d0d' }
};

export function SettingsProvider({ children }) {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [settings]);

  // Function to apply the selected theme - wrapped in useCallback to prevent infinite loops
  const applyTheme = useCallback((theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'theme-custom') {
      // Custom theme implementation
      const primary = settings.customPrimary || defaultSettings.customPrimary;
      const secondary = settings.customSecondary || defaultSettings.customSecondary;
      const secondaryHover = settings.customSecondaryHover || defaultSettings.customSecondaryHover;
      document.documentElement.style.setProperty('--primary', primary);
      document.documentElement.style.setProperty('--secondary', secondary);
      document.documentElement.style.setProperty('--secondary-hover', secondaryHover);
    } else {
      const def = themeDefs[theme];
      if (def) {
        document.documentElement.style.setProperty('--primary', def.primary);
        document.documentElement.style.setProperty('--secondary', def.secondary);
        document.documentElement.style.setProperty('--secondary-hover', def.secondaryHover);
        document.documentElement.style.setProperty('--bg', def.bg);
      }
    }
  }, [settings.customPrimary, settings.customSecondary, settings.customSecondaryHover]);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme, applyTheme]);

  // Function to update settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Function to reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook to use the SettingsContext
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
