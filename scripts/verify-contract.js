const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying deployed contract...");
  
  try {
    // Get the deployed contract
    const contractAddress = "0xE38a9350D905c84068FEa06b83A28Ba32ec4Aa23";
    const [signer] = await ethers.getSigners();
    const SessionRecords = await ethers.getContractFactory("SessionRecords", signer);
    const contract = SessionRecords.attach(contractAddress);
    
    console.log("✅ Contract address:", contractAddress);
    
    // Check if contract is deployed
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ Contract not deployed at this address");
      return;
    }
    console.log("✅ Contract is deployed");
    
    // Get contract owner
    const owner = await contract.owner();
    console.log("✅ Contract owner:", owner);
    
    // Check if we can call a view function
    try {
      const leaderboard = await contract.getLeaderboard();
      console.log("✅ getLeaderboard() function works");
      console.log("   Players:", leaderboard[0].length);
      console.log("   Scores:", leaderboard[1].length);
    } catch (error) {
      console.log("⚠️  getLeaderboard() error:", error.message);
    }
    
    console.log("\n🎉 Contract verification successful!");
    console.log("📋 Contract Details:");
    console.log("   Address:", contractAddress);
    console.log("   Owner:", owner);
    console.log("   Explorer:", `https://testnet.monadexplorer.com/address/${contractAddress}`);
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 