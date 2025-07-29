import React, { useEffect, useState } from 'react';

export default function Controls({ onDirection, onBoost }) {
  const [keys, setKeys] = useState(new Set());

  useEffect(() => {
    const handleKeyDown = e => {
      const newKeys = new Set(keys);
      newKeys.add(e.key);
      setKeys(newKeys);
      
      if (e.key === ' ') onBoost(true);
    };
    
    const handleKeyUp = e => {
      const newKeys = new Set(keys);
      newKeys.delete(e.key);
      setKeys(newKeys);
      
      if (e.key === ' ') onBoost(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys, onBoost]);

  // Calculate direction based on pressed keys
  useEffect(() => {
    let dx = 0;
    let dy = 0;
    
    if (keys.has('ArrowUp')) dy -= 1;
    if (keys.has('ArrowDown')) dy += 1;
    if (keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('ArrowRight')) dx += 1;
    
    // Only update direction if at least one key is pressed
    if (dx !== 0 || dy !== 0) {
      const angle = Math.atan2(dy, dx);
      onDirection(angle);
    }
  }, [keys, onDirection]);

  return null;
} 