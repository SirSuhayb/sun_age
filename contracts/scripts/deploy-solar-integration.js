const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SOLAR Token Integration to Base...");

  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Verify minimum balance for deployment
  const minBalance = hre.ethers.parseEther("0.005"); // 0.005 ETH minimum
  if (balance < minBalance) {
    console.error("❌ Insufficient ETH balance for deployment");
    console.error("Required:", hre.ethers.formatEther(minBalance), "ETH");
    console.error("Current:", hre.ethers.formatEther(balance), "ETH");
    console.error("\n💰 Please send ETH to:", deployer.address);
    process.exit(1);
  }

  // Deploy SolarTokenIntegration
  console.log("\n📝 Deploying SolarTokenIntegration contract...");
  const SolarTokenIntegration = await hre.ethers.getContractFactory("SolarTokenIntegration");
  
  const solarIntegration = await SolarTokenIntegration.deploy();
  await solarIntegration.waitForDeployment();
  
  const contractAddress = await solarIntegration.getAddress();
  console.log("✅ SolarTokenIntegration deployed to:", contractAddress);

  // Wait for a few blocks to ensure deployment is confirmed
  console.log("\n⏳ Waiting for deployment confirmation...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

  // Verify contract on Basescan
  console.log("\n🔍 Verifying contract on Basescan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }

  // Get contract stats
  console.log("\n📊 Getting contract stats...");
  try {
    const stats = await solarIntegration.getStats();
    console.log("Total SOLAR Supply:", hre.ethers.formatEther(stats[0]), "SOLAR");
    console.log("Total Burned:", hre.ethers.formatEther(stats[1]), "SOLAR");
    console.log("Burn Events:", stats[2].toString());
    
    // Get feature requirements
    const features = await solarIntegration.getAllFeatureRequirements();
    console.log("\n🎯 Feature Requirements:");
    for (let i = 0; i < features[0].length; i++) {
      const featureName = hre.ethers.decodeBytes32String(features[0][i]);
      const requirement = hre.ethers.formatEther(features[1][i]);
      console.log(`  ${featureName}: ${requirement} SOLAR`);
    }
  } catch (error) {
    console.error("❌ Error getting stats:", error.message);
  }

  // Check SOLAR token
  console.log("\n🌟 Checking SOLAR token...");
  const SOLAR_TOKEN = "0x746042147240304098c837563aaec0f671881b07";
  const solarToken = await hre.ethers.getContractAt("IERC20", SOLAR_TOKEN);
  
  try {
    const deployerBalance = await solarToken.balanceOf(deployer.address);
    console.log("Deployer SOLAR balance:", hre.ethers.formatEther(deployerBalance), "SOLAR");
    
    if (deployerBalance > 0) {
      console.log("\n💡 Ready for strategic burn! Use the burn script next.");
    }
  } catch (error) {
    console.error("❌ Error checking SOLAR balance:", error.message);
  }

  console.log("\n🎉 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("SolarTokenIntegration:", contractAddress);
  console.log("SOLAR Token:", SOLAR_TOKEN);
  console.log("Deployer:", deployer.address);
  console.log("Network:", hre.network.name);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Execute strategic burn: npx hardhat run scripts/execute-burn.js --network base");
  console.log("2. Update frontend with contract address");
  console.log("3. Test premium feature access");
  console.log("4. Announce SOLAR integration to community");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    solarTokenAddress: SOLAR_TOKEN
  };
  
  fs.writeFileSync(
    `deployment-${hre.network.name}-${Date.now()}.json`, 
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });