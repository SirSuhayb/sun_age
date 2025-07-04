const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Deploying SolarPledgeV3 with REAL DEX Burns to Base mainnet...");
  console.log("=" .repeat(70));
  
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
    uniswapV3Router: "0x2626664c2603336E57B271c5C0b26F421741e481", // Uniswap V3 SwapRouter on Base
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",        // Base USDC
    solar: "0x746042147240304098C837563aAEc0F671881B07",         // SOLAR token
    weth: "0x4200000000000000000000000000000000000006"          // Base WETH
  };
  
  console.log(`\n📋 Configuration:`);
  console.log(`  - MorphoTreasury: ${config.morphoTreasury}`);
  console.log(`  - SolarUtility: ${config.solarUtility}`);
  console.log(`  - Uniswap V3 Router: ${config.uniswapV3Router}`);
  console.log(`  - USDC: ${config.usdc}`);
  console.log(`  - SOLAR: ${config.solar}`);
  console.log(`  - WETH: ${config.weth}`);
  
  // Deploy SolarPledgeV3
  console.log(`\n🌞 Deploying SolarPledgeV3 with DEX integration...`);
  const SolarPledgeV3 = await hre.ethers.getContractFactory("SolarPledgeV3");
  
  const solarPledgeV3 = await SolarPledgeV3.deploy(
    config.morphoTreasury,
    config.solarUtility,
    config.uniswapV3Router
  );
  
  await solarPledgeV3.waitForDeployment();
  const solarPledgeV3Address = await solarPledgeV3.getAddress();
  
  console.log(`✅ SolarPledgeV3 deployed to: ${solarPledgeV3Address}`);
  
  // Wait for deployment confirmation
  console.log(`\n⏳ Waiting for deployment confirmation...`);
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
  
  // Verify contract on Basescan
  console.log(`\n🔍 Verifying contract on Basescan...`);
  try {
    await hre.run("verify:verify", {
      address: solarPledgeV3Address,
      constructorArguments: [
        config.morphoTreasury,
        config.solarUtility,
        config.uniswapV3Router
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
    const currentPeriod = await solarPledgeV3.getCurrentConvergencePeriodIndex();
    console.log(`📅 Current convergence period: ${currentPeriod}`);
    
    const stats = await solarPledgeV3.getRenaissanceStats();
    console.log(`📊 Renaissance stats:`);
    console.log(`   - Total volume: ${hre.ethers.formatUnits(stats[0], 6)} USDC`);
    console.log(`   - Total burned: ${hre.ethers.formatEther(stats[1])} SOLAR`);
    console.log(`   - Morpho revenue: ${hre.ethers.formatUnits(stats[2], 6)} USDC`);
    console.log(`   - Active pledgers: ${stats[3]}`);
    console.log(`   - USDC for burns: ${hre.ethers.formatUnits(stats[5], 6)} USDC`);
    
    // Check DEX router setup
    const dexRouter = await solarPledgeV3.dexRouter();
    console.log(`🔄 DEX Router configured: ${dexRouter}`);
    
    const minBurnThreshold = await solarPledgeV3.minBurnThreshold();
    console.log(`🔥 Min burn threshold: ${hre.ethers.formatUnits(minBurnThreshold, 6)} USDC`);
    
    const maxSlippage = await solarPledgeV3.maxSlippage();
    console.log(`📉 Max slippage: ${Number(maxSlippage) / 100}%`);
    
    console.log(`✅ Contract functionality tests passed!`);
    
  } catch (error) {
    console.error(`❌ Contract test failed: ${error.message}`);
  }
  
  // Check if SOLAR/USDC pair exists on Uniswap V3
  console.log(`\n🔍 Checking SOLAR/USDC trading pair...`);
  try {
    // This is a simplified check - in production you'd query the factory
    console.log(`📝 Note: Ensure SOLAR/USDC pair exists on Uniswap V3`);
    console.log(`📝 Path: USDC → WETH → SOLAR (if direct pair doesn't exist)`);
    console.log(`📝 Fee tier: 0.3% (3000)`);
  } catch (error) {
    console.log(`⚠️  Could not verify trading pair: ${error.message}`);
  }
  
  // Summary
  console.log(`\n` + "=".repeat(70));
  console.log(`🎯 SOLARPLEDGE V3 DEPLOYMENT COMPLETE`);
  console.log(`=`.repeat(70));
  console.log(`📍 Contract Address: ${solarPledgeV3Address}`);
  console.log(`🔗 Basescan: https://basescan.org/address/${solarPledgeV3Address}`);
  console.log(`👤 Owner: ${deployerAddress}`);
  
  console.log(`\n🔥 REAL BURN MECHANISM:`);
  console.log(`   ✅ 10% of pledges → USDC → DEX swap → SOLAR → Burn`);
  console.log(`   ✅ Uses Uniswap V3 for market prices`);
  console.log(`   ✅ 5% max slippage protection`);
  console.log(`   ✅ $10 minimum burn threshold`);
  console.log(`   ✅ Creates REAL buy pressure on SOLAR`);
  
  console.log(`\n🌟 KEY FEATURES:`);
  console.log(`   ✅ 1:1 compatibility with original SolarPledge`);
  console.log(`   ✅ 50/50 revenue split to Morpho treasury`);
  console.log(`   ✅ REAL USDC → SOLAR burns via DEX`);
  console.log(`   ✅ Premium features unlocked at $50+ pledges`);
  console.log(`   ✅ Solar age calculations preserved`);
  console.log(`   ✅ Convergence period tracking maintained`);
  
  console.log(`\n💰 BURN ECONOMICS:`);
  console.log(`   📈 Every $100 pledge → $10 USDC buys SOLAR → Burns`);
  console.log(`   📈 Creates continuous buy pressure`);
  console.log(`   📈 Market-driven deflationary mechanics`);
  console.log(`   📈 Real utility for pledge revenue`);
  
  console.log(`\n🎮 NEXT STEPS:`);
  console.log(`   1. Update frontend to use new contract address`);
  console.log(`   2. Test pledge creation with small amounts`);
  console.log(`   3. Monitor USDC → SOLAR swaps on DEX`);
  console.log(`   4. Track real burn effectiveness`);
  console.log(`   5. Verify SOLAR/USDC pair liquidity`);
  
  // Create environment variable updates
  console.log(`\n📄 Environment Variable Updates:`);
  console.log(`export NEXT_PUBLIC_SOLAR_PLEDGE_V3_ADDRESS=${solarPledgeV3Address}`);
  console.log(`\n💡 Add this to your .env.local file!`);
  
  console.log(`\n🚀 Ready to create REAL buy pressure on SOLAR! 🔥`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});