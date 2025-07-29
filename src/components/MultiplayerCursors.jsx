import React from 'react';

export default function MultiplayerCursors({ gameState }) {
  if (!gameState || !gameState.snakes) {
    return null;
  }

  return (
    <>
      {Object.values(gameState.snakes).map(snake => {
        if (!snake.segments || snake.segments.length === 0) return null;
        
        const head = snake.segments[0];
        return (
        <div
            key={snake.id}
          style={{
            position: 'absolute',
              left: head.x - 5,
              top: head.y - 5,
            pointerEvents: 'none',
              background: snake.color,
            borderRadius: '50%',
            width: 10,
            height: 10,
            border: '2px solid #000',
              zIndex: 1000,
          }}
        />
        );
      })}
    </>
  );
} 