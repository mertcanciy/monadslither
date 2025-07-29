import React from 'react';

export default function Leaderboard({ leaderboard = [] }) {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 10, 
      right: 10, 
      background: 'rgba(0, 0, 0, 0.8)', 
      color: 'white',
      padding: 15,
      borderRadius: 8,
      minWidth: 200
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Leaderboard</h3>
      {leaderboard.length === 0 ? (
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>No players yet</p>
      ) : (
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          {leaderboard.map((entry, index) => (
            <li 
              key={entry.id} 
              style={{ 
                marginBottom: '5px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: entry.color,
                  display: 'inline-block'
                }}
              />
              <span style={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                {entry.nickname || entry.id}: {entry.score}
              </span>
            </li>
        ))}
      </ol>
      )}
    </div>
  );
} 