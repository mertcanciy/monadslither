import { ethers } from 'ethers';

// Contract ABI - This will be generated after compilation
const SessionRecordsABI = [
  "event SessionCompleted(address indexed player, uint256 indexed sessionId, uint256 score, uint256 duration, uint256 timestamp, bool isMonadTestnet)",
  "event PlayerRegistered(address indexed player, string nickname)",
  "event AchievementUnlocked(address indexed player, string achievement)",
  "event LeaderboardUpdated(address indexed player, uint256 newRank)",
  "function registerPlayer(string memory _nickname) external",
  "function recordSession(uint256 _score, uint256 _duration, uint256 _orbCount, uint256 _snakeLength) external",
  "function getPlayerStats(address _player) external view returns (tuple(uint256 totalSessions, uint256 totalScore, uint256 bestScore, uint256 totalDuration, uint256 consecutiveSessions, uint256 lastSessionTime, string nickname, bool isRegistered, uint256 achievements))",
  "function getLeaderboard() external view returns (address[] memory, uint256[] memory)",
  "function getPlayerAchievements(address _player) external view returns (string[] memory)",
  "function getPlayerSessions(address _player) external view returns (tuple(uint256 sessionId, address player, uint256 score, uint256 duration, uint256 timestamp, bool isMonadTestnet, uint256 orbCount, uint256 snakeLength)[] memory)"
];

// Monad Testnet Configuration
const MONAD_TESTNET_CONFIG = {
  chainId: '0x2797', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com']
};

export class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
  }

  /**
   * Initialize the blockchain service
   */
  async initialize() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Get the connected account
      const accounts = await this.provider.listAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Initialize contract if address is available
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      if (contractAddress) {
        this.contract = new ethers.Contract(contractAddress, SessionRecordsABI, this.signer);
        console.log('Contract initialized with address:', contractAddress);
      } else {
        console.warn('No contract address found. Set REACT_APP_CONTRACT_ADDRESS in .env file');
      }

      this.isConnected = true;
      console.log('Blockchain service initialized successfully');
      
      return {
        success: true,
        address: accounts[0].address || accounts[0],
        network: await this.provider.getNetwork()
      };
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Switch to Monad testnet
   */
  async switchToMonadTestnet() {
    try {
      // First try to switch to existing network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2797' }] // 10143 in hex
        });
        console.log('Switched to existing Monad testnet');
        
        // Wait a moment for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reinitialize provider after network switch
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        return true;
      } catch (switchError) {
        console.log('Switch error:', switchError);
        
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [MONAD_TESTNET_CONFIG]
            });
            console.log('Added and switched to Monad testnet');
            
            // Wait a moment for the addition to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Reinitialize provider after network addition
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            
            return true;
          } catch (addError) {
            console.error('Failed to add Monad testnet:', addError);
            throw new Error('Failed to add Monad testnet to MetaMask. Please add it manually.');
          }
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Failed to switch to Monad testnet:', error);
      throw error;
    }
  }

  /**
   * Check if connected to Monad testnet
   */
  async isOnMonadTestnet() {
    if (!this.provider) return false;
    
    try {
      const network = await this.provider.getNetwork();
      console.log('Current network chainId:', network.chainId, 'Type:', typeof network.chainId);
      
      // Handle both BigInt and number chain IDs
      const chainId = typeof network.chainId === 'bigint' ? Number(network.chainId) : network.chainId;
      const isMonad = chainId === 10143;
      
      console.log('Is Monad testnet:', isMonad);
      return isMonad;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  /**
   * Register a new player
   */
  async registerPlayer(nickname) {
    if (!this.contract) {
      throw new Error('Smart contract not deployed. Please deploy the contract first or set REACT_APP_CONTRACT_ADDRESS in .env file');
    }

    try {
      console.log('Attempting to register player:', nickname);
      const tx = await this.contract.registerPlayer(nickname);
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Player registered successfully. Transaction:', receipt.transactionHash);
      return true;
    } catch (error) {
      console.error('Failed to register player:', error);
      
      // Provide more specific error messages
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient MON tokens. Please get testnet tokens from https://faucet.monad.xyz');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction failed. Please check your network connection and try again');
      } else if (error.message.includes('user rejected')) {
        throw new Error('Transaction was rejected by user');
      } else {
        throw new Error(`Registration failed: ${error.message}`);
      }
    }
  }

  /**
   * Record a game session
   */
  async recordSession(score, duration, orbCount, snakeLength, isKill = false) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Try the new interface first (with isKill parameter)
      let tx;
      try {
        tx = await this.contract.recordSession(score, duration, orbCount, snakeLength, isKill);
      } catch (error) {
        // If that fails, try the old interface (without isKill parameter)
        console.log('New interface failed, trying old interface...');
        tx = await this.contract.recordSession(score, duration, orbCount, snakeLength);
      }
      
      const receipt = await tx.wait();
      
      // Find the SessionCompleted event
      const event = receipt.events?.find(e => e.event === 'SessionCompleted');
      
      console.log('Session recorded successfully');
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        sessionId: event?.args?.sessionId,
        dynamicScore: event?.args?.score
      };
    } catch (error) {
      console.error('Failed to record session:', error);
      throw error;
    }
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const stats = await this.contract.getPlayerStats(address);
      
      // Handle both BigNumber and regular number types
      const safeToNumber = (value) => {
        if (value && typeof value.toNumber === 'function') {
          return value.toNumber();
        }
        if (typeof value === 'bigint') {
          return Number(value);
        }
        return value || 0;
      };

      return {
        totalSessions: safeToNumber(stats.totalSessions),
        totalScore: safeToNumber(stats.totalScore),
        highestScore: safeToNumber(stats.bestScore),
        totalPlayTime: safeToNumber(stats.totalDuration),
        consecutiveSessions: safeToNumber(stats.consecutiveSessions),
        lastSessionTime: safeToNumber(stats.lastSessionTime),
        registrationDate: safeToNumber(stats.lastSessionTime), // Using lastSessionTime as registration date
        nickname: stats.nickname || '',
        isRegistered: stats.isRegistered || false,
        totalOrbsCollected: 0, // This will be calculated from sessions
        achievements: safeToNumber(stats.achievements),
        totalKills: safeToNumber(stats.totalKills || 0) // Handle case where totalKills doesn't exist
      };
    } catch (error) {
      console.error('Failed to get player stats:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [players, scores] = await this.contract.getLeaderboard();
      
      // Handle both BigNumber and regular number types
      const safeToNumber = (value) => {
        if (value && typeof value.toNumber === 'function') {
          return value.toNumber();
        }
        if (typeof value === 'bigint') {
          return Number(value);
        }
        return value || 0;
      };

      return players.map((player, index) => ({
        address: player,
        score: safeToNumber(scores[index]),
        rank: index + 1
      }));
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get player achievements
   */
  async getPlayerAchievements(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const achievements = await this.contract.getPlayerAchievements(address);
      return achievements;
    } catch (error) {
      console.error('Failed to get player achievements:', error);
      throw error;
    }
  }

  /**
   * Get player session history
   */
  async getPlayerSessions(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const sessions = await this.contract.getPlayerSessions(address);
      
      // Handle both BigNumber and regular number types
      const safeToNumber = (value) => {
        if (value && typeof value.toNumber === 'function') {
          return value.toNumber();
        }
        if (typeof value === 'bigint') {
          return Number(value);
        }
        return value || 0;
      };

      return sessions.map(session => ({
        sessionId: safeToNumber(session.sessionId),
        player: session.player,
        score: safeToNumber(session.score),
        duration: safeToNumber(session.duration),
        timestamp: safeToNumber(session.timestamp),
        isMonadTestnet: session.isMonadTestnet || false,
        orbCount: safeToNumber(session.orbCount),
        snakeLength: safeToNumber(session.snakeLength),
        dynamicScore: safeToNumber(session.score) // For now, using regular score as dynamic score
      }));
    } catch (error) {
      console.error('Failed to get player sessions:', error);
      throw error;
    }
  }

  /**
   * Get current account address
   */
  async getCurrentAddress() {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    
    return await this.signer.getAddress();
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    return await this.provider.getNetwork();
  }

  /**
   * Listen for contract events
   */
  listenToEvents(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    this.contract.on('SessionCompleted', (player, sessionId, score, duration, timestamp, isMonadTestnet) => {
      callback({
        type: 'SessionCompleted',
        player,
        sessionId: sessionId.toNumber(),
        score: score.toNumber(),
        duration: duration.toNumber(),
        timestamp: timestamp.toNumber(),
        isMonadTestnet
      });
    });

    this.contract.on('AchievementUnlocked', (player, achievement) => {
      callback({
        type: 'AchievementUnlocked',
        player,
        achievement
      });
    });

    this.contract.on('LeaderboardUpdated', (player, newRank) => {
      callback({
        type: 'LeaderboardUpdated',
        player,
        newRank: newRank.toNumber()
      });
    });
  }

  /**
   * Stop listening to events
   */
  stopListening() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService(); 