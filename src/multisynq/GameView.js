// Simple view following Multisynq pattern
class GameView extends Multisynq.View {
  constructor(model) {
    super(model);
    this.model = model;
    this.playerId = this.viewId;
    this.nickname = `Player${this.playerId.slice(0, 4)}`;
    this.isDead = false;
    this.deathTime = null;
    
    console.log('GameView: Initialized with playerId:', this.playerId, 'nickname:', this.nickname);
    
    // Subscribe to game state updates
    this.subscribe("game", "stateUpdate", this.handleGameStateUpdate);
    
    // Subscribe to death events
    this.subscribe("player", "died", this.handlePlayerDeath);
    
    // Notify model that player joined
    this.publish("player", "join", {
      playerId: this.playerId,
      nickname: this.nickname
    });
  }

  handleGameStateUpdate(data) {
    console.log('GameView: Received game state update, player count:', data.playerCount);
    
    // Check if this player has a new snake (rejoined)
    const mySnake = data.snakes?.[this.playerId];
    if (mySnake && mySnake.isAlive && this.isDead) {
      console.log('GameView: Player has rejoined with new snake!');
      this.isDead = false;
      this.deathTime = null;
    }
    
    // Update local game state
    this.gameState = {
      snakes: data.snakes || {},
      orbs: data.orbs || [],
      leaderboard: data.leaderboard || [],
      nicknames: data.nicknames || {},
      playerId: this.playerId,
      playerCount: data.playerCount || 0
    };
    
    // Trigger UI update
    this.publish("ui", "update", { 
      type: 'game-state-update', 
      data: this.gameState 
    });
  }

  handlePlayerDeath(data) {
    console.log('GameView: Player death event:', data);
    
    if (data.playerId === this.playerId) {
      this.isDead = true;
      this.deathTime = Date.now();
      console.log('GameView: This player died!');
    }
    
    // Trigger UI update for death
    this.publish("ui", "update", { 
      type: 'player-death', 
      data: { ...data, isDead: this.isDead }
    });
  }

  // Method to rejoin the game
  rejoin() {
    console.log('GameView: Rejoining game...');
    
    // Reset death state
    this.isDead = false;
    this.deathTime = null;
    
    // Notify model that player is rejoining
    this.publish("player", "join", {
        playerId: this.playerId,
        nickname: this.nickname
      });
    
    console.log('GameView: Rejoin completed');
  }

  // Handle user input - these methods will be called from React components
  handleDirection(direction) {
    this.publish("player", "direction", {
      playerId: this.playerId,
      direction: direction
    });
  }

  handleBoost(boost) {
    this.publish("player", "boost", {
      playerId: this.playerId,
      boost: boost
    });
  }

  // Get current game state for rendering
  getGameState() {
    return this.gameState || {
        snakes: {},
        orbs: [],
        leaderboard: [],
        nicknames: {},
      playerId: this.playerId,
      playerCount: 0
    };
  }

  detach() {
    // Notify model that player is leaving
    this.publish("player", "leave", {
      playerId: this.playerId
    });
    
    super.detach();
  }
}

export { GameView }; 