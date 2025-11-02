/**
 * @fileoverview Main application component with routing and context providers.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { SettingsProvider } from './context/SettingsContext';
import BackgroundMusicManager from './components/BackgroundMusicManager';

// Pages
import ConsentPage from './pages/ConsentPage/ConsentPage';
import StartScreen from './pages/StartScreen/StartScreen';
import LobbySettings from './pages/LobbySettings/LobbySettings';
import TruthInputs from './pages/TruthInputs/TruthInputs';
import LoadingScreen from './pages/LoadingScreen/LoadingScreen';
import RoundScreen from './pages/RoundScreen/RoundScreen';
import RoundLeaderboard from './pages/Leaderboard/RoundLeaderboard';
import FinalLeaderboard from './pages/Leaderboard/FinalLeaderboard';
import HowToPlay from './pages/HowToPlay/HowToPlay';
import AboutGame from './pages/AboutGame/AboutGame';
import AboutUs from './pages/AboutUs/AboutUs';
import SettingsPage from './pages/SettingsPage/SettingsPage';

const LAST_ROUTE_KEY = '2tai_last_route';
const SESSION_ACTIVE_KEY = '2tai_session_active';

// Component to track and restore last route
function RouteTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameState } = useGame();

  // Mark session as active when app loads
  useEffect(() => {
    sessionStorage.setItem(SESSION_ACTIVE_KEY, 'true');
  }, []);

  // Save current route to sessionStorage whenever it changes
  useEffect(() => {
    if (location.pathname !== '/') {
      sessionStorage.setItem(LAST_ROUTE_KEY, location.pathname);
    }
  }, [location.pathname]);

  // On initial mount, restore last route only if this is a page refresh (session is active)
  useEffect(() => {
    // Check if this is a page refresh or a new session
    const isPageRefresh = sessionStorage.getItem(SESSION_ACTIVE_KEY) === 'true';

    // If consent was already given and user is on the start screen, restore last route
    if (gameState.consentGiven && location.pathname === '/start' && isPageRefresh) {
      const lastRoute = sessionStorage.getItem(LAST_ROUTE_KEY);
      if (lastRoute && lastRoute !== '/start') {
        navigate(lastRoute, { replace: true });
      }
    }
  }, [gameState.consentGiven, location.pathname, navigate]);

  return null;
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { gameState } = useGame();
  
  if (!gameState.consentGiven) {
    // Redirect unconsented users to the start screen which will present the consent modal
    return <Navigate to="/start" replace />;
  }
  
  return children;
}

// Main App component with routing
function AppRoutes() {
  return (
    <>
      <RouteTracker />
      <Routes>
        {/* Default route -> start screen (start screen will show consent modal when needed) */}
        <Route path="/" element={<Navigate to="/start" replace />} />

        {/* Start screen is intentionally NOT protected so users can see it and accept consent */}
        <Route path="/start" element={<StartScreen />} />
      
      <Route path="/lobby" element={
        <ProtectedRoute>
          <LobbySettings />
        </ProtectedRoute>
      } />
      
      <Route path="/truth-inputs" element={
        <ProtectedRoute>
          <TruthInputs />
        </ProtectedRoute>
      } />
      
      <Route path="/loading" element={
        <ProtectedRoute>
          <LoadingScreen />
        </ProtectedRoute>
      } />
      
      <Route path="/round" element={
        <ProtectedRoute>
          <RoundScreen />
        </ProtectedRoute>
      } />
      
      <Route path="/round-leaderboard" element={
        <ProtectedRoute>
          <RoundLeaderboard />
        </ProtectedRoute>
      } />
      
      <Route path="/final-leaderboard" element={
        <ProtectedRoute>
          <FinalLeaderboard />
        </ProtectedRoute>
      } />
      
      {/* Info pages */}
      <Route path="/how-to-play" element={
        <ProtectedRoute>
          <HowToPlay />
        </ProtectedRoute>
      } />
      
      <Route path="/about-game" element={
        <ProtectedRoute>
          <AboutGame />
        </ProtectedRoute>
      } />
      
      <Route path="/about-us" element={
        <ProtectedRoute>
          <AboutUs />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      
      {/* Catch all - redirect to consent */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

// Main App component
function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <SettingsProvider>
        <GameProvider>
          <BackgroundMusicManager />
          <AppRoutes />
        </GameProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
