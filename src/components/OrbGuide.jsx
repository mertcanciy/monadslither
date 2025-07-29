import React, { useState } from 'react';

export default function OrbGuide() {
  const [isVisible, setIsVisible] = useState(false);

  const roles = [
    { name: 'Newbie', points: 1, color: '#40E0D0', turkishName: 'turkuaz' },
    { name: 'Full Access', points: 2, color: '#FFFFFF', turkishName: 'beyaz' },
    { name: 'Nads', points: 3, color: '#800020', turkishName: 'bordo' },
    { name: 'Running Hot', points: 4, color: '#FF8C00', turkishName: 'turuncu' },
    { name: 'Nad OG', points: 5, color: '#FFC0CB', turkishName: 'pembe' },
    { name: 'MON 1', points: 6, color: '#800080', turkishName: 'mor', stars: 1 },
    { name: 'MON 2', points: 7, color: '#800080', turkishName: 'mor', stars: 2 },
    { name: 'Community Team', points: 8, color: '#E6E6FA', turkishName: 'açık mor' },
    { name: 'Admin', points: 10, color: '#E6E6FA', turkishName: 'açık mor' }
  ];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        {isVisible ? 'Hide Guide' : 'Show Orbs'}
      </button>

      {/* Orb Guide */}
      {isVisible && (
        <div style={{
          position: 'absolute',
          top: 50,
          right: 10,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '12px',
          minWidth: '200px',
          zIndex: 1000
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Discord Role Orbs</h4>
          {roles.map((role, index) => (
            <div key={role.name} style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              padding: '4px 0'
            }}>
              {/* Orb preview */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${role.color} 0%, ${role.color} 70%, #000 100%)`,
                border: '2px solid #000',
                marginRight: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 1px #000',
                position: 'relative'
              }}>
                {role.points}
                {/* Shiny highlight */}
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.6)'
                }} />
              </div>
              
              {/* Role info */}
              <div>
                <div style={{ fontWeight: 'bold' }}>{role.name}</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>
                  {role.turkishName} • {role.points} pts
                  {role.stars > 0 && ` • ${'★'.repeat(role.stars)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
} 