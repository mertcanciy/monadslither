import React from 'react';

export default function ConnectionStatus({ isConnected, playerId, playerCount, nickname, gameState, onShowProfile }) {
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '250px',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Connection Status</h3>
      
      <div style={{ marginBottom: '8px' }}>
        <span style={{ color: isConnected ? '#4CAF50' : '#FF9800' }}>
          ● {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>
      
      {nickname && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Nickname:</strong> {nickname}
        </div>
      )}
      
      {playerId && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Your ID:</strong> {playerId}
        </div>
      )}
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Players Online:</strong> {playerCount || 0}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Controls:</strong>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>
          <div>• Arrow Keys: Move</div>
          <div>• Spacebar: Boost</div>
        </div>
      </div>
      
      {onShowProfile && (
        <button 
          onClick={onShowProfile}
          style={{
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            marginTop: '10px',
            width: '100%'
          }}
        >
          📊 View Profile
        </button>
      )}
    </div>
  );
} 