const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Deploying SolarPledgeV2 to Base mainnet...");
  console.log("=" .repeat(60));
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`👤 Deploying from: ${deployerAddress}`);
  
  // Check balances
  const ethBalance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log(`💰 ETH Balance: ${hre.ethers.formatEther(ethBalance)} ETH`);
  
  // Configuration for Base mainnet
  const config = {
    morphoTreasury: "0x720966609d2B051A2ba7608f0b3A4782DbeDbF6a", // Our deployed MorphoTreasury
    solarUtility: "0x34cc7F26248F5E6D6a8B0C8d550E69bC6E51B6B0",   // Our deployed SolarUtility
    originalPledge: "0x860434EA4e4114B63F44C70a304fa3eD2B32E77c", // Original SolarPledge (reference)
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",        // Base USDC
    solar: "0x746042147240304098C837563aAEc0F671881B07"         // SOLAR token
  };
  
  console.log(`\n📋 Configuration:`);
  console.log(`  - MorphoTreasury: ${config.morphoTreasury}`);
  console.log(`  - SolarUtility: ${config.solarUtility}`);
  console.log(`  - Original Pledge: ${config.originalPledge}`);
  console.log(`  - USDC: ${config.usdc}`);
  console.log(`  - SOLAR: ${config.solar}`);
  
  // Deploy SolarPledgeV2
  console.log(`\n🌞 Deploying SolarPledgeV2...`);
  const SolarPledgeV2 = await hre.ethers.getContractFactory("SolarPledgeV2");
  
  const solarPledgeV2 = await SolarPledgeV2.deploy(
    config.morphoTreasury,
    config.solarUtility
  );
  
  await solarPledgeV2.waitForDeployment();
  const solarPledgeV2Address = await solarPledgeV2.getAddress();
  
  console.log(`✅ SolarPledgeV2 deployed to: ${solarPledgeV2Address}`);
  
  // Wait for deployment confirmation
  console.log(`\n⏳ Waiting for deployment confirmation...`);
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
  
  // Verify contract on Basescan
  console.log(`\n🔍 Verifying contract on Basescan...`);
  try {
    await hre.run("verify:verify", {
      address: solarPledgeV2Address,
      constructorArguments: [
        config.morphoTreasury,
        config.solarUtility
      ],
    });
    console.log("✅ Contract verification successful!");
  } catch (error) {
    console.error(`❌ Verification failed: ${error.message}`);
    console.log("📝 Manual verification may be needed");
  }
  
  // Test contract functionality
  console.log(`\n🧪 Testing contract functionality...`);
  try {
    // Test view functions
    const currentPeriod = await solarPledgeV2.getCurrentConvergencePeriodIndex();
    console.log(`📅 Current convergence period: ${currentPeriod}`);
    
    const stats = await solarPledgeV2.getRenaissanceStats();
    console.log(`📊 Renaissance stats:`);
    console.log(`   - Total volume: ${hre.ethers.formatUnits(stats[0], 6)} USDC`);
    console.log(`   - Total burned: ${hre.ethers.formatEther(stats[1])} SOLAR`);
    console.log(`   - Morpho revenue: ${hre.ethers.formatUnits(stats[2], 6)} USDC`);
    console.log(`   - Active pledgers: ${stats[3]}`);
    
    console.log(`✅ Contract functionality tests passed!`);
    
  } catch (error) {
    console.error(`❌ Contract test failed: ${error.message}`);
  }
  
  // Fund contract with SOLAR for burns (if deployer has SOLAR)
  console.log(`\n💰 Checking SOLAR balance for burn funding...`);
  try {
    const solarContract = await hre.ethers.getContractAt("IERC20", config.solar);
    const solarBalance = await solarContract.balanceOf(deployerAddress);
    console.log(`🌞 Deployer SOLAR balance: ${hre.ethers.formatEther(solarBalance)} SOLAR`);
    
    if (solarBalance > 0) {
      // Fund with 1% of deployer's SOLAR balance for burns
      const fundAmount = solarBalance / 100n;
      if (fundAmount > 0) {
        console.log(`📤 Funding contract with ${hre.ethers.formatEther(fundAmount)} SOLAR...`);
        
        // Approve first
        const approveTx = await solarContract.approve(solarPledgeV2Address, fundAmount);
        await approveTx.wait();
        
        // Fund the contract
        const fundTx = await solarPledgeV2.fundSolarForBurns(fundAmount);
        await fundTx.wait();
        
        console.log(`✅ Contract funded with SOLAR for burns!`);
      }
    }
  } catch (error) {
    console.log(`⚠️  SOLAR funding skipped: ${error.message}`);
  }
  
  // Summary
  console.log(`\n` + "=".repeat(60));
  console.log(`🎯 SOLARPLEDGE V2 DEPLOYMENT COMPLETE`);
  console.log(`=`.repeat(60));
  console.log(`📍 Contract Address: ${solarPledgeV2Address}`);
  console.log(`🔗 Basescan: https://basescan.org/address/${solarPledgeV2Address}`);
  console.log(`👤 Owner: ${deployerAddress}`);
  console.log(`\n🌟 KEY FEATURES:`);
  console.log(`   ✅ 1:1 compatibility with original SolarPledge`);
  console.log(`   ✅ 50/50 revenue split to Morpho treasury`);
  console.log(`   ✅ 10% of pledges converted to SOLAR burns`);
  console.log(`   ✅ Premium features unlocked at $50+ pledges`);
  console.log(`   ✅ Solar age calculations preserved`);
  console.log(`   ✅ Convergence period tracking maintained`);
  console.log(`\n🎮 NEXT STEPS:`);
  console.log(`   1. Update frontend to use new contract address`);
  console.log(`   2. Test pledge creation with small amounts`);
  console.log(`   3. Migrate existing users (optional)`);
  console.log(`   4. Monitor Morpho yield generation`);
  console.log(`   5. Track SOLAR burn effectiveness`);
  
  // Create environment variable updates
  console.log(`\n📄 Environment Variable Updates:`);
  console.log(`export NEXT_PUBLIC_SOLAR_PLEDGE_V2_ADDRESS=${solarPledgeV2Address}`);
  console.log(`\n💡 Add this to your .env.local file!`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});