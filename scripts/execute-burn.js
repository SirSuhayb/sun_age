const hre = require("hardhat");

async function main() {
  console.log("🔥 Executing Strategic SOLAR Burn...");
  
  const solarUtilityAddress = "0x34cc7F26248F5E6D6a8B0C8d550E69bC6E51B6B0";
  const burnAmount = hre.ethers.parseEther("2100000000"); // 2.1B SOLAR
  
  console.log(`Contract: ${solarUtilityAddress}`);
  console.log(`Burn Amount: ${hre.ethers.formatEther(burnAmount)} SOLAR`);
  
  const solarUtility = await hre.ethers.getContractAt("SolarUtility", solarUtilityAddress);
  
  console.log("Executing strategic burn...");
  const tx = await solarUtility.strategicBurn(burnAmount, "SOLAR Renaissance Launch - Strategic Burn");
  
  console.log(`🔥 Burn transaction submitted: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  
  console.log(`✅ Strategic burn executed successfully!`);
  console.log(`Block: ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  console.log(`🔥 2.1B SOLAR tokens permanently burned!`);
  console.log(`🚀 SOLAR Renaissance deflationary mechanism activated!`);
}

main().catch((error) => {
  console.error("❌ Burn execution failed:", error);
  process.exitCode = 1;
});