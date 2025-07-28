const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Admin Wallet Setup');
console.log('=============================\n');

// Check environment variables
console.log('📋 ENVIRONMENT VARIABLES CHECK:');
console.log('===============================');

const requiredVars = [
  'ADMIN_WALLET_PRIVATE_KEY',
  'NEXT_PUBLIC_TREASURY_ADDRESS',
  'NEXT_PUBLIC_RPC_URL',
  'NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS'
];

let allVarsPresent = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('PRIVATE_KEY') ? '[HIDDEN]' : value}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log('\n❌ Missing required environment variables!');
  console.log('Please check your .env.local file.');
  process.exit(1);
}

console.log('\n🔗 CONNECTIVITY TEST:');
console.log('=====================');

// Test RPC connection
async function testRPCConnection() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ RPC Connection: Connected to block ${blockNumber}`);
    return provider;
  } catch (error) {
    console.log(`❌ RPC Connection: ${error.message}`);
    return null;
  }
}

// Test admin wallet
async function testAdminWallet(provider) {
  try {
    const adminWallet = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY, provider);
    console.log(`✅ Admin Wallet: ${adminWallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(adminWallet.address);
    const ethBalance = ethers.formatEther(balance);
    console.log(`✅ ETH Balance: ${ethBalance} ETH`);
    
    return adminWallet;
  } catch (error) {
    console.log(`❌ Admin Wallet: ${error.message}`);
    return null;
  }
}

// Test SOLAR token contract
async function testSolarContract(provider, adminWallet) {
  try {
    const solarContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS,
      ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
      provider
    );
    
    const balance = await solarContract.balanceOf(adminWallet.address);
    const decimals = await solarContract.decimals();
    const solarBalance = ethers.formatUnits(balance, decimals);
    
    console.log(`✅ SOLAR Balance: ${solarBalance} SOLAR`);
    
    if (Number(solarBalance) < 1000) {
      console.log(`⚠️  Warning: Low SOLAR balance. Recommended: 10,000+ SOLAR for distributions`);
    }
    
    return solarContract;
  } catch (error) {
    console.log(`❌ SOLAR Contract: ${error.message}`);
    return null;
  }
}

// Test token distribution capability
async function testDistributionCapability(adminWallet, solarContract) {
  try {
    const testAmount = ethers.parseUnits('1', 18); // 1 SOLAR
    const adminBalance = await solarContract.balanceOf(adminWallet.address);
    
    if (adminBalance >= testAmount) {
      console.log(`✅ Distribution Capability: Ready (${ethers.formatUnits(adminBalance, 18)} SOLAR available)`);
    } else {
      console.log(`❌ Distribution Capability: Insufficient balance (${ethers.formatUnits(adminBalance, 18)} SOLAR available)`);
      console.log(`💡 Fund the admin wallet with more SOLAR tokens`);
    }
  } catch (error) {
    console.log(`❌ Distribution Capability: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log('Testing RPC connection...');
  const provider = await testRPCConnection();
  
  if (!provider) {
    console.log('\n❌ Cannot proceed without RPC connection');
    return;
  }
  
  console.log('\nTesting admin wallet...');
  const adminWallet = await testAdminWallet(provider);
  
  if (!adminWallet) {
    console.log('\n❌ Cannot proceed without admin wallet');
    return;
  }
  
  console.log('\nTesting SOLAR contract...');
  const solarContract = await testSolarContract(provider, adminWallet);
  
  if (!solarContract) {
    console.log('\n❌ Cannot proceed without SOLAR contract');
    return;
  }
  
  console.log('\nTesting distribution capability...');
  await testDistributionCapability(adminWallet, solarContract);
  
  console.log('\n📊 SUMMARY:');
  console.log('===========');
  console.log('✅ Environment variables configured');
  console.log('✅ RPC connection working');
  console.log('✅ Admin wallet accessible');
  console.log('✅ SOLAR contract accessible');
  console.log('\n🎉 Admin wallet setup is ready for token distributions!');
  
  console.log('\n📝 NEXT STEPS:');
  console.log('==============');
  console.log('1. Fund the admin wallet with SOLAR tokens if needed');
  console.log('2. Test a small token distribution');
  console.log('3. Monitor the distribution system');
}

// Run the tests
runTests().catch(console.error); 