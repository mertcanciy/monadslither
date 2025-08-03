import React, { useState, useEffect, memo } from 'react';

const GameBoard = memo(function GameBoard({ gameState }) {
  // Always use full viewport dimensions, regardless of RTC connection status
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth || 1000, 
    height: window.innerHeight || 1000 
  });

  // Update dimensions when window resizes and ensure full viewport
  useEffect(() => {
    const updateDimensions = () => {
      const newWidth = window.innerWidth || document.documentElement.clientWidth || 1000;
      const newHeight = window.innerHeight || document.documentElement.clientHeight || 1000;
      
      setDimensions({
        width: newWidth,
        height: newHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    
    // Force update after a short delay to handle any RTC fallback issues
    setTimeout(updateDimensions, 100);
    setTimeout(updateDimensions, 500);
    
    // Listen for RTC errors and force full viewport
    const handleRtcError = () => {
      console.warn('RTC error detected, forcing full viewport dimensions');
      setDimensions({
        width: window.innerWidth || document.documentElement.clientWidth || 1000,
        height: window.innerHeight || document.documentElement.clientHeight || 1000
      });
    };
    
    // Listen for console errors that might indicate RTC issues
    const originalError = console.error;
    console.error = (...args) => {
      originalError.apply(console, args);
      if (args[0] && typeof args[0] === 'string' && args[0].includes('rtc')) {
        handleRtcError();
      }
    };
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      console.error = originalError;
    };
  }, []);

  // If we have a gameState but no snakes/orbs, show a waiting message
  if (gameState && (!gameState.snakes || Object.keys(gameState.snakes).length === 0)) {
    return (
      <svg 
        width="100%" 
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          zIndex: 0
        }}
      >
        <defs>
          <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6A0DAD" />
            <stop offset="25%" stopColor="#8A2BE2" />
            <stop offset="50%" stopColor="#4169E1" />
            <stop offset="100%" stopColor="#00008B" />
          </linearGradient>
        </defs>
        <rect
          x={0}
          y={0}
          width={dimensions.width}
          height={dimensions.height}
          fill="url(#backgroundGradient)"
        />
        <text x={dimensions.width / 2} y={dimensions.height / 2} textAnchor="middle" fill="white" fontSize="20">
          Waiting for players to join...
        </text>
        <text x={dimensions.width / 2} y={dimensions.height / 2 + 30} textAnchor="middle" fill="white" fontSize="16">
          Use arrow keys to move when the game starts
        </text>
      </svg>
    );
  }

  // If no gameState at all, show loading
  if (!gameState) {
    return (
      <svg 
        width="100%" 
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          zIndex: 0
        }}
      >
        <defs>
          <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6A0DAD" />
            <stop offset="25%" stopColor="#8A2BE2" />
            <stop offset="50%" stopColor="#4169E1" />
            <stop offset="100%" stopColor="#00008B" />
          </linearGradient>
        </defs>
        <rect
          x={0}
          y={0}
          width={dimensions.width}
          height={dimensions.height}
          fill="url(#backgroundGradient)"
        />
        <text x={dimensions.width / 2} y={dimensions.height / 2} textAnchor="middle" fill="white" fontSize="20">
          Loading game...
        </text>
      </svg>
    );
  }

  return (
    <svg 
      width="100%" 
      height="100%"
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        zIndex: 0
      }}
    >
      {/* Gradient background */}
      <defs>
        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBFAF9" />
          <stop offset="50%" stopColor="#836EF9" />
          <stop offset="100%" stopColor="#200052" />
        </linearGradient>
        
        {/* Glow effect for orbs */}
        <radialGradient id="orbGlow">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.3)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </radialGradient>
        
        {/* Animated glow for different orb types */}
        <radialGradient id="orbGlowHigh">
          <stop offset="0%" stopColor="rgba(255, 215, 0, 0.9)" />
          <stop offset="50%" stopColor="rgba(255, 215, 0, 0.4)" />
          <stop offset="100%" stopColor="rgba(255, 215, 0, 0)" />
        </radialGradient>
        
        <radialGradient id="orbGlowMedium">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.3)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </radialGradient>
        
        <radialGradient id="orbGlowLow">
          <stop offset="0%" stopColor="rgba(173, 216, 230, 0.7)" />
          <stop offset="50%" stopColor="rgba(173, 216, 230, 0.2)" />
          <stop offset="100%" stopColor="rgba(173, 216, 230, 0)" />
        </radialGradient>
        
        {/* Transparent gradient outlines for orbs */}
        <linearGradient id="orbOutlineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
          <stop offset="25%" stopColor="rgba(255, 255, 255, 0.4)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" />
          <stop offset="75%" stopColor="rgba(255, 255, 255, 0.4)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.8)" />
        </linearGradient>
        
        <linearGradient id="orbOutlineGradientHigh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 215, 0, 0.9)" />
          <stop offset="25%" stopColor="rgba(255, 215, 0, 0.5)" />
          <stop offset="50%" stopColor="rgba(255, 215, 0, 0.2)" />
          <stop offset="75%" stopColor="rgba(255, 215, 0, 0.5)" />
          <stop offset="100%" stopColor="rgba(255, 215, 0, 0.9)" />
        </linearGradient>
        
        <linearGradient id="orbOutlineGradientMonad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 215, 0, 1)" />
          <stop offset="25%" stopColor="rgba(255, 215, 0, 0.7)" />
          <stop offset="50%" stopColor="rgba(255, 215, 0, 0.3)" />
          <stop offset="75%" stopColor="rgba(255, 215, 0, 0.7)" />
          <stop offset="100%" stopColor="rgba(255, 215, 0, 1)" />
        </linearGradient>
      </defs>
      
      {/* Background rectangle with gradient */}
      <rect
        x={0}
        y={0}
        width={dimensions.width}
        height={dimensions.height}
        fill="url(#backgroundGradient)"
      />
      
      {/* Monad logo background pattern - simplified */}
      {(() => {
        const logoSize = 60;
        const spacing = 200;
        const cols = Math.ceil(dimensions.width / spacing);
        const rows = Math.ceil(dimensions.height / spacing);
        const totalLogos = Math.min(cols * rows, 20); // Limit to 20 logos max
        
        return Array.from({ length: totalLogos }).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          return (
            <image
              key={`monad-bg-${i}`}
              href={`${process.env.PUBLIC_URL || ''}/images/monad-logo.png`}
              x={col * spacing + spacing / 2}
              y={row * spacing + spacing / 2}
              width={logoSize}
              height={logoSize}
              opacity="0.1"
              transform={`rotate(${i * 30})`}
            />
          );
        });
      })()}
      
      {/* Render orbs */}
      {gameState.orbs?.map(orb => (
        <g key={orb.id}>
          <defs>
            <radialGradient id={`orbGradient${orb.id}`}>
              <stop offset="0%" stopColor={orb.color} />
              <stop offset="70%" stopColor={orb.color} />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
          </defs>
          
          {/* Glowing background circle - simplified */}
          <circle 
            cx={orb.x} 
            cy={orb.y} 
            r={orb.isMonadTeam ? 25 : (orb.value >= 6 ? 20 : 16)}
            fill={orb.isMonadTeam ? "url(#orbGlowHigh)" : (orb.value >= 8 ? "url(#orbGlowHigh)" : orb.value >= 5 ? "url(#orbGlowMedium)" : "url(#orbGlowLow)")}
            opacity="0.8"
            />
          
          {/* Main orb circle - simplified */}
          <circle 
            cx={orb.x} 
            cy={orb.y} 
            r={orb.isMonadTeam ? 18 : (orb.value >= 6 ? 12 : 10)}
            fill={`url(#orbGradient${orb.id})`}
            stroke={orb.isMonadTeam ? "url(#orbOutlineGradientMonad)" : (orb.value >= 8 ? "url(#orbOutlineGradientHigh)" : "url(#orbOutlineGradient)")}
            strokeWidth={orb.isMonadTeam ? 3 : 2}
            opacity={0.9}
          />
          
          {/* Monad team member image with circular mask */}
          {orb.isMonadTeam && (
            <g>
              <defs>
                <clipPath id={`monadClip${orb.id}`}>
                  <circle cx={orb.x} cy={orb.y} r={16} />
                </clipPath>
              </defs>
              <image
                href={`/images/mon-cult/${orb.image}`}
                x={orb.x - 20}
                y={orb.y - 20}
                width={40}
                height={40}
                opacity={1}
                clipPath={`url(#monadClip${orb.id})`}
              />
            </g>
          )}
          
          {/* Shiny highlight - simplified */}
          <circle
            cx={orb.x - 3}
            cy={orb.y - 3}
            r={orb.value >= 6 ? 4 : 3}
            fill="rgba(255, 255, 255, 0.8)"
            />
          
          {/* Role name text */}
          <text
            x={orb.x}
            y={orb.y + 20}
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            stroke="#000"
            strokeWidth={2}
            paintOrder="stroke"
          >
            {orb.isMonadTeam ? orb.roleName : orb.roleName}
          </text>
          
          {/* Stars for high-value orbs */}
          {orb.stars > 0 && (
            <text
              x={orb.x}
              y={orb.y - 18}
              textAnchor="middle"
              fill="#FFD700"
              fontSize="16"
              fontWeight="bold"
              stroke="#000"
              strokeWidth={1}
              paintOrder="stroke"
            >
              {'★'.repeat(orb.stars)}
            </text>
          )}
          
          {/* Point value text */}
          <text
            x={orb.x}
            y={orb.y + 3}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
            stroke="#000"
            strokeWidth={1.5}
            paintOrder="stroke"
          >
            {orb.value}
          </text>
        </g>
      ))}
      
      {/* Render snakes */}
      {gameState.snakes && Object.values(gameState.snakes).filter(snake => snake.isAlive).map(snake => (
        <g key={snake.id}>
          {/* Snake body with gradient */}
          <defs>
            <linearGradient id={`snakeGradient${snake.id}`}>
              <stop offset="0%" stopColor={snake.color} />
              <stop offset="100%" stopColor={snake.color} opacity="0.7" />
            </linearGradient>
            <filter id={`snakeShadow${snake.id}`}>
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
            </filter>
          </defs>
          
          {/* Snake body - connected path */}
          {snake.segments.length > 1 && (
            <path
              d={`M ${snake.segments.map((segment, index) => 
                `${segment.x} ${segment.y}${index === 0 ? '' : ' L'}`
              ).join(' ')}`}
              stroke={`url(#snakeGradient${snake.id})`}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#snakeShadow${snake.id})`}
            />
          )}
          
          {/* Snake body segments for depth */}
          {snake.segments.map((segment, index) => (
            <circle
              key={index}
              cx={segment.x}
              cy={segment.y}
              r={3}
              fill={snake.color}
              stroke="#000"
              strokeWidth={0.3}
              opacity={0.8}
              filter={`url(#snakeShadow${snake.id})`}
            />
          ))}
          
          {/* Snake head */}
          {snake.segments.length > 0 && (
            <g>
              {/* Head background circle */}
              <circle
                cx={snake.segments[0].x}
                cy={snake.segments[0].y}
                r={10}
                fill={snake.color}
                stroke="#000"
                strokeWidth={0.3}
                opacity={0.9}
                filter={`url(#snakeShadow${snake.id})`}
              />
              
              {/* Head highlight for 3D effect */}
              <circle
                cx={snake.segments[0].x - 2}
                cy={snake.segments[0].y - 2}
                r={6}
                fill="rgba(255, 255, 255, 0.3)"
                stroke="none"
              />
              
              {/* Custom snake head image - rendered on top */}
              <image
                href={`${process.env.PUBLIC_URL || ''}/images/snakeHead.png`}
                x={snake.segments[0].x - 15}
                y={snake.segments[0].y - 30}
                width={30}
                height={30}
                opacity={1}
                transform={`rotate(${(snake.direction * 180 / Math.PI) + 90}, ${snake.segments[0].x}, ${snake.segments[0].y})`}
              />
            </g>
          )}
          
          {/* Player indicator for current player */}
          {snake.id === gameState.playerId && snake.isAlive && (
            <circle
              cx={snake.segments[0]?.x  || 0}
              cy={snake.segments[0]?.y - 15 || 0}
              r={16}
              fill="none"
              stroke="#fff"
              strokeWidth={2}
              strokeDasharray="3,5"
              opacity={0.9}
              transform={`rotate(${(snake.direction * 180 / Math.PI) + 90}, ${snake.segments[0]?.x || 0}, ${snake.segments[0]?.y || 0})`}
            />
          )}
        </g>
      ))}
      
      {/* Game border */}
      <rect
        x={0}
        y={0}
        width={dimensions.width}
        height={dimensions.height}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth={3}
        opacity={0.8}
      />
      

    </svg>
  );
});

export default GameBoard; 