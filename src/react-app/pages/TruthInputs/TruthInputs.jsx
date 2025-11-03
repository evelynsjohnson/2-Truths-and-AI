/**
 * @fileoverview TruthInputs component for collecting player names and truths before starting the game.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import Button from '../../components/Button/Button';
import './TruthInputs.css';

export default function TruthInputs() {
  const navigate = useNavigate();
  const { gameState, updatePlayerName, updateGameState } = useGame();
  const { playClick } = useSoundEffect();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  // store per-player data including name, chosen icon index, and an object of sets
  // Initialize from localStorage if available
  const [playerData, setPlayerData] = useState(() => {
    try {
      const saved = localStorage.getItem('truthInputsPlayerData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading player data from localStorage:', error);
    }
    return {};
  });
  const [currentSet, setCurrentSet] = useState(1);
  const [showThankYou, setShowThankYou] = useState(false);
  const [exportedJsonUrl, setExportedJsonUrl] = useState(null);
  const [availableIcons, setAvailableIcons] = useState([]);
  const [iconIndex, setIconIndex] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const demoRef = React.useRef(null);

  // Get the current player based on index
  const currentPlayer = gameState.players[currentPlayerIndex];


  // If no players are configured, redirect back to lobby to set them up
  useEffect(() => {
    if (!currentPlayer) {
      navigate('/lobby');
    }
  }, [currentPlayer, navigate]);

  // Save playerData to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('truthInputsPlayerData', JSON.stringify(playerData));
    } catch (error) {
      console.error('Error saving player data to localStorage:', error);
    }
  }, [playerData]);

  // Probe the public tamagotchi icons to build a list of available image URLs
  useEffect(() => {
    let mounted = true;
    const maxProbe = 20; // check up to 20 filenames tamagotchi-01..-20
    const probes = [];
    for (let i = 1; i <= maxProbe; i++) {
      const idx = String(i).padStart(2, '0');
      const url = `/assets/img/player-icons/tamagotchis/tamagotchi-${idx}.png`;
      probes.push(new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ ok: true, url });
        img.onerror = () => resolve({ ok: false });
        img.src = url;
      }));
    }

    Promise.all(probes).then(results => {
      if (!mounted) return;
      const found = results.filter(r => r.ok).map(r => r.url);
      setAvailableIcons(found);
      // initialize icon index for current player if unset
      setIconIndex(0);
    });

    return () => { mounted = false; };
  }, []);


  // Handle input changes for name and truths
  const handleInputChange = (field, value) => {
    // Capitalize first letter of name
    let processedValue = value;
    if (field === 'name' && value.length > 0) {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    setPlayerData({
      ...playerData,
      [currentPlayer.id]: {
        ...playerData[currentPlayer.id],
        [field]: processedValue
      }
    });
    
    // If it's a name field, also update the game state
    if (field === 'name') {
      updatePlayerName(currentPlayer.id, processedValue);
    }
  };

    // handle truth fields per set
    const handleSetFieldChange = (setNumber, field, value) => {
      setPlayerData({
        ...playerData,
        [currentPlayer.id]: {
          ...playerData[currentPlayer.id],
          sets: {
            ...(playerData[currentPlayer.id]?.sets || {}),
            [setNumber]: {
              ...(playerData[currentPlayer.id]?.sets?.[setNumber] || {}),
              [field]: value
            }
          }
        }
      });
    };
  
    // When currentPlayer changes, restore their saved icon (if any) and set iconIndex for preview
    useEffect(() => {
      if (!currentPlayer || availableIcons.length === 0) return;
      
      // Compute available icons for this player (excluding ones taken by others)
      const taken = new Set(Object.entries(playerData)
        .filter(([id, pdata]) => Number(id) !== currentPlayer.id && pdata?.icon)
        .map(([id, pdata]) => pdata.icon)
      );
      const avail = availableIcons.filter(u => !taken.has(u));
      
      const savedUrl = playerData[currentPlayer.id]?.icon;
      if (savedUrl && avail.includes(savedUrl)) {
        // Player has a saved icon and it's still available
        const idx = avail.indexOf(savedUrl);
        setIconIndex(idx);
      } else {
        // No saved icon or it's taken - assign first available and save it
        setIconIndex(0);
        if (avail.length > 0) {
          setPlayerData(prev => ({
            ...prev,
            [currentPlayer.id]: {
              ...prev[currentPlayer.id],
              icon: avail[0]
            }
          }));
        }
      }
    }, [currentPlayerIndex, availableIcons, currentPlayer]);

  // Proceed to next player or finish collecting truths
  const handleNext = () => {
    console.log("Proceeding to next player or finishing truths");
    console.log("Current player data:", playerData);
    console.log("Current player index:", currentPlayerIndex);
    console.log("Current player:", currentPlayer);
    console.log("Player data for current player:", playerData[currentPlayer?.id]);
    console.log("Total number of players:", gameState.players.length);
    if (currentPlayerIndex < gameState.players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setCurrentSet(1);
    } else {
      // All players done, prepare data and navigate to loading screen
      prepareGameData();
      // Clear the localStorage data since we're done collecting truths
      localStorage.removeItem('truthInputsPlayerData');
      setTimeout(() => navigate('/loading'), 600);
    }
  };

  // Check if current player's inputs are complete (ALL sets must be filled)
  const canProceed = () => {
    const data = playerData[currentPlayer?.id];
    if (!data?.name || !data?.icon) return false;
    
    // Check that ALL sets are completed
    for (let s = 1; s <= numSetsPerPlayer; s++) {
      const setData = data?.sets?.[s];
      if (!setData?.truth1 || !setData?.truth2) {
        return false;
      }
    }
    return true;
  };

  // Number of truth sets per player depends on lobby settings (numRounds and numPlayers)
  const numPlayers = gameState.players?.length || 0;
  const numRounds = (typeof gameState.numRounds === 'number') ? gameState.numRounds : null;
  const numSetsPerPlayer = (() => {
    if (numRounds && numPlayers) return Math.max(1, Math.ceil(numRounds / numPlayers));
    // fallback: if lobby provided truths per player in settings, use that
    if (gameState.numTruthsPerPlayer) return Math.max(1, Math.ceil(gameState.numTruthsPerPlayer / 2));
    return 1;
  })();

  // Compute available icons for the current player (exclude icons taken by other players)
  const takenIcons = new Set(Object.entries(playerData)
    .filter(([id, pdata]) => Number(id) !== currentPlayer?.id && pdata?.icon)
    .map(([id, pdata]) => pdata.icon)
  );
  const availableForCurrent = availableIcons.filter(u => !takenIcons.has(u));
  const chosenUrl = playerData[currentPlayer?.id]?.icon || (availableForCurrent.length > 0 ? availableForCurrent[0] : '/assets/img/player-icons/tamagotchis/tamagotchi-01.png');
  const displayIndex = availableForCurrent.indexOf(chosenUrl);
  const displayNum = displayIndex >= 0 ? displayIndex + 1 : 1;

  // Demo hover handlers
  const handleDemoEnter = () => {
    setDemoPlaying(true);
    try { demoRef.current?.play?.(); } catch (e) { }
  };
  const handleDemoLeave = () => {
    setDemoPlaying(false);
    try { demoRef.current?.pause?.(); demoRef.current.currentTime = 0; } catch (e) { }
  };

  // Get character counts for truth inputs
  const truth1Value = playerData[currentPlayer?.id]?.sets?.[currentSet]?.truth1 || '';
  const truth2Value = playerData[currentPlayer?.id]?.sets?.[currentSet]?.truth2 || '';
  const maxChars = 100;

  //Render the truth inputs form for the current player as designed in mockups
  // If no players exist we'll redirect; render below for normal flow
  return (
    <div className="stage">
      <div className="truth-inputs-layout">
        {/* Left Column */}
        <div className="left-column">
          <div className="player-header">
            <h1>Player {currentPlayerIndex + 1}</h1>
            <p>out of {gameState.players.length}</p>
          </div>

          {/* Help hover demo */}
          <div className="help-hover" onMouseEnter={handleDemoEnter} onMouseLeave={handleDemoLeave}>
            <div className="help-bubble">?</div>
            <div className="help-text">Unsure what to do? Hover Here!</div>
            <video 
              ref={demoRef} 
              className={`help-video ${demoPlaying ? 'visible' : ''}`} 
              src="/assets/mp4/truth-input-demo.mp4" 
              loop 
              muted 
              playsInline 
              preload="auto" 
            />
          </div>

          {/* Buttons */}
          <div className="left-buttons">
            <Button
              className="confirm-button"
              onClick={() => {
                // confirm this player's data, show thank you overlay, then advance
                setShowThankYou(true);
                // hide after 5s and advance
                setTimeout(() => {
                  setShowThankYou(false);
                  handleNext();
                }, 5000);
              }}
              disabled={!canProceed()}
            >
              Confirm!
            </Button>
            <Button
              variant="outline"
              className="back-link"
              onClick={() => {
                if (currentPlayerIndex > 0) {
                  setCurrentPlayerIndex(currentPlayerIndex - 1);
                  setCurrentSet(1);
                } else {
                  navigate('/lobby');
                }
              }}
            >
              {currentPlayerIndex === 0 ? 'Go back to Lobby Settings' : `Go back to Player ${currentPlayerIndex}'s Truths`}
            </Button>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Name and Icon Card */}
          <div className="input-card name-icon-card">
            <div className="name-section">
              <label htmlFor="player-name">Enter Your Player Name:</label>
              <input
                type="text"
                id="player-name"
                className="text-input"
                placeholder="Enter your name"
                value={playerData[currentPlayer.id]?.name || ''}
                onChange={(e) => {
                  handleInputChange('name', e.target.value);
                }}
              />
            </div>

            <div className="icon-selector-section">
              <div className="icon-arrows">
                <Button
                  className="icon-arrow"
                  onClick={() => {
                    const avail = availableForCurrent;
                    if (!avail || avail.length === 0) return;
                    const next = (iconIndex - 1 + avail.length) % avail.length;
                    const chosen = avail[next];
                    setIconIndex(next);
                    setPlayerData({
                      ...playerData,
                      [currentPlayer.id]: {
                        ...playerData[currentPlayer.id],
                        icon: chosen
                      }
                    });
                  }}
                  aria-label="Previous icon"
                >
                  &lt;
                </Button>

                <div className="icon-selector-box">
                  <img 
                    alt="player-icon-preview" 
                    src={chosenUrl} 
                    onError={(e) => { e.currentTarget.style.opacity = 0.25; }} 
                  />
                </div>

                <Button
                  className="icon-arrow"
                  onClick={() => {
                    const avail = availableForCurrent;
                    if (!avail || avail.length === 0) return;
                    const next = (iconIndex + 1) % avail.length;
                    const chosen = avail[next];
                    setIconIndex(next);
                    setPlayerData({
                      ...playerData,
                      [currentPlayer.id]: {
                        ...playerData[currentPlayer.id],
                        icon: chosen
                      }
                    });
                  }}
                  aria-label="Next icon"
                >
                  &gt;
                </Button>
              </div>
              <div className="icon-label">Choose Your Player Icon</div>
            </div>
          </div>

          {/* Truth Inputs Card */}
          <div className="input-card truth-card">
            <h3>Enter {currentSet === 1 ? '1st' : currentSet === 2 ? '2nd' : currentSet === 3 ? '3rd' : `${currentSet}th`} Truth Set</h3>

            <div className="truth-input-group">
              <label>Truth 1:</label>
              <div className="truth-textarea-wrapper">
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter your first truth..."
                  maxLength={maxChars}
                  value={truth1Value}
                  onChange={(e) => handleSetFieldChange(currentSet, 'truth1', e.target.value)}
                />
                <div className="char-counter">{truth1Value.length}/{maxChars} Characters</div>
              </div>
            </div>

            <div className="truth-input-group">
              <label>Truth 2:</label>
              <div className="truth-textarea-wrapper">
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter your second truth..."
                  maxLength={maxChars}
                  value={truth2Value}
                  onChange={(e) => handleSetFieldChange(currentSet, 'truth2', e.target.value)}
                />
                <div className="char-counter">{truth2Value.length}/{maxChars} Characters</div>
              </div>
            </div>

            <div className="set-controls">
              <Button
                className="set-nav-button"
                onClick={() => {
                  setCurrentSet(Math.max(1, currentSet - 1));
                }}
                disabled={currentSet <= 1}
              >
                &lt; Last Set
              </Button>

              <div className="set-pagination">
                {Array.from({ length: numSetsPerPlayer }, (_, i) => i + 1).map(setNum => (
                  <span
                    key={setNum}
                    className={`set-number ${setNum === currentSet ? 'active' : ''}`}
                    onClick={() => {
                      playClick();
                      setCurrentSet(setNum);
                    }}
                  >
                    {setNum}
                  </span>
                ))}
              </div>

              <Button
                className="set-nav-button"
                onClick={() => {
                  setCurrentSet(Math.min(numSetsPerPlayer, currentSet + 1));
                }}
                disabled={currentSet >= numSetsPerPlayer}
              >
                Next Set &gt;
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showThankYou && (
        <div className="thankyou-overlay">
          <div className="thankyou-card">
            <h1>Thank you {playerData[currentPlayer.id]?.name || `Player ${currentPlayerIndex + 1}`}!</h1>
            {currentPlayerIndex === gameState.players.length - 1 ? (
              <p>Uploading Truths...Please wait.</p>
            ) : (
              <p>Uploading Truths...Please pass the computer to the next Player!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // -- helper functions defined after return to keep structure clear --

  function prepareGameData() {
    // Build game data with all player truths organized by sets
    const updatedPlayers = gameState.players.map(player => {
      const pdata = playerData[player.id] || {};
      const sets = pdata.sets || {};
      
      // Collect all truth sets for this player
      const truthSets = [];
      for (let s = 1; s <= numSetsPerPlayer; s++) {
        const setObj = sets[s] || {};
        if (setObj.truth1 && setObj.truth2) {
          truthSets.push({
            setNumber: s,
            truth1: setObj.truth1,
            truth2: setObj.truth2
          });
        }
      }
      
      return {
        ...player,
        name: pdata.name || player.name,
        icon: pdata.icon || player.icon,
        truthSets: truthSets
      };
    });

    updateGameState({ 
      players: updatedPlayers,
      totalRounds: numSetsPerPlayer * gameState.players.length
    });
  }

}
