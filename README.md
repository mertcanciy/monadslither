# 🐍 MonadSlither - Multiplayer Snake Game on Monad Blockchain

A real-time multiplayer snake game built with React, Multisynq for synchronization, and Monad blockchain for on-chain statistics and achievements.

## 🌟 Features

### 🎮 Game Features
- **Real-time Multiplayer**: Play with other players in real-time using Multisynq
- **Snake Mechanics**: Classic snake gameplay with orb collection
- **Screen Wrapping**: Snakes wrap around screen edges
- **Collision Detection**: Snakes can kill each other based on score
- **Dynamic Orbs**: Collect orbs to grow and score points

### ⛓️ Blockchain Features
- **On-chain Statistics**: Player stats recorded on Monad testnet
- **Kill Tracking**: Track kills and achievements on-chain
- **Dynamic Points**: Score calculation with bonuses for Monad testnet
- **Achievement System**: On-chain achievements and milestones
- **Leaderboard**: Persistent rankings based on total score
- **Profile System**: View your statistics and achievements

### 🎯 Technical Stack
- **Frontend**: React.js with modern UI/UX
- **Real-time Sync**: Multisynq for deterministic multiplayer
- **Blockchain**: Monad testnet integration
- **Smart Contracts**: Solidity with Hardhat
- **Wallet Integration**: MetaMask support

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MetaMask wallet
- Monad testnet tokens (get from [faucet](https://faucet.monad.xyz))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/monadslither.git
   cd monadslither
   ```

2. **Install dependencies**
```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   REACT_APP_CONTRACT_ADDRESS=0x1dd7fdbc7a88771196A161224CD9Bf702BB2d800
   REACT_APP_MONAD_TESTNET_CHAIN_ID=10143
   REACT_APP_MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
   REACT_APP_MONAD_TESTNET_EXPLORER=https://testnet.monadexplorer.com
   ```

4. **Start the development server**
```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

1. **Connect Wallet**: Connect your MetaMask wallet to Monad testnet
2. **Register**: Register as a player on the blockchain
3. **Enter Nickname**: Choose your in-game nickname
4. **Join Game**: Enter the multiplayer arena
5. **Collect Orbs**: Move your snake to collect orbs and grow
6. **Kill Opponents**: Collide with other snakes to eliminate them
7. **Check Profile**: View your statistics and achievements

## 📊 Blockchain Integration

### Smart Contract Features
- **Session Recording**: Every game session is recorded on-chain
- **Kill Tracking**: Kill statistics are tracked separately
- **Dynamic Scoring**: Bonuses for Monad testnet, consecutive sessions, etc.
- **Achievement System**: Unlock achievements based on performance
- **Leaderboard**: Global rankings based on total score

### Contract Address
- **Monad Testnet**: `0x1dd7fdbc7a88771196A161224CD9Bf702BB2d800`
- **Explorer**: [View on Monad Explorer](https://testnet.monadexplorer.com/address/0x1dd7fdbc7a88771196A161224CD9Bf702BB2d800)

## 🛠️ Development

### Project Structure
```
monadslither/
├── src/
│   ├── components/          # React components
│   ├── services/           # Blockchain service
│   ├── multisynq/         # Game logic and sync
│   └── App.jsx            # Main app component
├── contracts/              # Solidity smart contracts
├── scripts/               # Deployment scripts
├── test/                  # Contract tests
└── hardhat.config.js      # Hardhat configuration
```

### Key Components

#### Frontend
- **GameBoard.jsx**: Main game rendering with SVG
- **Profile.jsx**: Player statistics and achievements
- **OnboardingPage.jsx**: Wallet connection and registration
- **ConnectionStatus.jsx**: Real-time connection status

#### Blockchain
- **blockchainService.js**: Monad testnet integration
- **SessionRecords.sol**: Smart contract for statistics
- **GameSession.js**: Game state management with blockchain

#### Game Logic
- **GameModel.js**: Core game mechanics and collision detection
- **GameView.js**: UI updates and rendering
- **Multisynq**: Real-time synchronization

### Development Commands

```bash
# Start development server
npm start

# Run contract tests
npx hardhat test

# Deploy contract to Monad testnet
npx hardhat run scripts/deploy-and-setup.js --network monadTestnet

# Verify contract
npx hardhat verify --network monadTestnet <CONTRACT_ADDRESS>
```

## 🔧 Configuration

### Environment Variables
- `REACT_APP_CONTRACT_ADDRESS`: Deployed contract address
- `REACT_APP_MONAD_TESTNET_CHAIN_ID`: Monad testnet chain ID (10143)
- `REACT_APP_MONAD_TESTNET_RPC_URL`: RPC endpoint
- `REACT_APP_MONAD_TESTNET_EXPLORER`: Block explorer URL

### Network Configuration
- **Monad Testnet**: Chain ID 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Explorer**: https://testnet.monadexplorer.com
- **Faucet**: https://faucet.monad.xyz

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use consistent formatting
- Add comments for complex logic
- Follow React best practices
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Multisynq**: For real-time multiplayer synchronization
- **Monad**: For high-performance blockchain infrastructure
- **React**: For the amazing frontend framework
- **Hardhat**: For Ethereum development tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/monadslither/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/monadslither/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/monadslither/wiki)

---

**Made with ❤️ for the Monad ecosystem** 