require('dotenv').config({ path: '../.env' });

const hre = require("hardhat");

async function main() {
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
  const solarAddress = process.env.NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS;
  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;

  if (!usdcAddress || !solarAddress || !treasuryAddress) {
    throw new Error("Please set NEXT_PUBLIC_USDC_ADDRESS, NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS, and NEXT_PUBLIC_TREASURY_ADDRESS in your environment.");
  }

  const USDCPurchaser = await hre.ethers.getContractFactory("USDCPurchaser");
  const purchaser = await USDCPurchaser.deploy(usdcAddress, solarAddress, treasuryAddress);

  // Wait for deployment
  await purchaser.waitForDeployment();

  console.log("USDCPurchaser deployed to:", purchaser.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 