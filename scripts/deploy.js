const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SessionRecords contract...");

  // Get the contract factory
  const SessionRecords = await ethers.getContractFactory("SessionRecords");
  
  // Deploy the contract
  const sessionRecords = await SessionRecords.deploy();
  
  // Wait for deployment to complete
  await sessionRecords.deployed();

  console.log("SessionRecords deployed to:", sessionRecords.address);
  console.log("Network:", await ethers.provider.getNetwork());
  
  // Verify the deployment
  console.log("Contract deployed successfully!");
  console.log("Contract address:", sessionRecords.address);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: sessionRecords.address,
    network: await ethers.provider.getNetwork(),
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString()
  };
  
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 