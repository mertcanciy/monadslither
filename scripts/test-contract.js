const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing contract functionality...");
  
  try {
    const [signer] = await ethers.getSigners();
    const contractAddress = "0x1dd7fdbc7a88771196A161224CD9Bf702BB2d800";
    const SessionRecords = await ethers.getContractFactory("SessionRecords", signer);
    const contract = SessionRecords.attach(contractAddress);
    
    console.log("✅ Contract address:", contractAddress);
    console.log("👤 Signer address:", await signer.address);
    
    // Test recording a session (death event)
    console.log("📊 Recording test session (death)...");
    const tx = await contract.recordSession(100, 60, 5, 15, false); // false = death event
    console.log("📝 Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Session recorded successfully!");
    console.log("📋 Transaction receipt:", receipt.transactionHash);
    
    // Get player stats
    const stats = await contract.getPlayerStats(await signer.address);
    console.log("📈 Player stats:", {
      totalSessions: stats.totalSessions.toString(),
      totalScore: stats.totalScore.toString(),
      bestScore: stats.bestScore.toString(),
      totalDuration: stats.totalDuration.toString(),
      totalKills: stats.totalKills.toString()
    });
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 