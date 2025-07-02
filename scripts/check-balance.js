const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking deployment wallet balances...\n");

    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log("Deployment address:", deployer.address);
    
    // Check ETH balance
    const ethBalance = await deployer.provider.getBalance(deployer.address);
    console.log("ETH Balance:", ethers.formatEther(ethBalance), "ETH");
    
    // Check SOLAR balance
    const solarAddress = "0x746042147240304098C837563aAEc0F671881B07";
    try {
        const solarContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", solarAddress);
        const solarBalance = await solarContract.balanceOf(deployer.address);
        console.log("SOLAR Balance:", ethers.formatEther(solarBalance), "SOLAR");
        
        // Convert to numbers for easier reading
        const ethNum = Number(ethers.formatEther(ethBalance));
        const solarNum = Number(ethers.formatEther(solarBalance));
        
        console.log("\n📊 Balance Summary:");
        console.log("=".repeat(40));
        console.log(`ETH:   ${ethNum.toLocaleString()} (${ethNum >= 0.01 ? '✅' : '❌'} ${ethNum >= 0.01 ? 'Sufficient' : 'Need 0.01+ ETH'})`);
        console.log(`SOLAR: ${solarNum.toLocaleString()} (${solarNum >= 2100000000 ? '✅' : '❌'} ${solarNum >= 2100000000 ? 'Ready for burns' : 'Need 2.1B+ SOLAR'})`);
        
        if (ethNum >= 0.01 && solarNum >= 2100000000) {
            console.log("\n🚀 Ready for deployment!");
        } else {
            console.log("\n⚠️  Wallet needs funding before deployment");
        }
        
    } catch (error) {
        console.error("Error checking SOLAR balance:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Balance check failed:", error);
        process.exit(1);
    });