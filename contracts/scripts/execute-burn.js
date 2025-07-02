const hre = require("hardhat");

async function main() {
  console.log("🔥 Executing Strategic SOLAR Token Burn...");

  // Configuration
  const SOLAR_TOKEN = "0x746042147240304098c837563aaec0f671881b07";
  const BURN_AMOUNT = hre.ethers.parseEther("2000000000"); // 2 Billion SOLAR tokens
  
  // Get contract address from environment
  const SOLAR_INTEGRATION_ADDRESS = process.env.SOLAR_INTEGRATION_ADDRESS || process.env.NEXT_PUBLIC_SOLAR_INTEGRATION_ADDRESS;
  
  if (!SOLAR_INTEGRATION_ADDRESS) {
    console.error("❌ SOLAR_INTEGRATION_ADDRESS not found in environment variables");
    console.error("Please set SOLAR_INTEGRATION_ADDRESS in your .env file");
    console.error("Example: SOLAR_INTEGRATION_ADDRESS=0x1234567890123456789012345678901234567890");
    process.exit(1);
  }
  
  console.log("Using SOLAR Integration contract:", SOLAR_INTEGRATION_ADDRESS);

  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("Burner address:", deployer.address);

  // Get contracts
  const solarToken = await hre.ethers.getContractAt("IERC20", SOLAR_TOKEN);
  const solarIntegration = await hre.ethers.getContractAt("SolarTokenIntegration", SOLAR_INTEGRATION_ADDRESS);

  // Check balances
  console.log("\n📊 Pre-burn Status:");
  const solarBalance = await solarToken.balanceOf(deployer.address);
  const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("Your SOLAR balance:", hre.ethers.formatEther(solarBalance), "SOLAR");
  console.log("Your ETH balance:", hre.ethers.formatEther(ethBalance), "ETH");
  console.log("Burn amount:", hre.ethers.formatEther(BURN_AMOUNT), "SOLAR");
  
  // Check ETH balance for gas
  const minEthBalance = hre.ethers.parseEther("0.002"); // 0.002 ETH minimum for gas
  if (ethBalance < minEthBalance) {
    console.error("❌ Insufficient ETH balance for gas fees");
    console.error("Required:", hre.ethers.formatEther(minEthBalance), "ETH");
    console.error("Current:", hre.ethers.formatEther(ethBalance), "ETH");
    console.error("\n💰 Please send ETH to:", deployer.address);
    process.exit(1);
  }
  
  // Check SOLAR balance for burn
  if (solarBalance < BURN_AMOUNT) {
    console.error("❌ Insufficient SOLAR balance for burn");
    console.error("Required:", hre.ethers.formatEther(BURN_AMOUNT), "SOLAR");
    console.error("Current:", hre.ethers.formatEther(solarBalance), "SOLAR");
    console.error("\n🌟 Please send SOLAR tokens to:", deployer.address);
    console.error("SOLAR Token Contract:", SOLAR_TOKEN);
    process.exit(1);
  }

  // Get current stats
  const statsBefore = await solarIntegration.getStats();
  console.log("Total burned before:", hre.ethers.formatEther(statsBefore[1]), "SOLAR");
  console.log("Burn events before:", statsBefore[2].toString());

  // Approve the burn
  console.log("\n🔓 Approving SOLAR for burn...");
  const approveTx = await solarToken.approve(SOLAR_INTEGRATION_ADDRESS, BURN_AMOUNT);
  await approveTx.wait();
  console.log("✅ Approval confirmed:", approveTx.hash);

  // Execute the strategic burn
  console.log("\n🔥 Executing strategic burn...");
  const burnTx = await solarIntegration.emergencyBurn(
    BURN_AMOUNT, 
    "Strategic SOLAR burn - Awakening cosmic utility"
  );
  
  console.log("🔄 Burn transaction submitted:", burnTx.hash);
  const receipt = await burnTx.wait();
  console.log("✅ Burn confirmed in block:", receipt.blockNumber);

  // Get updated stats
  console.log("\n📊 Post-burn Status:");
  const statsAfter = await solarIntegration.getStats();
  console.log("Total burned after:", hre.ethers.formatEther(statsAfter[1]), "SOLAR");
  console.log("Burn events after:", statsAfter[2].toString());
  
  const newBalance = await solarToken.balanceOf(deployer.address);
  console.log("Your remaining balance:", hre.ethers.formatEther(newBalance), "SOLAR");

  // Calculate impact
  const totalSupply = hre.ethers.parseEther("100000000000"); // 100B SOLAR
  const burnedAmount = statsAfter[1];
  const percentageBurned = (Number(burnedAmount) / Number(totalSupply)) * 100;
  
  console.log("\n🎯 Burn Impact:");
  console.log("Amount burned:", hre.ethers.formatEther(burnedAmount), "SOLAR");
  console.log("Percentage of supply:", percentageBurned.toFixed(2), "%");
  console.log("Remaining supply:", hre.ethers.formatEther(totalSupply - burnedAmount), "SOLAR");

  // Generate social media post
  console.log("\n📱 Social Media Announcement:");
  console.log("=".repeat(60));
  console.log("🔥 MAJOR SOLAR TOKEN BURN COMPLETE 🔥");
  console.log("");
  console.log(`🌟 ${hre.ethers.formatEther(burnedAmount)} SOLAR tokens permanently removed from supply`);
  console.log(`📊 ${percentageBurned.toFixed(2)}% of total supply burned`);
  console.log(`🚀 SOLAR awakens with real utility in the Solara ecosystem`);
  console.log("");
  console.log("Premium features now live:");
  console.log("• Advanced Solar Analytics");
  console.log("• Custom Cosmic Milestones");
  console.log("• Priority Support");
  console.log("• API Access");
  console.log("");
  console.log(`Tx: ${burnTx.hash}`);
  console.log("#SOLAR #Solara #DeFi #TokenBurn");
  console.log("=".repeat(60));

  // Log next steps
  console.log("\n📋 Next Steps:");
  console.log("1. 📢 Announce burn on social media");
  console.log("2. 🎯 Launch premium features requiring SOLAR");
  console.log("3. 📊 Monitor price action and community response");
  console.log("4. 🔄 Prepare for next phase (staking launch)");
  
  // Save burn record
  const fs = require('fs');
  const burnRecord = {
    network: hre.network.name,
    burnAmount: hre.ethers.formatEther(BURN_AMOUNT),
    burnHash: burnTx.hash,
    blockNumber: receipt.blockNumber,
    timestamp: new Date().toISOString(),
    totalBurnedAfter: hre.ethers.formatEther(statsAfter[1]),
    percentageBurned: percentageBurned,
    burnerAddress: deployer.address
  };
  
  fs.writeFileSync(
    `burn-record-${Date.now()}.json`, 
    JSON.stringify(burnRecord, null, 2)
  );
  
  console.log("\n✅ Burn record saved to burn-record-*.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Burn failed:", error);
    process.exit(1);
  });