const { ethers } = require("hardhat");

async function main() {
    console.log("\n🚀 Deploying SOLAR Renaissance Contracts...\n");

    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check ETH balance
    const ethBalance = await deployer.provider.getBalance(deployer.address);
    console.log("ETH Balance:", ethers.formatEther(ethBalance));
    
    // Check SOLAR balance
    const solarAddress = "0x746042147240304098c837563aaec0f671881b07";
    const solarContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", solarAddress);
    const solarBalance = await solarContract.balanceOf(deployer.address);
    console.log("SOLAR Balance:", ethers.formatEther(solarBalance));
    
    console.log("\n📋 Deployment Plan:");
    console.log("1. SolarUtility (Core utility + burns)");
    console.log("2. SolarStaking (Adjusted tiers for 100B supply)");
    console.log("3. MorphoTreasury (USDC yield farming)");
    console.log("4. Link contracts together");
    console.log("5. Execute initial burns");
    
    // Deploy SolarUtility contract
    console.log("\n🔧 1. Deploying SolarUtility...");
    const SolarUtility = await ethers.getContractFactory("contracts/deployment/SolarUtility.sol:SolarUtility");
    const solarUtility = await SolarUtility.deploy();
    await solarUtility.waitForDeployment();
    const utilityAddress = await solarUtility.getAddress();
    console.log("✅ SolarUtility deployed to:", utilityAddress);
    
    // Deploy SolarStaking contract
    console.log("\n🎯 2. Deploying SolarStaking...");
    const SolarStaking = await ethers.getContractFactory("contracts/deployment/SolarStaking.sol:SolarStaking");
    const solarStaking = await SolarStaking.deploy();
    await solarStaking.waitForDeployment();
    const stakingAddress = await solarStaking.getAddress();
    console.log("✅ SolarStaking deployed to:", stakingAddress);
    
    // Deploy MorphoTreasury (using utility and staking as initial contract addresses)
    console.log("\n💰 3. Deploying MorphoTreasury...");
    const MorphoTreasury = await ethers.getContractFactory("contracts/deployment/MorphoTreasury.sol:MorphoTreasury");
    const morphoTreasury = await MorphoTreasury.deploy(utilityAddress, stakingAddress);
    await morphoTreasury.waitForDeployment();
    const treasuryAddress = await morphoTreasury.getAddress();
    console.log("✅ MorphoTreasury deployed to:", treasuryAddress);
    
    console.log("\n🔗 4. Linking contracts...");
    
    // Link SolarUtility to MorphoTreasury
    console.log("Linking utility contract to treasury...");
    await solarUtility.setTreasuryContract(treasuryAddress);
    console.log("✅ Treasury contract linked to utility");
    
    // Fund staking contract with initial rewards (500K SOLAR)
    console.log("Funding staking rewards pool...");
    const initialRewards = ethers.parseEther("500000"); // 500K SOLAR
    await solarContract.approve(stakingAddress, initialRewards);
    await solarStaking.fundRewardPool(initialRewards);
    console.log("✅ Funded staking with 500K SOLAR rewards");
    
    console.log("\n🔥 5. Executing initial strategic burns...");
    
    // Strategic burn 1: 1B SOLAR (1% of supply)
    const burn1Amount = ethers.parseEther("1000000000"); // 1B SOLAR
    console.log(`Approving ${ethers.formatEther(burn1Amount)} SOLAR for burn 1...`);
    await solarContract.approve(utilityAddress, burn1Amount);
    console.log("Executing strategic burn 1...");
    await solarUtility.strategicBurn(burn1Amount, "Initial Renaissance Launch - Supply Reduction");
    console.log("✅ Burned 1B SOLAR (1% of supply)");
    
    // Strategic burn 2: Additional 1B SOLAR 
    const burn2Amount = ethers.parseEther("1000000000"); // 1B SOLAR
    console.log(`Approving ${ethers.formatEther(burn2Amount)} SOLAR for burn 2...`);
    await solarContract.approve(utilityAddress, burn2Amount);
    console.log("Executing strategic burn 2...");
    await solarUtility.strategicBurn(burn2Amount, "Market Confidence Signal - Deflationary Pressure");
    console.log("✅ Burned additional 1B SOLAR");
    
    // Get total burned
    const totalBurned = await solarUtility.totalBurned();
    console.log(`🔥 Total SOLAR burned: ${ethers.formatEther(totalBurned)} (${(Number(ethers.formatEther(totalBurned)) / 100000000000 * 100).toFixed(2)}% of supply)`);
    
    console.log("\n📊 Deployment Summary:");
    console.log("=".repeat(50));
    console.log(`SolarUtility:    ${utilityAddress}`);
    console.log(`SolarStaking:    ${stakingAddress}`);
    console.log(`MorphoTreasury:  ${treasuryAddress}`);
    console.log("=".repeat(50));
    
    console.log("\n🎯 Features Enabled:");
    console.log("✅ Premium Features (50M-500M SOLAR tiers)");
    console.log("✅ Strategic Burns (2B SOLAR burned)");
    console.log("✅ Quarterly Revenue Burns");
    console.log("✅ Staking Rewards (4 tiers: 10M/100M/500M/1B SOLAR)");
    console.log("✅ Morpho Treasury Integration");
    console.log("✅ 50K/month emission schedule (2% monthly reduction)");
    
    console.log("\n🔍 Contract Verification Commands:");
    console.log(`npx hardhat verify --network base ${utilityAddress}`);
    console.log(`npx hardhat verify --network base ${stakingAddress}`);
    console.log(`npx hardhat verify --network base ${treasuryAddress} "${utilityAddress}" "${stakingAddress}"`);
    
    console.log("\n🎮 Feature Testing Examples:");
    
    // Show feature requirements
    console.log("\n📋 Premium Feature Requirements:");
    const features = [
        "premium_analytics",
        "custom_milestones", 
        "priority_support",
        "advanced_journey",
        "api_access",
        "early_access",
        "vip_support"
    ];
    
    for (const feature of features) {
        const requirement = await solarUtility.getFeatureRequirement(ethers.keccak256(ethers.toUtf8Bytes(feature)));
        console.log(`${feature}: ${ethers.formatEther(requirement)} SOLAR`);
    }
    
    // Show staking tiers
    console.log("\n🎯 Staking Tiers:");
    const [tierIds, minimumStakes, multipliers, names] = await solarStaking.getAllTiers();
    for (let i = 0; i < tierIds.length; i++) {
        const apy = await solarStaking.getEstimatedAPY(tierIds[i]);
        console.log(`${names[i]}: ${ethers.formatEther(minimumStakes[i])} SOLAR (${Number(multipliers[i])/100}% multiplier, ~${Number(apy)/100}% APY)`);
    }
    
    console.log("\n💡 Next Steps:");
    console.log("1. Fund treasury with USDC for Morpho integration");
    console.log("2. Set up monitoring for quarterly burns");
    console.log("3. Configure premium feature integration");
    console.log("4. Monitor staking emissions and APY");
    console.log("5. Track burn events and deflationary pressure");
    
    console.log("\n🚀 SOLAR Renaissance deployment complete!");
    console.log("Ready for ecosystem utility and value appreciation! 🌟");
    
    // Save deployment addresses
    const deploymentData = {
        network: "base",
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            SolarUtility: utilityAddress,
            SolarStaking: stakingAddress,
            MorphoTreasury: treasuryAddress
        },
        initialBurns: {
            burn1: {
                amount: ethers.formatEther(burn1Amount),
                reason: "Initial Renaissance Launch - Supply Reduction"
            },
            burn2: {
                amount: ethers.formatEther(burn2Amount), 
                reason: "Market Confidence Signal - Deflationary Pressure"
            },
            totalBurned: ethers.formatEther(totalBurned)
        },
        features: {
            premiumFeatures: true,
            stakingRewards: true,
            morphoIntegration: true,
            quarterlyBurns: true,
            emissionSchedule: true
        }
    };
    
    // Write deployment data
    const fs = require('fs');
    fs.writeFileSync(
        'deployment-results.json', 
        JSON.stringify(deploymentData, null, 2)
    );
    console.log("\n📄 Deployment data saved to deployment-results.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });