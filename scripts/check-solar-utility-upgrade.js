const hre = require("hardhat");

async function main() {
  const contractAddress = "0x34cc7F26248F5E6D6a8B0C8d550E69bC6E51B6B0"; // SolarUtility
  
  console.log(`Checking SolarUtility contract at: ${contractAddress}`);
  
  // Get provider
  const [signer] = await hre.ethers.getSigners();
  const provider = signer.provider;
  
  // Check if contract exists
  const code = await provider.getCode(contractAddress);
  if (code === "0x") {
    console.log("No contract found at this address");
    return;
  }
  
  console.log("Contract exists, checking for proxy patterns...");
  
  // Common proxy storage slots
  const proxySlots = [
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc", // EIP-1967 implementation slot
    "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103", // EIP-1967 admin slot
    "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3"  // OpenZeppelin proxy admin slot
  ];
  
  let isProxy = false;
  
  for (const slot of proxySlots) {
    try {
      const value = await provider.getStorage(contractAddress, slot);
      if (value !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        console.log(`Found proxy data in slot ${slot}: ${value}`);
        isProxy = true;
      }
    } catch (error) {
      console.log(`Error checking slot ${slot}:`, error.message);
    }
  }
  
  if (isProxy) {
    console.log("✅ Contract appears to be upgradeable (proxy pattern detected)");
  } else {
    console.log("❌ Contract does not appear to be upgradeable (no proxy pattern found)");
  }
  
  // Check bytecode patterns for upgrade functions
  const bytecode = await provider.getCode(contractAddress);
  const upgradeSignatures = [
    "3659cfe6", // upgradeTo(address)
    "4f1ef286", // upgradeToAndCall(address,bytes)
    "8f283970", // changeAdmin(address)
    "f851a440"  // admin()
  ];
  
  console.log("\nChecking for upgrade function signatures in bytecode...");
  let hasUpgradeFunctions = false;
  
  for (const sig of upgradeSignatures) {
    if (bytecode.toLowerCase().includes(sig)) {
      console.log(`Found upgrade function signature: 0x${sig}`);
      hasUpgradeFunctions = true;
    }
  }
  
  if (!hasUpgradeFunctions) {
    console.log("No upgrade function signatures found in bytecode");
  }
  
  // Check the contract's constructor and inheritance
  console.log("\nChecking contract inheritance...");
  try {
    const contract = await hre.ethers.getContractAt("SolarUtility", contractAddress);
    console.log("Successfully connected to SolarUtility contract");
    
    // Check if it has owner function (from Ownable)
    try {
      const owner = await contract.owner();
      console.log(`Contract owner: ${owner}`);
    } catch (e) {
      console.log("No owner() function found");
    }
    
  } catch (error) {
    console.log("Could not connect to contract as SolarUtility");
  }
  
  console.log("\n" + "=".repeat(50));
  if (isProxy || hasUpgradeFunctions) {
    console.log("✅ SOLARUTILITY CONTRACT APPEARS TO BE UPGRADEABLE");
    console.log("You can potentially upgrade this contract to add pledging functionality");
  } else {
    console.log("❌ SOLARUTILITY CONTRACT IS NOT UPGRADEABLE");
    console.log("You need to deploy a new contract with pledging functionality");
    console.log("Options:");
    console.log("1. Deploy new SolarUtilityV2 with pledging + premium features");
    console.log("2. Keep current contract for premium features, deploy separate pledging contract");
    console.log("3. Create a master contract that coordinates both systems");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});