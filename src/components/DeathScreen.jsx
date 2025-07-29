import React, { useState, useEffect } from 'react';

export default function DeathScreen({ onRejoin, deathData }) {
  const [showScreen, setShowScreen] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (deathData && deathData.isDead) {
      setShowScreen(true);
      setAnimationPhase(0);
      
      // Animate the death screen
      const timer1 = setTimeout(() => setAnimationPhase(1), 500);
      const timer2 = setTimeout(() => setAnimationPhase(2), 1000);
      const timer3 = setTimeout(() => setAnimationPhase(3), 1500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setShowScreen(false);
    }
  }, [deathData]);

  if (!showScreen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: `url('/images/cutlandak2.png') center center / cover`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Dark overlay for better text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: -1
      }} />
      {/* Death Animation */}
      <div style={{
        fontSize: animationPhase >= 1 ? '120px' : '60px',
        fontWeight: 'bold',
        color: animationPhase >= 2 ? '#ff4444' : '#ffffff',
        textShadow: animationPhase >= 2 ? '0 0 20px #ff4444' : 'none',
        transition: 'all 0.5s ease-in-out',
        transform: animationPhase >= 3 ? 'scale(1.1)' : 'scale(1)',
        marginBottom: '20px'
      }}>
        {animationPhase >= 1 ? 'YOU\'RE DEAD!' : 'DEAD'}
      </div>
      
      {/* Death Details */}
      {animationPhase >= 2 && (
        <div style={{
          fontSize: '24px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div>Score: {deathData?.score || 0}</div>
          {deathData?.killedBy && (
            <div style={{ fontSize: '18px', color: '#ccc', marginTop: '10px' }}>
              Killed by: {deathData.killedBy}
            </div>
          )}
          <div style={{ fontSize: '16px', color: '#aaa', marginTop: '10px' }}>
            Lower score = you die first!
          </div>
        </div>
      )}
      
      {/* Rejoin Button */}
      {animationPhase >= 3 && (
        <button
          onClick={onRejoin}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#ff6666';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#ff4444';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Rejoin Game
        </button>
      )}
      
      {/* Death Particles Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: '#ff4444',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle ${2 + Math.random() * 2}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <style>{`
        @keyframes particle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
} 