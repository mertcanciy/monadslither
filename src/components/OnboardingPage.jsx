import React, { useState, useEffect } from 'react';
import { blockchainService } from '../services/blockchainService';

export default function OnboardingPage({ onStartGame }) {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isOnMonadTestnet, setIsOnMonadTestnet] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [playerRegistered, setPlayerRegistered] = useState(false);

  // Animation loop
  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      setAnimationTime((Date.now() - startTime) / 1000);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  // Listen for network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleNetworkChange = async () => {
        console.log('Network changed, checking status...');
        try {
          const onMonadTestnet = await blockchainService.isOnMonadTestnet();
          setIsOnMonadTestnet(onMonadTestnet);
          console.log('Updated network status:', onMonadTestnet);
        } catch (error) {
          console.error('Error checking network after change:', error);
        }
      };

      window.ethereum.on('chainChanged', handleNetworkChange);
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleNetworkChange);
      };
    }
  }, []);



  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleStartGame();
    }
  };

  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    
    try {
      // Initialize blockchain service
      const result = await blockchainService.initialize();
      console.log('Blockchain service result:', result);
      console.log('Address type:', typeof result.address);
      console.log('Address value:', result.address);
      setWalletAddress(result.address);
      setWalletConnected(true);
      
      // Check if on Monad testnet
      const onMonadTestnet = await blockchainService.isOnMonadTestnet();
      setIsOnMonadTestnet(onMonadTestnet);
      
      // If not on Monad testnet, prompt to switch
      if (!onMonadTestnet) {
        const shouldSwitch = window.confirm(
          'MonadSlither works best on Monad testnet! Would you like to switch to Monad testnet for bonus points?'
        );
        
        if (shouldSwitch) {
          try {
            await blockchainService.switchToMonadTestnet();
            
            // Wait a moment for the switch to complete
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Re-check network status
            const newNetworkStatus = await blockchainService.isOnMonadTestnet();
            setIsOnMonadTestnet(newNetworkStatus);
            
            if (newNetworkStatus) {
              console.log('Successfully switched to Monad testnet');
            } else {
              console.log('Network switch may not have completed');
            }
          } catch (error) {
            console.error('Failed to switch network:', error);
            alert('Failed to switch to Monad testnet. Please add it manually:\n\nNetwork Name: Monad Testnet\nRPC URL: https://testnet-rpc.monad.xyz\nChain ID: 10143\nCurrency: MON\nBlock Explorer: https://testnet.monadexplorer.com');
          }
        }
      }
      
      // Check if player is already registered
      try {
        const stats = await blockchainService.getPlayerStats(result.address);
        if (stats.isRegistered || stats.totalSessions > 0) {
          setPlayerRegistered(true);
        }
      } catch (error) {
        // Player not registered yet
        console.log('Player not registered yet:', error.message);
      }
      
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleRegisterPlayer = async () => {
    if (!nickname.trim()) {
      alert('Please enter a nickname');
      return;
    }
    
    setIsRegistering(true);
    
    try {
      await blockchainService.registerPlayer(nickname.trim());
      setPlayerRegistered(true);
      alert('Successfully registered on Monad testnet!');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show more specific error messages
      if (error.message.includes('not deployed')) {
        alert('Smart contract not deployed. Please run: npx hardhat run scripts/deploy-and-setup.js --network monadTestnet');
      } else if (error.message.includes('Insufficient MON tokens')) {
        alert('You need MON testnet tokens. Get them from: https://faucet.monad.xyz');
      } else if (error.message.includes('user rejected')) {
        alert('Transaction was cancelled. Please try again.');
      } else {
        alert(`Registration failed: ${error.message}`);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleStartGame = () => {
    if (nickname.trim() && walletConnected) {
      setIsLoading(true);
      onStartGame(nickname.trim(), walletAddress);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #6A0DAD 0%, #8A2BE2 25%, #4169E1 50%, #00008B 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Flying cutlandak2.png background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Multiple flying cutlandak2 images */}
        {Array.from({ length: 8 }).map((_, i) => (
          <img
            key={i}
            src={`${process.env.PUBLIC_URL || ''}/images/cutlandak2.png`}
            alt="Flying Meme"
            style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              opacity: 0.3,
              transform: `translate(
                ${(i * 150 + animationTime * 50) % (window.innerWidth + 100)}px,
                ${Math.sin(animationTime * 0.5 + i) * 100 + 200}px
              ) rotate(${animationTime * 20 + i * 45}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
        ))}
      </div>
      
      {/* Animated background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at ${20 + Math.sin(animationTime * 0.3) * 10}% ${80 + Math.cos(animationTime * 0.2) * 10}%, rgba(138, 43, 226, 0.4) 0%, transparent 50%),
          radial-gradient(circle at ${80 + Math.cos(animationTime * 0.4) * 10}% ${20 + Math.sin(animationTime * 0.3) * 10}%, rgba(106, 13, 173, 0.4) 0%, transparent 50%),
          radial-gradient(circle at ${40 + Math.sin(animationTime * 0.5) * 15}% ${40 + Math.cos(animationTime * 0.4) * 15}%, rgba(65, 105, 225, 0.3) 0%, transparent 50%),
          radial-gradient(circle at ${90 + Math.cos(animationTime * 0.6) * 10}% ${90 + Math.sin(animationTime * 0.5) * 10}%, rgba(0, 0, 139, 0.3) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />
      
      {/* Floating geometric shapes */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Monad-style diamond shapes with inner squares */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`monad-diamond-${i}`}
            style={{
              position: 'absolute',
              width: '100px',
              height: '100px',
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              transform: `rotate(45deg) translate(
                ${(i * 200 + animationTime * 30) % (window.innerWidth + 150)}px,
                ${Math.sin(animationTime * 0.8 + i) * 150 + 100}px
              ) rotate(${animationTime * 10 + i * 60}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* Inner square */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '60px',
                height: '60px',
                background: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                transform: 'rotate(-45deg)'
              }}
            />
          </div>
        ))}
        
        {/* Smaller Monad-style diamonds */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`small-monad-diamond-${i}`}
            style={{
              position: 'absolute',
              width: '70px',
              height: '70px',
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '15px',
              transform: `rotate(45deg) translate(
                ${(i * 250 + animationTime * 35) % (window.innerWidth + 120)}px,
                ${Math.cos(animationTime * 0.9 + i) * 180 + 120}px
              ) rotate(${animationTime * 8 + i * 45}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* Inner square */}
            <div
              style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                width: '40px',
                height: '40px',
                background: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                transform: 'rotate(-45deg)'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Subtle vertical accent bar */}
      <div style={{
        position: 'absolute',
        right: '10%',
        top: 0,
        width: '2px',
        height: '100%',
        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)',
        pointerEvents: 'none'
      }} />
      
      {/* Main content container */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        maxWidth: '500px',
        padding: '40px'
      }}>
        {/* Monad Logo */}
        <div style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src={`${process.env.PUBLIC_URL || ''}/images/monad-logo.png`} 
            alt="Monad Logo"
            style={{
              width: '120px',
              height: '120px',
              filter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3))'
            }}
          />
        </div>
        
        {/* Game Title with Snake Memes */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          {/* Left Snake */}
          <img 
            src={`${process.env.PUBLIC_URL || ''}/images/snakeNad.png`} 
            alt="Sad Frog Snake"
            style={{
              width: '120px',
              height: '120px',
              marginRight: '20px',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
              transform: `translateY(${Math.sin(animationTime * 2) * 10}px) rotate(${Math.sin(animationTime * 1.5) * 5}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          {/* Title */}
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            margin: 0,
            letterSpacing: '2px',
            transform: `translateY(${Math.sin(animationTime * 1.8) * 5}px)`,
            transition: 'transform 0.1s ease-out'
          }}>
            MonadSlither
          </h1>
          
          {/* Right Snake */}
          <img 
            src={`${process.env.PUBLIC_URL || ''}/images/snakeNad.png`} 
            alt="Sad Frog Snake"
            style={{
              width: '120px',
              height: '120px',
              marginLeft: '20px',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
              transform: `scaleX(-1) translateY(${Math.sin(animationTime * 2 + Math.PI) * 10}px) rotate(${Math.sin(animationTime * 1.5 + Math.PI) * 5}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
        </div>
        
        {/* Subtitle */}
        <p style={{
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '50px',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          fontWeight: '300'
        }}>
          Multiplayer Snake Game
        </p>
        
                    {/* Wallet Connection Section */}
            {!walletConnected ? (
              <div style={{
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnectingWallet}
                  style={{
                    width: '350px',
                    padding: '18px 25px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, #836EF9 0%, #200052 100%)',
                    color: 'white',
                    cursor: isConnectingWallet ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isConnectingWallet) {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  {isConnectingWallet ? 'Connecting Wallet...' : 'Connect Wallet'}
                </button>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '15px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                  Connect your wallet to play MonadSlither
                </p>
                <button
                  onClick={() => {
                    const networkInfo = `Network Name: Monad Testnet\nRPC URL: https://testnet-rpc.monad.xyz\nChain ID: 10143\nCurrency: MON\nBlock Explorer: https://testnet.monadexplorer.com`;
                    alert(`Add Monad Testnet to MetaMask manually:\n\n${networkInfo}\n\nFollow the guide at: https://docs.monad.xyz/guides/add-monad-to-wallet/metamask`);
                  }}
                  style={{
                    width: '350px',
                    padding: '10px 25px',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    background: 'transparent',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    marginTop: '10px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Manual Network Setup
                </button>
              </div>
        ) : (
          <>
            {/* Connected Wallet Info */}
            {walletAddress && (
              <div style={{
                marginBottom: '20px',
                padding: '15px 25px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '0 0 5px 0'
                }}>
                  Wallet Connected
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: '0 0 5px 0',
                  fontFamily: 'monospace'
                }}>
                  {typeof walletAddress === 'string' 
                    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : String(walletAddress || 'Unknown')
                  }
                </p>
                <p style={{
                  fontSize: '12px',
                  color: isOnMonadTestnet ? '#4CAF50' : '#FF9800',
                  margin: 0,
                  fontWeight: 'bold'
                }}>
                  {isOnMonadTestnet ? '✓ Monad Testnet' : '⚠ Different Network'}
                </p>
              </div>
            )}
            
            {/* Player Registration */}
            {!playerRegistered ? (
              <div style={{
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <button
                  onClick={handleRegisterPlayer}
                  disabled={isRegistering || !nickname.trim()}
                  style={{
                    width: '350px',
                    padding: '15px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '25px',
                    background: nickname.trim() && !isRegistering 
                      ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                      : 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    cursor: nickname.trim() && !isRegistering ? 'pointer' : 'not-allowed',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {isRegistering ? 'Registering...' : 'Register on Monad Testnet'}
                </button>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '10px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                  Register to earn bonus points and track your progress
                </p>
              </div>
            ) : (
              <div style={{
                marginBottom: '20px',
                padding: '10px 25px',
                background: 'rgba(76, 175, 80, 0.2)',
                borderRadius: '15px',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#4CAF50',
                  margin: 0,
                  fontWeight: 'bold'
                }}>
                  ✓ Already Registered on Monad Testnet
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: '5px 0 0 0'
                }}>
                  Just enter your nickname to start playing!
                </p>
              </div>
            )}
            
            {/* Nickname Input */}
            <div style={{
              marginBottom: '30px',
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: '350px',
                  padding: '18px 25px',
                  fontSize: '18px',
                  border: 'none',
                  borderRadius: '30px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#2C3E50',
                  outline: 'none',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
                }}
              />
            </div>
            
            {/* Play Online Button */}
            <button
              onClick={handleStartGame}
              disabled={!nickname.trim() || isLoading}
              style={{
                width: '350px',
                padding: '18px 25px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '30px',
                background: nickname.trim()
                  ? '#a0055d' 
                  : 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                cursor: nickname.trim() ? 'pointer' : 'not-allowed',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                if (nickname.trim()) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
              }}
            >
              {isLoading ? 'Connecting...' : 'Play Online'}
            </button>
            
            {/* Registration encouragement for unregistered users */}
            {!playerRegistered && nickname.trim() && (
              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: '10px',
                textAlign: 'center',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}>
                💡 Tip: Register on Monad testnet above to earn bonus points and track your progress!
              </p>
            )}
          </>
        )}
        
        {/* Instructions */}
        <div style={{
          marginTop: '50px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          {/* <p style={{ margin: '8px 0' }}>• Use Arrow Keys to move</p>
          <p style={{ margin: '8px 0' }}>• Hold Spacebar to boost</p>
          <p style={{ margin: '8px 0' }}>• Collect orbs to grow and score</p>
          <p style={{ margin: '8px 0' }}>• Avoid hitting other snakes</p> */}
        </div>
      </div>
    </div>
  );
} 