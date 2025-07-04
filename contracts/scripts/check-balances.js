const hre = require("hardhat");

async function main() {
  console.log("💰 Checking Deployment Wallet Balances...\n");

  // Contract addresses
  const SOLAR_TOKEN = "0x746042147240304098c837563aaec0f671881b07";
  
  // Get signer (deployment wallet)
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("🔍 Wallet Information:");
  console.log("Address:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("=".repeat(50));

  try {
    // Check ETH balance
    const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
    const ethFormatted = hre.ethers.formatEther(ethBalance);
    
    console.log("�� ETH Balance:", ethFormatted, "ETH");
    
    // ETH requirements check
    const minEthForDeployment = hre.ethers.parseEther("0.005");
    const recommendedEth = hre.ethers.parseEther("0.015");
    
    console.log("\n📊 ETH Requirements:");
    console.log("Minimum for deployment:", hre.ethers.formatEther(minEthForDeployment), "ETH");
    console.log("Recommended total:", hre.ethers.formatEther(recommendedEth), "ETH");
    
    if (ethBalance >= recommendedEth) {
      console.log("✅ ETH balance is sufficient");
    } else if (ethBalance >= minEthForDeployment) {
      console.log("⚠️  ETH balance is minimum - consider adding more");
    } else {
      console.log("❌ ETH balance too low for deployment");
    }

  } catch (error) {
    console.error("❌ Error checking ETH balance:", error.message);
  }

  try {
    // Check SOLAR balance
    const solarToken = await hre.ethers.getContractAt("IERC20", SOLAR_TOKEN);
    const solarBalance = await solarToken.balanceOf(deployer.address);
    const solarFormatted = hre.ethers.formatEther(solarBalance);
    
    console.log("\n🌟 SOLAR Balance:", Number(solarFormatted).toLocaleString(), "SOLAR");
    
    // SOLAR requirements check
    const burnAmount = hre.ethers.parseEther("2000000000"); // 2B SOLAR
    
    console.log("\n📊 SOLAR Requirements:");
    console.log("Required for burn:", "2,000,000,000 SOLAR");
    
    if (solarBalance >= burnAmount) {
      console.log("✅ SOLAR balance is sufficient");
    } else {
      console.log("❌ SOLAR balance too low for strategic burn");
      console.log("Need:", hre.ethers.formatEther(burnAmount - solarBalance), "more SOLAR");
    }

  } catch (error) {
    console.error("❌ Error checking SOLAR balance:", error.message);
  }

  // Overall readiness check
  console.log("\n" + "=".repeat(50));
  console.log("🎯 Deployment Readiness Check:");
  
  const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
  const solarToken = await hre.ethers.getContractAt("IERC20", SOLAR_TOKEN);
  const solarBalance = await solarToken.balanceOf(deployer.address);
  
  const minEth = hre.ethers.parseEther("0.005");
  const minSolar = hre.ethers.parseEther("2000000000");
  
  const ethReady = ethBalance >= minEth;
  const solarReady = solarBalance >= minSolar;
  
  console.log("ETH for deployment:", ethReady ? "✅ Ready" : "❌ Need more ETH");
  console.log("SOLAR for burn:", solarReady ? "✅ Ready" : "❌ Need more SOLAR");
  
  if (ethReady && solarReady) {
    console.log("\n🚀 ALL SYSTEMS GO! Ready for deployment!");
  } else {
    console.log("\n⏳ Not ready for deployment yet.");
    console.log("\nFunding instructions:");
    if (!ethReady) {
      console.log("�� Send ETH to:", deployer.address);
    }
    if (!solarReady) {
      console.log("🌟 Send SOLAR to:", deployer.address);
      console.log("   Amount: 2,000,000,000 SOLAR");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error checking balances:", error);
    process.exit(1);
  });
