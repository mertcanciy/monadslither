import { GameModel } from './GameModel';
import { GameView } from './GameView';

// Simple session manager following Multisynq pattern
export class GameSessionManager {
  constructor() {
    this.session = null;
    this.view = null;
    this.gameState = null;
  }

  async joinSession(options = {}) {
    try {
      console.log('GameSessionManager: Starting session join with options:', options);
      
      // Use Multisynq.Session.join directly following the Hello World pattern
      this.session = await Multisynq.Session.join({
        apiKey: options.apiKey || 'YOUR_API_KEY_HERE',
        appId: 'com.monadslither.game',
        model: GameModel,
        view: GameView,
        name: options.sessionName || 'default-session',
        password: options.password || 'monadslither-game',
        tps: 15,
        debug: ['events'],
        nickname: options.nickname,
        walletAddress: options.walletAddress, // Pass wallet address for blockchain recording
        ...options
      });

      console.log('GameSessionManager: Session created:', this.session);
      
      if (!this.session) {
        throw new Error('Session creation failed - session is null');
      }
      
      this.view = this.session.view;
      console.log('GameSessionManager: View created:', this.view);
      
      if (!this.view) {
        throw new Error('View creation failed - view is null');
      }
      
      // Subscribe to UI updates
      this.view.subscribe("ui", "update", this.handleUIUpdate.bind(this));

      console.log('Successfully joined game session');
      return this.session;
    } catch (error) {
      console.error('Failed to join session:', error);
      throw error;
    }
  }

  handleUIUpdate(data) {
    console.log('GameSessionManager: UI update received:', data);
    
    if (data.type === 'game-state-update' && data.data) {
      this.gameState = data.data;
      console.log('GameSessionManager: Updated game state, player count:', this.gameState.playerCount);
      
      // Clear death data if player has rejoined
      if (this.gameState.playerDeath && this.gameState.playerDeath.isDead) {
        const mySnake = this.gameState.snakes?.[this.view?.playerId];
        if (mySnake && mySnake.isAlive) {
          console.log('GameSessionManager: Player has rejoined, clearing death data');
          this.gameState.playerDeath = null;
        }
      }
    } else if (data.type === 'player-death') {
      // Handle death event
      this.gameState = {
        ...this.gameState,
        playerDeath: data.data
      };
      console.log('GameSessionManager: Player death event:', data.data);
      
      // Record session on blockchain
      this.recordSessionOnBlockchain(data.data);
    } else if (data.type === 'player-kill') {
      console.log('GameSessionManager: Player kill event:', data.data);
      
      // Record killer's session on blockchain (with kill bonus)
      this.recordSessionOnBlockchain(data.data);
    }
    
    // Trigger React component updates
    if (this.onStateUpdate) {
      this.onStateUpdate(this.gameState);
    }
  }

  sendDirection(direction) {
    if (this.view) {
      this.view.handleDirection(direction);
    }
  }

  sendBoost(boost) {
    if (this.view) {
      this.view.handleBoost(boost);
    }
  }

  leaveSession() {
    if (this.session) {
      this.session.leave();
      this.session = null;
      this.view = null;
      this.gameState = null;
    }
  }

  // Method to rejoin the game
  rejoin() {
    console.log('GameSessionManager: Rejoining game...');
    
    if (this.view && this.view.rejoin) {
      this.view.rejoin();
    }
    
    // Clear death data from game state
    if (this.gameState) {
      this.gameState.playerDeath = null;
    }
  }

  getGameState() {
    return this.gameState;
  }

  async recordSessionOnBlockchain(deathData) {
    try {
      console.log('🎯 recordSessionOnBlockchain called with data:', deathData);
      
      // Import blockchain service dynamically to avoid circular dependencies
      const { blockchainService } = await import('../services/blockchainService');
      
      console.log('🔗 Blockchain service imported, checking connection...');
      
      if (!blockchainService.isConnected) {
        console.log('❌ Blockchain service not connected, skipping session recording');
        return;
      }

      const { score, duration, orbCount, snakeLength, walletAddress, isKill = false } = deathData;
      
      console.log('📊 Recording session on blockchain:', {
        score,
        duration,
        orbCount,
        snakeLength,
        walletAddress,
        isKill
      });

      // Only record if we have a wallet address
      if (!walletAddress) {
        console.log('⚠️ No wallet address found, skipping session recording');
        return;
      }

      const result = await blockchainService.recordSession(score, duration, orbCount, snakeLength, isKill);
      
      console.log('✅ Session recorded successfully:', result);
      
      // Trigger a profile refresh if the profile is open
      if (window.profileRefreshCallback) {
        console.log('🔄 Triggering profile refresh...');
        window.profileRefreshCallback();
      } else {
        console.log('⚠️ No profile refresh callback found');
      }
      
    } catch (error) {
      console.error('❌ Failed to record session on blockchain:', error);
    }
  }
}

// Export a singleton instance
export const gameManager = new GameSessionManager(); 