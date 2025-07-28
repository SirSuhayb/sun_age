const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

console.log('🔐 Creating Admin Wallet for SOLAR Token Distribution');
console.log('==================================================\n');

// Generate a new wallet
const wallet = ethers.Wallet.createRandom();

console.log('✅ Admin Wallet Generated Successfully!\n');

// Display wallet information
console.log('📋 WALLET INFORMATION:');
console.log('======================');
console.log(`Address: ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}`);
console.log(`Mnemonic: ${wallet.mnemonic?.phrase || 'N/A'}\n`);

// Create environment variables template
const envTemplate = `# Admin Wallet for SOLAR Token Distribution
ADMIN_WALLET_ADDRESS=${wallet.address}
ADMIN_WALLET_PRIVATE_KEY=${wallet.privateKey}

# Add these to your .env.local file
# ⚠️  IMPORTANT: Keep your private key secure and never commit it to version control!
`;

// Save to file
const outputPath = path.join(__dirname, 'admin-wallet.env');
fs.writeFileSync(outputPath, envTemplate);

console.log('📁 ENVIRONMENT VARIABLES SAVED:');
console.log('===============================');
console.log(`File: ${outputPath}`);
console.log('\n📝 NEXT STEPS:');
console.log('==============');
console.log('1. Copy the environment variables above to your .env.local file');
console.log('2. Fund the admin wallet with SOLAR tokens for distributions');
console.log('3. Keep the private key secure and never share it');
console.log('4. Consider using a hardware wallet for production\n');

// Display funding instructions
console.log('💰 FUNDING INSTRUCTIONS:');
console.log('=======================');
console.log(`Send SOLAR tokens to: ${wallet.address}`);
console.log('Recommended minimum: 10,000 SOLAR tokens');
console.log('Network: Base Mainnet');
console.log('Token Contract: 0x746042147240304098C837563aAEc0F671881B07\n');

// Security warning
console.log('⚠️  SECURITY WARNING:');
console.log('===================');
console.log('- Never commit the private key to version control');
console.log('- Store the private key securely (password manager, hardware wallet)');
console.log('- Use different wallets for development and production');
console.log('- Regularly rotate the admin wallet in production\n');

// Test the wallet
console.log('🧪 WALLET TEST:');
console.log('==============');
console.log('Address is valid:', ethers.isAddress(wallet.address));
console.log('Private key is valid:', wallet.privateKey.length === 66);
console.log('Wallet can sign messages:', !!wallet.signMessage);

console.log('\n✅ Admin wallet creation complete!');
console.log('Add the environment variables to your .env.local file and fund the wallet.'); 