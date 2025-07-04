const hre = require("hardhat");

async function main() {
  console.log("💰 Checking Deployment Wallet Balances...\n");

  const SOLAR_TOKEN = "0x746042147240304098c837563aaec0f671881b07";
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("🔍 Wallet Information:");
  console.log("Address:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("=".repeat(50));

  try {
    // Check ETH balance
    const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
    const ethFormatted = hre.ethers.formatEther(ethBalance);
    
    console.log("💎 ETH Balance:", ethFormatted, "ETH");
    
    const minEth = hre.ethers.parseEther("0.005");
    
    if (ethBalance >= minEth) {
      console.log("✅ ETH balance is sufficient for deployment");
    } else {
      console.log("❌ Need more ETH for deployment");
    }

  } catch (error) {
    console.error("❌ Error checking ETH balance:", error.message);
  }

  try {
    // Check SOLAR balance using direct contract call
    const balanceOfSignature = "0x70a08231"; // balanceOf(address)
    const paddedAddress = hre.ethers.zeroPadValue(deployer.address, 32);
    const callData = balanceOfSignature + paddedAddress.slice(2);
    
    const result = await hre.ethers.provider.call({
      to: SOLAR_TOKEN,
      data: callData
    });
    
    const solarBalance = BigInt(result);
    const solarFormatted = hre.ethers.formatEther(solarBalance);
    
    console.log("\n🌟 SOLAR Balance:", Number(solarFormatted).toLocaleString(), "SOLAR");
    
    const burnAmount = hre.ethers.parseEther("2000000000"); // 2B SOLAR
    
    if (solarBalance >= burnAmount) {
      console.log("✅ SOLAR balance is sufficient for burn");
    } else {
      console.log("❌ Need more SOLAR for burn");
      console.log("Required: 2,000,000,000 SOLAR");
    }

  } catch (error) {
    console.error("❌ Error checking SOLAR balance:", error.message);
  }

  const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
  const minEth = hre.ethers.parseEther("0.005");
  
  console.log("\n" + "=".repeat(50));
  if (ethBalance >= minEth) {
    console.log("🚀 ETH READY! You can proceed with deployment");
    console.log("📧 Send 2.1B SOLAR to:", deployer.address);
  } else {
    console.log("⏳ Send more ETH to:", deployer.address);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
