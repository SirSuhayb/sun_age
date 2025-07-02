const { ethers } = require("ethers");
const fs = require('fs');

async function generateNewWallet() {
  console.log("🔐 Generating new deployment wallet...\n");

  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log("✅ New Deployment Wallet Generated:");
  console.log("=".repeat(50));
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("Mnemonic:", wallet.mnemonic.phrase);
  console.log("=".repeat(50));
  
  // Create .env template
  const envTemplate = `# Deployment Wallet Configuration
DEPLOYER_PRIVATE_KEY=${wallet.privateKey}
DEPLOYER_ADDRESS=${wallet.address}

# Network Configuration  
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key_here

# Contract Addresses (will be filled after deployment)
SOLAR_TOKEN_ADDRESS=0x746042147240304098c837563aaec0f671881b07
SOLAR_INTEGRATION_ADDRESS=

# Frontend Environment Variables
NEXT_PUBLIC_SOLAR_INTEGRATION_ADDRESS=
`;

  // Save to .env.deployment file
  fs.writeFileSync('.env.deployment', envTemplate);
  
  console.log("\n📝 Environment file created: .env.deployment");
  console.log("💡 Copy this to your main .env file or use as separate deployment config");
  
  console.log("\n🚨 IMPORTANT SECURITY NOTES:");
  console.log("1. NEVER share your private key");
  console.log("2. Fund this wallet with ETH for gas fees");
  console.log("3. Transfer SOLAR tokens to this wallet for burning");
  console.log("4. Keep the mnemonic phrase secure as backup");
  
  console.log("\n💰 Next Steps:");
  console.log("1. Send ~0.01 ETH to:", wallet.address);
  console.log("2. Send SOLAR tokens for burning to:", wallet.address);
  console.log("3. Update your .env with the new DEPLOYER_PRIVATE_KEY");
  console.log("4. Run deployment script");
  
  // Generate QR code data for easy wallet import
  console.log("\n📱 Wallet Import Data:");
  console.log("Private Key (for MetaMask):", wallet.privateKey);
  console.log("Mnemonic (for wallet apps):", wallet.mnemonic.phrase);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  };
}

// Run if called directly
if (require.main === module) {
  generateNewWallet()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error generating wallet:", error);
      process.exit(1);
    });
}

module.exports = { generateNewWallet };