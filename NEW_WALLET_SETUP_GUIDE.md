# 🔐 New Deployment Wallet Setup Guide

## 🎯 **Why Use a Separate Deployment Wallet?**

✅ **Security**: Keep your main wallet with 30B SOLAR tokens safe  
✅ **Clean Deployment**: Dedicated wallet for contract deployment  
✅ **Gas Management**: Easier to manage deployment costs  
✅ **Access Control**: Limit exposure of main wallet private key  

---

## 📋 **Step-by-Step Setup**

### **Step 1: Generate New Wallet (2 minutes)**

```bash
cd contracts
node scripts/generate-wallet.js
```

**This will output:**
- 🔑 New wallet address
- 🔐 Private key 
- 📝 Mnemonic phrase
- 📄 `.env.deployment` file

**⚠️ SAVE THESE SECURELY! You'll need them for deployment.**

---

### **Step 2: Fund the New Wallet (5 minutes)**

#### **2.1 Send ETH for Gas Fees**
```
Minimum Required: 0.01 ETH
Recommended: 0.02 ETH (for buffer)

Send to: [YOUR_NEW_WALLET_ADDRESS]
```

#### **2.2 Send SOLAR Tokens for Burning**
```
Required: 2,000,000,000 SOLAR (2 billion)
Recommended: 2,100,000,000 SOLAR (buffer for gas calculations)

From: Your main wallet
To: [YOUR_NEW_WALLET_ADDRESS]
Token: 0x746042147240304098c837563aaec0f671881b07
```

---

### **Step 3: Configure Environment (2 minutes)**

#### **3.1 Update Your .env File**
```bash
# Copy from .env.deployment to your main .env file
cp .env.deployment .env

# Or manually add to existing .env:
DEPLOYER_PRIVATE_KEY=0x...your_new_private_key
DEPLOYER_ADDRESS=0x...your_new_wallet_address
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

#### **3.2 Get Basescan API Key (Optional but Recommended)**
1. Go to https://basescan.org/apis
2. Create free account
3. Generate API key
4. Add to .env file

---

### **Step 4: Verify Setup (2 minutes)**

```bash
# Check wallet balances
npx hardhat run scripts/check-balances.js --network base
```

---

## 🚀 **Ready to Deploy!**

### **Quick Deployment Commands**

```bash
# 1. Deploy contract (30 seconds)
npx hardhat run scripts/deploy-solar-integration.js --network base

# 2. Update .env with deployed address
echo "SOLAR_INTEGRATION_ADDRESS=0x...deployed_address" >> .env

# 3. Execute strategic burn (30 seconds)
npx hardhat run scripts/execute-burn.js --network base
```

---

## 🔧 **Troubleshooting**

### **Problem: "Insufficient ETH balance"**
```bash
# Check current balance
npx hardhat run scripts/check-balances.js --network base

# Send more ETH to deployment wallet
# Minimum: 0.01 ETH
```

### **Problem: "Insufficient SOLAR balance"**
```bash
# Check SOLAR balance
npx hardhat run scripts/check-balances.js --network base

# Transfer from main wallet:
# Amount: 2,000,000,000 SOLAR
# To: [deployment_wallet_address]
```

### **Problem: "Invalid private key"**
```bash
# Regenerate wallet
node scripts/generate-wallet.js

# Update .env with new private key
```

### **Problem: "Network connection issues"**
```bash
# Check RPC URL in .env
BASE_RPC_URL=https://mainnet.base.org

# Alternative RPC URLs:
# BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
# BASE_RPC_URL=https://base.blockpi.network/v1/rpc/public
```

---

## 🛡️ **Security Best Practices**

### **DO:**
✅ Keep private key secure and never share  
✅ Use hardware wallet for main SOLAR holdings  
✅ Backup mnemonic phrase securely  
✅ Use dedicated wallet for deployment only  
✅ Verify all addresses before sending funds  

### **DON'T:**
❌ Share private key in chat/email  
❌ Store private key in plain text files  
❌ Use deployment wallet for main holdings  
❌ Send all SOLAR to deployment wallet  
❌ Skip verification steps  

---

## 📊 **Funding Calculations**

### **ETH Requirements:**
- **Contract Deployment**: ~0.003-0.005 ETH
- **Token Burn**: ~0.001-0.002 ETH
- **Buffer for gas spikes**: 0.005 ETH
- **Total Recommended**: 0.015 ETH

### **SOLAR Requirements:**
- **Strategic Burn**: 2,000,000,000 SOLAR
- **Gas buffer**: 0 SOLAR (burn uses ETH for gas)
- **Total Required**: 2,000,000,000 SOLAR

---

## 🎯 **Pre-Deployment Checklist**

- [ ] New wallet generated
- [ ] Private key saved securely
- [ ] ETH sent to new wallet (min 0.01)
- [ ] SOLAR sent to new wallet (2B tokens)
- [ ] .env file updated
- [ ] Basescan API key configured
- [ ] Balance verification completed
- [ ] Network connection tested

---

## 🚀 **After Deployment**

### **Security Cleanup:**
1. **Save contract addresses** from deployment
2. **Transfer remaining SOLAR** back to main wallet
3. **Keep small ETH amount** for future contract interactions
4. **Backup deployment records** (addresses, tx hashes)

### **Next Steps:**
1. Update frontend with contract address
2. Test premium features
3. Prepare social media announcement
4. Monitor burn transaction confirmation

---

## 📞 **Need Help?**

### **Common Issues:**
- **Gas estimation failed**: Network congestion, try again
- **Transaction reverted**: Check token balances and approvals
- **Nonce issues**: Clear hardhat cache: `npx hardhat clean`

### **Emergency Actions:**
- **Wrong network**: Double-check hardhat.config.js
- **Lost private key**: Use mnemonic to recover
- **Contract deployment failed**: Check error logs and retry

---

**🎉 You're ready to deploy! This setup ensures maximum security while enabling smooth deployment.**