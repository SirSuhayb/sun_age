const hre = require("hardhat");

async function main() {
  const solarPledgeAddress = "0x860434EA4e4114B63F44C70a304fa3eD2B32E77c";
  
  console.log(`🔍 Examining SolarPledge contract at: ${solarPledgeAddress}`);
  
  // Get provider
  const [signer] = await hre.ethers.getSigners();
  const provider = signer.provider;
  
  // Check if contract exists
  const code = await provider.getCode(solarPledgeAddress);
  if (code === "0x") {
    console.log("No contract found at this address");
    return;
  }
  
  console.log("✅ Contract exists on Base mainnet");
  console.log(`📄 Bytecode length: ${code.length} characters`);
  
  // Try to connect using the existing ABI from our frontend
  try {
    // Use the SolarPledgeABI from our frontend code
    const SolarPledgeABI = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_usdcToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_treasuryAddress",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_pledger",
            "type": "address"
          }
        ],
        "name": "getPledge",
        "outputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "pledger",
                "type": "address"
              },
              {
                "internalType": "uint96",
                "name": "pledgeNumber",
                "type": "uint96"
              },
              {
                "internalType": "uint96",
                "name": "pledgeTimestamp",
                "type": "uint96"
              },
              {
                "internalType": "uint128",
                "name": "usdcPaid",
                "type": "uint128"
              },
              {
                "internalType": "uint128",
                "name": "surplusAmount",
                "type": "uint128"
              },
              {
                "internalType": "uint64",
                "name": "solarAge",
                "type": "uint64"
              },
              {
                "internalType": "bytes32",
                "name": "commitmentHash",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "farcasterHandle",
                "type": "bytes32"
              },
              {
                "internalType": "string",
                "name": "commitmentText",
                "type": "string"
              },
              {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
              }
            ],
            "internalType": "struct SolarPledge.Pledge",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_user",
            "type": "address"
          }
        ],
        "name": "hasPledge",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_commitment",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "_farcasterHandle",
            "type": "bytes32"
          },
          {
            "internalType": "uint128",
            "name": "_pledgeAmount",
            "type": "uint128"
          }
        ],
        "name": "createPledge",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_user",
            "type": "address"
          }
        ],
        "name": "userBirthTimestamp",
        "outputs": [
          {
            "internalType": "uint96",
            "name": "",
            "type": "uint96"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint96",
            "name": "_birthTimestamp",
            "type": "uint96"
          }
        ],
        "name": "setBirthDate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    
    const solarPledge = await hre.ethers.getContractAt(SolarPledgeABI, solarPledgeAddress);
    console.log("✅ Successfully connected to SolarPledge contract");
    
    // Try to read some basic info
    console.log("\n📊 Testing contract functions...");
    
    // Test with a sample address (deployer address)
    const testAddress = "0xECA1043ecB95d7cec532709D64c3078b7CC8E167";
    
    try {
      const hasPledge = await solarPledge.hasPledge(testAddress);
      console.log(`📝 Has pledge (${testAddress}): ${hasPledge}`);
      
      if (hasPledge) {
        const pledge = await solarPledge.getPledge(testAddress);
        console.log(`💰 Pledge amount: ${hre.ethers.formatUnits(pledge.usdcPaid, 6)} USDC`);
        console.log(`🌞 Solar age: ${pledge.solarAge} days`);
        console.log(`📝 Commitment: ${pledge.commitmentText}`);
        console.log(`⏰ Pledge time: ${new Date(Number(pledge.pledgeTimestamp) * 1000).toISOString()}`);
      }
      
      const birthTimestamp = await solarPledge.userBirthTimestamp(testAddress);
      if (birthTimestamp > 0) {
        console.log(`🎂 Birth date: ${new Date(Number(birthTimestamp) * 1000).toISOString()}`);
      } else {
        console.log(`🎂 No birth date set`);
      }
      
    } catch (error) {
      console.log(`❌ Error calling functions: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Error connecting to contract: ${error.message}`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("🎯 SOLARPLEDGE CONTRACT ANALYSIS");
  console.log("=".repeat(60));
  console.log("📋 Current Functions Identified:");
  console.log("   - createPledge(commitment, farcasterHandle, pledgeAmount)");
  console.log("   - getPledge(address) -> Pledge struct");  
  console.log("   - hasPledge(address) -> bool");
  console.log("   - setBirthDate(timestamp)");
  console.log("   - userBirthTimestamp(address) -> timestamp");
  console.log("");
  console.log("📊 Pledge Structure:");
  console.log("   - pledger: address");
  console.log("   - pledgeNumber: uint96");
  console.log("   - pledgeTimestamp: uint96");
  console.log("   - usdcPaid: uint128 (amount paid in USDC)");
  console.log("   - surplusAmount: uint128");
  console.log("   - solarAge: uint64 (days)");
  console.log("   - commitmentHash: bytes32");
  console.log("   - farcasterHandle: bytes32");
  console.log("   - commitmentText: string (the actual vow)");
  console.log("   - isActive: bool");
  console.log("");
  console.log("🎯 Integration Strategy:");
  console.log("   1. Keep current SolarPledge for existing users");
  console.log("   2. Create SolarPledgeV2 with Renaissance integration:");
  console.log("      - Same pledge functionality");
  console.log("      - Routes USDC to MorphoTreasury (50/50 split)");
  console.log("      - Integrates with burn mechanisms");
  console.log("      - Maintains solar age calculations");
  console.log("      - Premium features unlock based on pledge amounts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});