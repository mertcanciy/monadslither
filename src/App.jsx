import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Leaderboard from './components/Leaderboard';
import Controls from './components/Controls';
import MultiplayerCursors from './components/MultiplayerCursors';
import ConnectionStatus from './components/ConnectionStatus';
import OnboardingPage from './components/OnboardingPage';
import DeathScreen from './components/DeathScreen';
import OrbGuide from './components/OrbGuide';
import Profile from './components/Profile';
import { gameManager } from './multisynq/GameSession';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [deathData, setDeathData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  const startGame = async (playerNickname, walletAddress) => {
    setNickname(playerNickname);
    setWalletAddress(walletAddress);
    setShowOnboarding(false);
    setIsLoading(true);
    setError(null);
    setDeathData(null);

    try {
      // Wait for Multisynq to load
      const waitForMultisynq = () => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds
          
          const checkMultisynq = () => {
            attempts++;
            console.log(`Checking for Multisynq (attempt ${attempts}/${maxAttempts})`);
            
            if (window.Multisynq) {
              console.log('Multisynq found:', window.Multisynq);
              resolve(window.Multisynq);
            } else if (attempts >= maxAttempts) {
              reject(new Error('Multisynq library failed to load after 5 seconds'));
            } else {
              setTimeout(checkMultisynq, 100);
            }
          };
          
          checkMultisynq();
        });
      };

      // Wait for Multisynq to load
      await waitForMultisynq();

      // Set up game state update handler
      gameManager.onStateUpdate = (newState) => {
        console.log('App: Received game state update:', newState);
        setGameState(newState);
        setIsConnected(true);
        setIsLoading(false);
        
        // Handle death data
        if (newState.playerDeath) {
          setDeathData(newState.playerDeath);
        } else if (deathData) {
          // Clear death data if it's no longer in the state
          setDeathData(null);
        }
      };

      // Join the game session
      await gameManager.joinSession({
        apiKey: '2BrMN4kx8TdrKJX9jABI245IUzt9hZMSBoC67eWHcw',
        password: 'monadslither-game',
        nickname: playerNickname,
        walletAddress: walletAddress
      });
      
      // Expose gameManager to window for debugging
      window.gameManager = gameManager;
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setError(`Failed to initialize game: ${error.message}`);
      setIsLoading(false);
      setShowOnboarding(true); // Go back to onboarding on error
    }
  };

  const handleRejoin = () => {
    console.log('Rejoining game...');
    
    // Clear death data
    setDeathData(null);
    
    // Call the gameManager's rejoin method
    if (gameManager) {
      gameManager.rejoin();
    }
    
    // Small delay to show the rejoin process
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleDirection = (dir) => {
    if (isConnected && !deathData?.isDead) {
      gameManager.sendDirection(dir);
    }
  };

  const handleBoost = (boost) => {
    if (isConnected && !deathData?.isDead) {
      gameManager.sendBoost(boost);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gameManager.leaveSession();
    };
  }, []);

  // Show onboarding page
  if (showOnboarding) {
    return <OnboardingPage onStartGame={startGame} />;
  }

  // Show profile page
  if (showProfile) {
    return <Profile walletAddress={walletAddress} onBack={() => setShowProfile(false)} />;
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'red',
        textAlign: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
      }}>
        <div>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => setShowOnboarding(true)}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              background: '#27AE60',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>Connecting to game as "{nickname}"...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden',
      background: '#1a1a1a',
      margin: 0,
      padding: 0
    }}>
      <GameBoard gameState={gameState} />
      <Leaderboard leaderboard={gameState?.leaderboard || []} />
      <Controls onDirection={handleDirection} onBoost={handleBoost} />
      <MultiplayerCursors gameState={gameState} />
      <OrbGuide gameState={gameState} />
      
      {/* Connection Status */}
      <ConnectionStatus 
        isConnected={isConnected}
        playerId={playerId}
        playerCount={gameState?.playerCount || 0}
        nickname={nickname}
        gameState={gameState}
        onShowProfile={() => setShowProfile(true)}
      />
      
      {/* Death Screen */}
      <DeathScreen 
        onRejoin={handleRejoin}
        deathData={deathData}
      />
      
      
    </div>
  );
} 