const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying SessionRecords contract to Monad Testnet...");

  // Get the contract factory
  const SessionRecords = await ethers.getContractFactory("SessionRecords");
  
  // Deploy the contract
  const sessionRecords = await SessionRecords.deploy();
  
  // Wait for deployment to complete
  await sessionRecords.waitForDeployment();

  const contractAddress = await sessionRecords.getAddress();
  console.log("✅ SessionRecords deployed to:", contractAddress);
  console.log("🌐 Network:", await ethers.provider.getNetwork());
  
  // Create .env file with the contract address
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = `# Monad Testnet Configuration
REACT_APP_CONTRACT_ADDRESS=${contractAddress}

# Network Configuration
REACT_APP_MONAD_TESTNET_CHAIN_ID=10143
REACT_APP_MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
REACT_APP_MONAD_TESTNET_EXPLORER=https://testnet.monadexplorer.com

# Add your private key here for deployment (optional)
# PRIVATE_KEY=your_private_key_here
`;

  fs.writeFileSync(envPath, envContent);
  console.log("📝 Created .env file with contract address");
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: await ethers.provider.getNetwork(),
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
    explorerUrl: `https://testnet.monadexplorer.com/address/${contractAddress}`
  };
  
  console.log("\n🎉 Deployment successful!");
  console.log("📋 Deployment info:", JSON.stringify(deploymentInfo, null, 2));
  console.log("\n🔗 View contract on explorer:", deploymentInfo.explorerUrl);
  console.log("\n📝 Next steps:");
  console.log("1. Restart your React app: npm start");
  console.log("2. Connect your wallet to Monad testnet");
  console.log("3. Get testnet tokens from: https://faucet.monad.xyz");
  console.log("4. Try registering a player!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 