import React, { useState, useEffect } from 'react';
import { blockchainService } from '../services/blockchainService';

const Profile = ({ walletAddress, onBack }) => {
  const [playerStats, setPlayerStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animationTime, setAnimationTime] = useState(0);

  // Animation loop
  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      setAnimationTime((Date.now() - startTime) / 1000);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      loadPlayerData();
      
      // Set up auto-refresh every 30 seconds
      const refreshInterval = setInterval(() => {
        loadPlayerData();
      }, 30000);
      
      // Set up global callback for manual refresh
      window.profileRefreshCallback = loadPlayerData;
      
      return () => {
        clearInterval(refreshInterval);
        delete window.profileRefreshCallback;
      };
    }
  }, [walletAddress]);

  const loadPlayerData = async () => {
    console.log('🔄 loadPlayerData called for wallet:', walletAddress);
    setLoading(true);
    setError(null);
    try {
      // Initialize blockchain service if not already done
      if (!blockchainService.isConnected) {
        console.log('🔗 Initializing blockchain service...');
        await blockchainService.initialize();
      }

      // Load player stats
      console.log('📊 Fetching player stats from blockchain...');
      const stats = await blockchainService.getPlayerStats(walletAddress);
      console.log('✅ Player stats loaded:', stats);
      setPlayerStats(stats);

      // Load achievements (handle gracefully if method doesn't exist)
      try {
        console.log('🏆 Fetching achievements...');
        const playerAchievements = await blockchainService.getPlayerAchievements(walletAddress);
        console.log('✅ Achievements loaded:', playerAchievements);
        setAchievements(playerAchievements || []);
      } catch (err) {
        console.log('⚠️ Achievements not available:', err);
        setAchievements([]);
      }

      // Load recent sessions (handle gracefully if method doesn't exist)
      try {
        console.log('📈 Fetching player sessions...');
        const playerSessions = await blockchainService.getPlayerSessions(walletAddress);
        console.log('✅ Sessions loaded:', playerSessions);
        setSessions((playerSessions || []).slice(0, 10));
      } catch (err) {
        console.log('⚠️ Sessions not available:', err);
        setSessions([]);
      }
    } catch (err) {
      console.error('❌ Error loading player data:', err);
      setError('Failed to load player data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    // Handle BigInt and regular numbers
    const safeTimestamp = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    return new Date(safeTimestamp * 1000).toLocaleDateString();
  };

  const getAchievementIcon = (achievementType) => {
    const icons = {
      'FIRST_SESSION': '🎮',
      'FIVE_SESSIONS': '🔥',
      'TEN_SESSIONS': '⚡',
      'TWENTY_SESSIONS': '🏆',
      'HIGH_SCORE': '⭐',
      'DAILY_STREAK': '📅',
      'ORB_MASTER': '💎'
    };
    return icons[achievementType] || '🏅';
  };

  if (loading) {
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
        
        <div style={{
          textAlign: 'center',
          color: 'white',
          zIndex: 1
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Loading Profile...</h2>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </div>
    );
  }

  if (error) {
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
        
        <div style={{
          textAlign: 'center',
          color: 'white',
          zIndex: 1,
          maxWidth: '600px',
          padding: '20px'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Player Profile</h2>
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: 'rgba(255, 0, 0, 0.2)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 0, 0, 0.3)'
          }}>
            <p style={{ margin: 0, color: '#ff6b6b' }}>{error}</p>
          </div>
          <button
            onClick={loadPlayerData}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Retry
          </button>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
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
      background: 'linear-gradient(135deg, #6A0DAD 0%, #8A2BE2 25%, #4169E1 50%, #00008B 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      {/* Animated background pattern */}
      <div style={{
        position: 'fixed',
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

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px',
        color: 'white',
        zIndex: 1
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '20px'
          }}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Player Profile</h1>
        <button
          onClick={loadPlayerData}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginLeft: 'auto'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '0 20px 20px 20px',
        zIndex: 1,
        overflow: 'auto'
      }}>
        {/* Player Info */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: '#4a90e2', margin: '0 0 15px 0', fontSize: '20px' }}>Player Info</h3>
          <div style={{ color: 'white' }}>
            <p style={{ margin: '8px 0', fontSize: '16px' }}>
              <strong>Wallet:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <p style={{ margin: '8px 0', fontSize: '16px' }}>
              <strong>Registered:</strong> {playerStats?.registrationDate ? formatDate(playerStats.registrationDate) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: '#4a90e2', margin: '0 0 15px 0', fontSize: '20px' }}>Statistics</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            {[
              { label: 'Total Sessions', value: playerStats?.totalSessions || 0 },
              { label: 'Total Score', value: playerStats?.totalScore || 0 },
              { label: 'Consecutive Sessions', value: playerStats?.consecutiveSessions || 0 },
              { label: 'Highest Score', value: playerStats?.highestScore || 0 },
              { label: 'Total Kills', value: playerStats?.totalKills || 0 },
              { label: 'Orbs Collected', value: playerStats?.totalOrbsCollected || 0 },
              { label: 'Total Play Time', value: `${playerStats?.totalPlayTime || 0}s` }
            ].map((stat, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '15px',
                background: 'rgba(74, 144, 226, 0.2)',
                borderRadius: '10px',
                border: '1px solid rgba(74, 144, 226, 0.3)'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#4a90e2',
                  marginBottom: '5px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: '#4a90e2', margin: '0 0 15px 0', fontSize: '20px' }}>
            Achievements ({achievements.length})
          </h3>
          {achievements.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {achievements.map((achievement, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  background: 'rgba(255, 215, 0, 0.1)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}>
                  <div style={{ fontSize: '24px' }}>
                    {getAchievementIcon(achievement.type)}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      marginBottom: '5px',
                      color: 'white'
                    }}>
                      {achievement.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      {formatDate(achievement.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              fontStyle: 'italic',
              padding: '20px'
            }}>
              No achievements yet. Keep playing to unlock them!
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: '#4a90e2', margin: '0 0 15px 0', fontSize: '20px' }}>Recent Sessions</h3>
          {sessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {sessions.map((session, index) => (
                <div key={index} style={{
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '14px' }}>
                      {formatDate(session.timestamp)}
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#4a90e2',
                      fontSize: '16px'
                    }}>
                      Score: {session.score}
                    </div>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '10px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Duration:</span> {formatDuration(session.duration)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Orbs:</span> {session.orbCount}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Dynamic Score:</span> {session.dynamicScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              fontStyle: 'italic',
              padding: '20px'
            }}>
              No sessions recorded yet. Play a game to see your sessions here!
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Profile; 