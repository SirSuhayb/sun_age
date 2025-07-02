const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying SOLAR Renaissance contracts to ${network}...`);
  
  // Network configurations (using proper checksummed addresses)
  const config = {
    "base": {
      usdc: hre.ethers.getAddress("0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"),
      solar: hre.ethers.getAddress("0x746042147240304098c837563aaec0f671881b07"), // From env file
      morpho: hre.ethers.getAddress("0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb"),
      owner: hre.ethers.getAddress("0xECA1043ecB95d7cec532709D64c3078b7CC8E167") // Deployment wallet
    },
    "base-sepolia": {
      usdc: hre.ethers.getAddress("0x8a04d904055528a69f3e4594dda308a31aeb8457"), 
      solar: hre.ethers.getAddress("0x746042147240304098c837563aaec0f671881b07"), // From env file
      morpho: hre.ethers.getAddress("0x0000000000000000000000000000000000000000"), // Mock for testnet
      owner: hre.ethers.getAddress("0xECA1043ecB95d7cec532709D64c3078b7CC8E167")
    }
  };
  
  const networkConfig = config[network] || config["base-sepolia"];
  
  console.log(`📋 Configuration:`);
  console.log(`  - USDC: ${networkConfig.usdc}`);
  console.log(`  - SOLAR: ${networkConfig.solar}`);
  console.log(`  - Morpho: ${networkConfig.morpho}`);
  console.log(`  - Owner: ${networkConfig.owner}`);
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`\n👤 Deploying from: ${deployerAddress}`);
  
  // Check balances
  const ethBalance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log(`💰 ETH Balance: ${hre.ethers.formatEther(ethBalance)} ETH`);
  
  // Deploy MorphoTreasury first
  console.log(`\n🏛️  Deploying MorphoTreasury...`);
  const MorphoTreasury = await hre.ethers.getContractFactory("MorphoTreasury");
  const morphoTreasury = await MorphoTreasury.deploy(
    networkConfig.usdc,
    networkConfig.solar,
    networkConfig.morpho,
    networkConfig.owner
  );
  await morphoTreasury.waitForDeployment();
  const morphoTreasuryAddress = await morphoTreasury.getAddress();
  console.log(`✅ MorphoTreasury deployed: ${morphoTreasuryAddress}`);
  
  // Deploy SolarUtility
  console.log(`\n⚡ Deploying SolarUtility...`);
  const SolarUtility = await hre.ethers.getContractFactory("SolarUtility");
  const solarUtility = await SolarUtility.deploy(); // No constructor arguments
  await solarUtility.waitForDeployment();
  const solarUtilityAddress = await solarUtility.getAddress();
  console.log(`✅ SolarUtility deployed: ${solarUtilityAddress}`);
  
  // Configure contracts
  console.log(`\n🔗 Connecting contracts...`);
  
  // Set treasury addresses in SolarUtility
  await solarUtility.setMorphoTreasuryContract(morphoTreasuryAddress);
  console.log(`✅ Morpho treasury set in SolarUtility`);
  
  // Set company treasury (using deployer address for now)
  await solarUtility.setCompanyTreasuryContract(networkConfig.owner);
  console.log(`✅ Company treasury set in SolarUtility`);
  
  // Execute strategic burn if we have SOLAR tokens
  console.log(`\n🔥 Checking for strategic burn...`);
  try {
    const solarContract = await hre.ethers.getContractAt("IERC20", networkConfig.solar);
    const solarBalance = await solarContract.balanceOf(deployerAddress);
    const burnAmount = hre.ethers.parseEther("2100000000"); // 2.1B SOLAR
    
    console.log(`💎 SOLAR Balance: ${hre.ethers.formatEther(solarBalance)} SOLAR`);
    
    if (solarBalance >= burnAmount) {
      console.log(`🔥 Executing strategic burn of 2.1B SOLAR...`);
      
      // First approve the burn amount to the utility contract
      await solarContract.approve(solarUtilityAddress, burnAmount);
      console.log(`✅ Approved ${hre.ethers.formatEther(burnAmount)} SOLAR for burning`);
      
      // Execute the burn through the utility contract
      await solarUtility.executeStrategicBurn(burnAmount);
      console.log(`🔥 Strategic burn executed! 2.1B SOLAR permanently removed from supply`);
      
      const newBalance = await solarContract.balanceOf(deployerAddress);
      console.log(`💎 New SOLAR Balance: ${hre.ethers.formatEther(newBalance)} SOLAR`);
    } else {
      console.log(`⚠️  Insufficient SOLAR for strategic burn. Need: ${hre.ethers.formatEther(burnAmount)}, Have: ${hre.ethers.formatEther(solarBalance)}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not execute strategic burn:`, error.message);
  }
  
  // Display summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎉 SOLAR RENAISSANCE DEPLOYMENT COMPLETE!`);
  console.log(`${"=".repeat(60)}`);
  console.log(`📊 Deployed Contracts:`);
  console.log(`   🏛️  MorphoTreasury: ${morphoTreasuryAddress}`);
  console.log(`   ⚡ SolarUtility:   ${solarUtilityAddress}`);
  console.log(`\n🎯 What's Next:`);
  console.log(`   1. 💰 Revenue from premium features flows to Morpho for yield`);
  console.log(`   2. 📈 50% of yield goes to community benefits (burns, staking, airdrops)`);
  console.log(`   3. 🔥 Quarterly burns create deflationary pressure`);
  console.log(`   4. 💎 Premium features gate access with SOLAR holdings`);
  console.log(`\n💪 The SOLAR Renaissance has begun!`);
  
  // Verification
  if (network !== "hardhat" && network !== "localhost") {
    console.log(`\n🔍 Verifying contracts on ${network === "base" ? "Base" : "Base Sepolia"}scan...`);
    
    try {
      console.log(`Verifying MorphoTreasury...`);
      await hre.run("verify:verify", {
        address: morphoTreasuryAddress,
        constructorArguments: [
          networkConfig.usdc,
          networkConfig.solar,
          networkConfig.morpho,
          networkConfig.owner
        ],
      });
      console.log(`✅ MorphoTreasury verified`);
    } catch (error) {
      console.log(`❌ MorphoTreasury verification failed:`, error.message);
    }
    
    try {
      console.log(`Verifying SolarUtility...`);
      await hre.run("verify:verify", {
        address: solarUtilityAddress,
        constructorArguments: [
          networkConfig.usdc,
          networkConfig.solar,
          morphoTreasuryAddress,
          networkConfig.owner
        ],
      });
      console.log(`✅ SolarUtility verified`);
    } catch (error) {
      console.log(`❌ SolarUtility verification failed:`, error.message);
    }
  }
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:", error);
  process.exitCode = 1;
}); 