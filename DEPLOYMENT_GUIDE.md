# 🚀 Deployment Guide for MonadSlither

## **Step 1: Get MON Testnet Tokens**

1. Go to [Monad Testnet Faucet](https://faucet.monad.xyz)
2. Connect your wallet
3. Request MON tokens for testing

## **Step 2: Set Up Environment Variables**

Create a `.env` file in the root directory:

```bash
# Monad Testnet Configuration
# Add your private key here (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Contract Configuration (will be filled after deployment)
REACT_APP_CONTRACT_ADDRESS=

# Network Configuration
REACT_APP_MONAD_TESTNET_CHAIN_ID=10143
REACT_APP_MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
REACT_APP_MONAD_TESTNET_EXPLORER=https://testnet.monadexplorer.com
```

### **How to Get Your Private Key:**

1. **Open MetaMask**
2. **Click the three dots (menu)**
3. **Go to Account Details**
4. **Click "Export Private Key"**
5. **Enter your password**
6. **Copy the private key (remove the 0x prefix if present)**

⚠️ **Security Warning**: Never share your private key or commit it to version control!

## **Step 3: Deploy the Contract**

```bash
# Deploy to Monad testnet
npx hardhat run scripts/deploy-and-setup.js --network monadTestnet
```

This will:
- Deploy the SessionRecords contract
- Create/update the .env file with the contract address
- Show you the deployment information

## **Step 4: Restart the App**

```bash
# Restart the React app to load the new contract address
npm start
```

## **Step 5: Test the Integration**

1. Connect your wallet to Monad testnet
2. Register a player
3. Play the game and record sessions

## **Troubleshooting**

### **If you get "Insufficient funds" error:**
- Get more MON tokens from [Monad Faucet](https://faucet.monad.xyz)

### **If you get "Network not found" error:**
- Add Monad testnet to MetaMask manually:
  - Network Name: `Monad Testnet`
  - RPC URL: `https://testnet-rpc.monad.xyz`
  - Chain ID: `10143`
  - Currency: `MON`
  - Block Explorer: `https://testnet.monadexplorer.com`

### **If deployment fails:**
- Check your private key is correct
- Ensure you have MON tokens in your wallet
- Verify you're connected to Monad testnet

## **Contract Address**

After deployment, your contract will be available at:
`https://testnet.monadexplorer.com/address/YOUR_CONTRACT_ADDRESS`

## **Next Steps**

Once deployed, you can:
1. **Register players** on-chain
2. **Record game sessions** with dynamic scoring
3. **Earn achievements** for milestones
4. **View leaderboard** with persistent data 