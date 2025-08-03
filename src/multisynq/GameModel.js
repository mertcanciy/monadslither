// Simple model following Multisynq pattern
class GameModel extends (window.Multisynq?.Model || class {
  constructor() {
    console.error('Multisynq.Model not available - GameModel cannot be instantiated');
    throw new Error('Multisynq library not loaded');
  }
}) {
  init() {
    console.log('GameModel: init() called');
    
    // Initialize game state with dynamic dimensions
    this.snakes = {};
    this.orbs = [];
    this.leaderboard = [];
    this.nicknames = {};
    this.nextOrbId = 1;
    
    // Use full viewport dimensions since UI elements are positioned absolutely
    this.width = window.innerWidth || 1000;
    this.height = window.innerHeight || 1000;
    this.connectedPlayers = new Set();
    
    // Define Discord roles with points and colors
    this.roles = [
      { name: 'Newbie', points: 1, color: '#40E0D0', turkishName: 'turkuaz' }, // turkuaz
      { name: 'Full Access', points: 2, color: '#FFFFFF', turkishName: 'beyaz' }, // beyaz
      { name: 'Nads', points: 3, color: '#800020', turkishName: 'bordo' }, // bordo
      { name: 'Running Hot', points: 4, color: '#FF8C00', turkishName: 'turuncu' }, // turuncu
      { name: 'Nad OG', points: 5, color: '#FFC0CB', turkishName: 'pembe' }, // pembe
      { name: 'MON 1', points: 6, color: '#800080', turkishName: 'mor', stars: 1 }, // mor with 1 star
      { name: 'MON 2', points: 7, color: '#800080', turkishName: 'mor', stars: 2 }, // mor with 2 stars
      { name: 'Community Team', points: 8, color: '#E6E6FA', turkishName: 'açık mor' }, // açık mor
      { name: 'Admin', points: 10, color: '#E6E6FA', turkishName: 'açık mor' } // açık mor
    ];
    
    // Define Monad team members
    this.monadTeam = [
      { name: 'Bill Monday', image: 'billMonday.jpg', points: 15 },
      { name: 'Keone', image: 'keone.jpg', points: 15 },
      { name: 'Eunice', image: 'eunice.jpg', points: 15 },
      { name: 'Baboli', image: 'baboli.jpg', points: 15 },
      { name: 'Tina', image: 'tina.jpg', points: 15 },
      { name: 'Berzan', image: 'berzan.jpeg', points: 15 },
      { name: 'Port', image: 'port.png', points: 15 }
    ];
    
    // Subscribe to player events
    this.subscribe("player", "join", this.handlePlayerJoin);
    this.subscribe("player", "leave", this.handlePlayerLeave);
    this.subscribe("player", "direction", this.handlePlayerDirection);
    this.subscribe("player", "boost", this.handlePlayerBoost);
    
    // Track wallet addresses for blockchain recording
    this.walletAddresses = {};
    
    // Start game loop
    this.future(100).gameTick();
    
    // Spawn initial orbs
    this.spawnInitialOrbs();
  }

  handlePlayerJoin(data) {
    console.log('GameModel: Player joined:', data);
    const { playerId, nickname, walletAddress } = data;
    
    this.connectedPlayers.add(playerId);
    this.nicknames[playerId] = nickname;
    
    // Store wallet address for blockchain recording
    if (walletAddress) {
      this.walletAddresses[playerId] = walletAddress;
      console.log(`GameModel: Stored wallet address ${walletAddress} for player ${playerId}`);
    }
    
    // Always create a new snake (for both new players and rejoining players)
    this.snakes[playerId] = this.createSnake(playerId);
    
    console.log(`GameModel: Created snake for player ${playerId} (${nickname})`);
    
    // Count only alive players
    const activePlayers = Object.values(this.snakes).filter(snake => snake.isAlive).length;
    
    this.publish("game", "stateUpdate", {
      snakes: this.snakes,
      orbs: this.orbs,
      leaderboard: this.leaderboard,
      nicknames: this.nicknames,
      playerCount: activePlayers
    });
  }

  handlePlayerLeave(data) {
    console.log('GameModel: Player left:', data);
    const { playerId } = data;
    
    this.connectedPlayers.delete(playerId);
    delete this.snakes[playerId];
    delete this.nicknames[playerId];
    
    // Count only alive players
    const activePlayers = Object.values(this.snakes).filter(snake => snake.isAlive).length;
    
    this.publish("game", "stateUpdate", {
      snakes: this.snakes,
      orbs: this.orbs,
      leaderboard: this.leaderboard,
      nicknames: this.nicknames,
      playerCount: activePlayers
    });
  }

  handlePlayerDirection(data) {
    const { playerId, direction } = data;
    const snake = this.snakes[playerId];
    if (snake && snake.isAlive) {
      snake.direction = direction;
    }
  }

  handlePlayerBoost(data) {
    const { playerId, boost } = data;
    const snake = this.snakes[playerId];
    if (snake && snake.isAlive) {
      snake.boost = boost;
    }
  }

  gameTick() {
    this.moveSnakes();
    this.handleCollisions();
    this.spawnOrbsIfNeeded();
    this.updateLeaderboard();
    
    // Count only alive players
    const activePlayers = Object.values(this.snakes).filter(snake => snake.isAlive).length;
    
    this.publish("game", "stateUpdate", {
      snakes: this.snakes,
      orbs: this.orbs,
      leaderboard: this.leaderboard,
      nicknames: this.nicknames,
      playerCount: activePlayers // Only count alive players
    });
    
    this.future(100).gameTick();
  }

  moveSnakes() {
    Object.values(this.snakes).forEach(snake => {
      if (!snake.isAlive) return;
      
      const speed = snake.boost ? 6 : 3; // Reduced speed for smoother movement
      const head = snake.segments[0];
      
      // Calculate new head position with smoother movement
      const newHead = {
        x: head.x + Math.cos(snake.direction) * speed,
        y: head.y + Math.sin(snake.direction) * speed
      };
      
      // Wrap around edges - proper screen wrapping
      if (newHead.x < 0) {
        newHead.x = this.width + newHead.x;
      } else if (newHead.x >= this.width) {
        newHead.x = newHead.x - this.width;
      }
      
      if (newHead.y < 0) {
        newHead.y = this.height + newHead.y;
      } else if (newHead.y >= this.height) {
        newHead.y = newHead.y - this.height;
      }
      
      // Add new head
      snake.segments.unshift(newHead);
      
      // Maintain length
      while (snake.segments.length > snake.length) {
        snake.segments.pop();
      }
      
      // Smooth segment interpolation for better visual flow
      for (let i = 1; i < snake.segments.length; i++) {
        const current = snake.segments[i];
        const previous = snake.segments[i - 1];
        
        // Interpolate segment positions for smoother curves
        const interpolation = 0.3; // Adjust for smoother/faster following
        current.x += (previous.x - current.x) * interpolation;
        current.y += (previous.y - current.y) * interpolation;
        
        // Wrap segment positions to prevent visual lines across screen
        if (current.x < 0) {
          current.x = this.width + current.x;
        } else if (current.x >= this.width) {
          current.x = current.x - this.width;
        }
        
        if (current.y < 0) {
          current.y = this.height + current.y;
        } else if (current.y >= this.height) {
          current.y = current.y - this.height;
        }
      }
    });
  }

  handleCollisions() {
    Object.values(this.snakes).forEach(snake => {
      if (!snake.isAlive) return;
      
      const head = snake.segments[0];
      
      // Check orb collisions
      this.orbs = this.orbs.filter(orb => {
        const distance = Math.sqrt(
          Math.pow(head.x - orb.x, 2) + Math.pow(head.y - orb.y, 2)
        );
        
        // Larger collision radius for bigger orbs
        const collisionRadius = orb.value >= 6 ? 25 : 22;
        
        if (distance < collisionRadius) {
          snake.score += orb.value;
          snake.length += 2;
          snake.orbsCollected = (snake.orbsCollected || 0) + 1;
          return false; // Remove orb
        }
        return true;
      });
      
      // Check snake collisions
      Object.values(this.snakes).forEach(otherSnake => {
        if (snake.id === otherSnake.id || !otherSnake.isAlive) return;
        
        for (let i = 1; i < otherSnake.segments.length; i++) {
          const segment = otherSnake.segments[i];
          const distance = Math.sqrt(
            Math.pow(head.x - segment.x, 2) + Math.pow(head.y - segment.y, 2)
          );
          
          if (distance < 15) {
            // Determine which snake dies based on score
            let snakeToKill, killerSnake;
            
            if (snake.score < otherSnake.score) {
              // Current snake dies (lower score)
              snakeToKill = snake;
              killerSnake = otherSnake;
            } else if (snake.score > otherSnake.score) {
              // Other snake dies (lower score)
              snakeToKill = otherSnake;
              killerSnake = snake;
            } else {
              // Equal scores - random winner
              if (Math.random() < 0.5) {
                snakeToKill = snake;
                killerSnake = otherSnake;
              } else {
                snakeToKill = otherSnake;
                killerSnake = snake;
              }
            }
            
            // Kill the snake with lower score
            snakeToKill.isAlive = false;
            snakeToKill.deathTime = Date.now();
            
            // Update killer's statistics
            killerSnake.kills = (killerSnake.kills || 0) + 1;
            killerSnake.totalScore += snakeToKill.score; // Add victim's score to killer
            
            // Handle dead snake cleanup and orb spawning
            this.handleDeadSnake(snakeToKill, head, killerSnake);
            
            // Publish death event
            this.publish("player", "died", {
              playerId: snakeToKill.id,
              killedBy: killerSnake.id,
              position: { x: head.x, y: head.y },
              score: snakeToKill.score
            });
            
            console.log(`Player ${snakeToKill.id} (score: ${snakeToKill.score}) died by collision with ${killerSnake.id} (score: ${killerSnake.score})`);
            break;
          }
        }
      });
    });
  }

  handleDeadSnake(deadSnake, deathPosition, killerSnake = null) {
    if (deadSnake.score <= 0) {
      // Remove snake immediately if no points
      delete this.snakes[deadSnake.id];
      console.log(`Removed dead snake ${deadSnake.id} with 0 points`);
      return;
    }

    // Schedule removal after 3 seconds
    setTimeout(() => {
      if (this.snakes[deadSnake.id] && !this.snakes[deadSnake.id].isAlive) {
        delete this.snakes[deadSnake.id];
        console.log(`Removed dead snake ${deadSnake.id} after delay`);
      }
    }, 3000);

    // Spawn orbs from dead snake's points
    this.spawnOrbsFromDeadSnake(deadSnake, deathPosition);

    // Publish death event with session data for blockchain recording
    const walletAddress = this.walletAddresses[deadSnake.id];
    const sessionData = {
      score: deadSnake.score,
      duration: Math.floor((Date.now() - deadSnake.startTime) / 1000), // Session duration in seconds
      orbCount: deadSnake.orbsCollected || 0,
      snakeLength: deadSnake.length,
      playerId: deadSnake.id,
      walletAddress: walletAddress, // Include wallet address for blockchain recording
      nickname: this.nicknames[deadSnake.id] || 'Unknown'
    };

    console.log('💀 Publishing death event with session data:', sessionData);
    this.publish("ui", "player-death", sessionData);
    console.log('✅ Death event published successfully');

    // If there's a killer, also record their kill statistics
    if (killerSnake) {
      const killerWalletAddress = this.walletAddresses[killerSnake.id];
      const killerSessionData = {
        score: killerSnake.score,
        duration: Math.floor((Date.now() - killerSnake.startTime) / 1000),
        orbCount: killerSnake.orbsCollected || 0,
        snakeLength: killerSnake.length,
        playerId: killerSnake.id,
        walletAddress: killerWalletAddress,
        nickname: this.nicknames[killerSnake.id] || 'Unknown',
        kills: killerSnake.kills || 0,
        isKill: true // Flag to indicate this is a kill update
      };

      console.log('🔪 Publishing kill event with killer data:', killerSessionData);
      this.publish("ui", "player-kill", killerSessionData);
      console.log('✅ Kill event published successfully');
    }
  }

  spawnOrbsFromDeadSnake(deadSnake, deathPosition) {
    const totalPoints = deadSnake.score;
    const orbCount = Math.min(Math.max(3, Math.floor(totalPoints / 5)), 10); // 3-10 orbs
    
    console.log(`Spawning ${orbCount} orbs from dead snake ${deadSnake.id} with ${totalPoints} points`);
    
    for (let i = 0; i < orbCount; i++) {
      // Calculate position around death area
      const angle = (Math.PI * 2 * i) / orbCount;
      const distance = 50 + Math.random() * 100; // 50-150 pixels from death position
      const x = deathPosition.x + Math.cos(angle) * distance;
      const y = deathPosition.y + Math.sin(angle) * distance;
      
      // Ensure orb is within game bounds
      const clampedX = Math.max(50, Math.min(this.width - 50, x));
      const clampedY = Math.max(50, Math.min(this.height - 50, y));
      
      // Create orb with points based on dead snake's total points
      const orbPoints = Math.max(1, Math.floor(totalPoints / orbCount));
      
      // Select role based on points
      const selectedRole = this.roles.find(role => role.points === orbPoints) || 
                          this.roles.find(role => role.points <= orbPoints) || 
                          this.roles[0];
      
      const newOrb = {
        id: this.nextOrbId++,
        x: clampedX,
        y: clampedY,
        value: orbPoints,
        color: selectedRole.color,
        roleName: selectedRole.name,
        turkishName: selectedRole.turkishName,
        stars: selectedRole.stars || 0
      };
      
      this.orbs.push(newOrb);
      console.log(`Spawned orb with ${orbPoints} points at (${clampedX}, ${clampedY})`);
    }
  }

  spawnOrbsIfNeeded() {
    // Maintain a good balance of orbs (reduced for less clutter)
    const targetOrbCount = Math.max(25, Math.floor((this.width * this.height) / 20000));
    
    while (this.orbs.length < targetOrbCount) {
      this.orbs.push(this.createOrb());
    }
  }

  createSnake(playerId) {
    const startX = Math.random() * this.width;
    const startY = Math.random() * this.height;
    const direction = Math.random() * 2 * Math.PI;
    
    // Create initial segments for smoother appearance
    const segments = [];
    for (let i = 0; i < 10; i++) {
      segments.push({
        x: startX - Math.cos(direction) * i * 3,
        y: startY - Math.sin(direction) * i * 3
      });
    }
    
    return {
      id: playerId,
      segments: segments,
      direction: direction,
      length: 10,
      isAlive: true,
      color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 50%)`,
      score: 0,
      boost: false,
      startTime: Date.now(),
      orbsCollected: 0,
    };
  }

  createOrb() {
    // 10% chance to create a Monad team orb
    if (Math.random() < 0.1) {
      const randomTeamMember = this.monadTeam[Math.floor(Math.random() * this.monadTeam.length)];
      
      return {
        id: this.nextOrbId++,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        value: randomTeamMember.points,
        color: '#FFD700', // Gold color for team members
        roleName: randomTeamMember.name,
        turkishName: 'Monad Team',
        stars: 0,
        isMonadTeam: true,
        image: randomTeamMember.image
      };
    }
    
    // Regular role-based orb (90% chance)
    const roleWeights = this.roles.map((role, index) => ({
      role,
      weight: Math.max(1, 10 - index) // Higher roles (higher index) have lower weight
    }));
    
    // Calculate total weight
    const totalWeight = roleWeights.reduce((sum, item) => sum + item.weight, 0);
    
    // Select random role based on weights
    let random = Math.random() * totalWeight;
    let selectedRole = roleWeights[0].role; // Default to first role
    
    for (const item of roleWeights) {
      random -= item.weight;
      if (random <= 0) {
        selectedRole = item.role;
        break;
      }
    }
    
    return {
      id: this.nextOrbId++,
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      value: selectedRole.points,
      color: selectedRole.color,
      roleName: selectedRole.name,
      turkishName: selectedRole.turkishName,
      stars: selectedRole.stars || 0,
      isMonadTeam: false
    };
  }

  spawnInitialOrbs() {
    // Spawn initial orbs with role distribution (reduced for less clutter)
    const initialOrbCount = Math.max(15, Math.floor((this.width * this.height) / 30000));
    
    for (let i = 0; i < initialOrbCount; i++) {
      this.orbs.push(this.createOrb());
    }
    
    console.log(`GameModel: Spawned ${initialOrbCount} initial orbs with role distribution`);
  }

  updateLeaderboard() {
    this.leaderboard = Object.values(this.snakes)
      .filter(snake => snake.isAlive)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(snake => ({
        id: snake.id,
        nickname: this.nicknames[snake.id] || `Player${snake.id.slice(0, 4)}`,
        score: snake.score,
        color: snake.color
      }));
  }
}

// Register the model class
GameModel.register("GameModel");

export { GameModel };

 