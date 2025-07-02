// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Morpho protocol interface (simplified)
interface IMorpho {
    function supply(
        address marketParams,
        uint256 assets,
        uint256 shares,
        address onBehalf,
        bytes calldata data
    ) external returns (uint256 assetsSupplied, uint256 sharesSupplied);
    
    function withdraw(
        address marketParams,
        uint256 assets,
        uint256 shares,
        address onBehalf,
        address receiver
    ) external returns (uint256 assetsWithdrawn, uint256 sharesWithdrawn);
    
    function balanceOf(address user, address marketParams) external view returns (uint256);
}

/**
 * @title MorphoTreasury
 * @dev Manages USDC treasury funds through Morpho protocol for yield generation
 * @notice Deposits USDC to Morpho, tracks yield, and enables strategic withdrawals
 */
contract MorphoTreasury is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    // Token contracts
    IERC20 public constant USDC = IERC20(0xa0b86a33e6441B8Db72C5Ab9cBF4428c7bb060B6); // Base USDC
    
    // Morpho contract address
    IMorpho public constant MORPHO = IMorpho(0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb);
    
    // Market parameters for USDC lending (this would be actual market params)
    address public constant USDC_MARKET = 0x1111111111111111111111111111111111111111;
    
    // Treasury tracking
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    uint256 public lastYieldUpdate;
    uint256 public accumulatedYield;
    
    // Yield distribution
    uint256 public constant OWNER_YIELD_SHARE = 7000; // 70% to owner
    uint256 public constant UTILITY_YIELD_SHARE = 2000; // 20% to utility contract
    uint256 public constant BUYBACK_YIELD_SHARE = 1000; // 10% for SOLAR buybacks
    
    // Contract references
    address public utilityContract;
    address public buybackContract;
    
    // Yield tracking per recipient
    mapping(address => uint256) public yieldAllocated;
    mapping(address => uint256) public yieldClaimed;
    
    // ============ EVENTS ============
    
    event USDCDeposited(uint256 amount, uint256 morphoShares);
    event USDCWithdrawn(uint256 amount, address recipient);
    event YieldDistributed(uint256 totalYield, uint256 ownerShare, uint256 utilityShare, uint256 buybackShare);
    event YieldClaimed(address indexed recipient, uint256 amount);
    event ContractUpdated(string contractType, address newAddress);
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _utilityContract, address _buybackContract) Ownable(msg.sender) {
        utilityContract = _utilityContract;
        buybackContract = _buybackContract;
        lastYieldUpdate = block.timestamp;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Deposit USDC to Morpho for yield generation
     * @param amount Amount of USDC to deposit
     */
    function depositToMorpho(uint256 amount) external onlyOwner nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(USDC.balanceOf(msg.sender) >= amount, "Insufficient USDC balance");
        
        // Transfer USDC from owner to this contract
        USDC.transferFrom(msg.sender, address(this), amount);
        
        // Approve Morpho to spend USDC
        USDC.approve(address(MORPHO), amount);
        
        // Supply to Morpho (simplified call)
        try MORPHO.supply(USDC_MARKET, amount, 0, address(this), "") returns (uint256 assetsSupplied, uint256 sharesSupplied) {
            totalDeposited += assetsSupplied;
            emit USDCDeposited(assetsSupplied, sharesSupplied);
        } catch {
            // If Morpho call fails, keep USDC in contract as backup
            totalDeposited += amount;
            emit USDCDeposited(amount, 0);
        }
    }
    
    /**
     * @notice Withdraw USDC from Morpho
     * @param amount Amount to withdraw
     * @param recipient Address to receive USDC
     */
    function withdrawFromMorpho(uint256 amount, address recipient) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        
        // Update yield before withdrawal
        updateYield();
        
        uint256 contractBalance = USDC.balanceOf(address(this));
        
        if (contractBalance >= amount) {
            // Direct transfer if we have enough in contract
            USDC.transfer(recipient, amount);
        } else {
            // Try to withdraw from Morpho
            try MORPHO.withdraw(USDC_MARKET, amount, 0, address(this), address(this)) returns (uint256 assetsWithdrawn, uint256) {
                USDC.transfer(recipient, assetsWithdrawn);
                totalWithdrawn += assetsWithdrawn;
            } catch {
                // If Morpho withdrawal fails, transfer what we have
                if (contractBalance > 0) {
                    USDC.transfer(recipient, contractBalance);
                    totalWithdrawn += contractBalance;
                }
            }
        }
        
        emit USDCWithdrawn(amount, recipient);
    }
    
    /**
     * @notice Update and distribute yield to different recipients
     */
    function updateYield() public {
        uint256 currentBalance = getCurrentBalance();
        uint256 netDeposits = totalDeposited - totalWithdrawn;
        
        if (currentBalance > netDeposits) {
            uint256 newYield = currentBalance - netDeposits - accumulatedYield;
            
            if (newYield > 0) {
                // Distribute yield according to shares
                uint256 ownerYield = (newYield * OWNER_YIELD_SHARE) / 10000;
                uint256 utilityYield = (newYield * UTILITY_YIELD_SHARE) / 10000;
                uint256 buybackYield = (newYield * BUYBACK_YIELD_SHARE) / 10000;
                
                // Allocate yield
                yieldAllocated[owner()] += ownerYield;
                yieldAllocated[utilityContract] += utilityYield;
                yieldAllocated[buybackContract] += buybackYield;
                
                accumulatedYield += newYield;
                lastYieldUpdate = block.timestamp;
                
                emit YieldDistributed(newYield, ownerYield, utilityYield, buybackYield);
            }
        }
    }
    
    /**
     * @notice Claim allocated yield
     * @param amount Amount to claim (0 for all available)
     */
    function claimYield(uint256 amount) external nonReentrant {
        updateYield();
        
        uint256 available = yieldAllocated[msg.sender] - yieldClaimed[msg.sender];
        require(available > 0, "No yield available");
        
        uint256 claimAmount = amount == 0 ? available : amount;
        require(claimAmount <= available, "Insufficient yield balance");
        
        yieldClaimed[msg.sender] += claimAmount;
        
        // Transfer USDC (withdraw from Morpho if needed)
        uint256 contractBalance = USDC.balanceOf(address(this));
        if (contractBalance < claimAmount) {
            // Withdraw from Morpho to cover claim
            try MORPHO.withdraw(USDC_MARKET, claimAmount, 0, address(this), address(this)) {
                // Withdrawal successful
            } catch {
                // If withdrawal fails, claim what's available in contract
                claimAmount = contractBalance;
            }
        }
        
        if (claimAmount > 0) {
            USDC.transfer(msg.sender, claimAmount);
            emit YieldClaimed(msg.sender, claimAmount);
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get current total balance (contract + Morpho)
     * @return balance Total USDC balance
     */
    function getCurrentBalance() public view returns (uint256 balance) {
        uint256 contractBalance = USDC.balanceOf(address(this));
        
        try MORPHO.balanceOf(address(this), USDC_MARKET) returns (uint256 morphoBalance) {
            balance = contractBalance + morphoBalance;
        } catch {
            // If Morpho call fails, return contract balance only
            balance = contractBalance;
        }
    }
    
    /**
     * @notice Get available yield for an address
     * @param user Address to check
     * @return available Available yield amount
     */
    function getAvailableYield(address user) external view returns (uint256 available) {
        available = yieldAllocated[user] - yieldClaimed[user];
    }
    
    /**
     * @notice Get treasury statistics
     * @return totalBalance Current total balance
     * @return deposited Total deposited
     * @return withdrawn Total withdrawn
     * @return totalYield Total accumulated yield
     * @return lastUpdate Last yield update timestamp
     */
    function getTreasuryStats() external view returns (
        uint256 totalBalance,
        uint256 deposited,
        uint256 withdrawn,
        uint256 totalYield,
        uint256 lastUpdate
    ) {
        totalBalance = getCurrentBalance();
        deposited = totalDeposited;
        withdrawn = totalWithdrawn;
        totalYield = accumulatedYield;
        lastUpdate = lastYieldUpdate;
    }
    
    /**
     * @notice Get estimated APY based on recent yield
     * @return apy Estimated APY in basis points
     */
    function getEstimatedAPY() external view returns (uint256 apy) {
        if (totalDeposited == 0 || accumulatedYield == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - lastYieldUpdate;
        if (timeElapsed == 0) return 0;
        
        // Annualized yield calculation (simplified)
        uint256 yieldRate = (accumulatedYield * 365 days * 10000) / (totalDeposited * timeElapsed);
        return yieldRate; // Returns APY in basis points
    }
    
    /**
     * @notice Get Morpho balance (for monitoring)
     * @return morphoBalance Balance in Morpho protocol
     */
    function getMorphoBalance() external view returns (uint256 morphoBalance) {
        try MORPHO.balanceOf(address(this), USDC_MARKET) returns (uint256 balance) {
            morphoBalance = balance;
        } catch {
            morphoBalance = 0;
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update utility contract address
     * @param newUtilityContract New utility contract address
     */
    function setUtilityContract(address newUtilityContract) external onlyOwner {
        require(newUtilityContract != address(0), "Invalid address");
        utilityContract = newUtilityContract;
        emit ContractUpdated("utility", newUtilityContract);
    }
    
    /**
     * @notice Update buyback contract address
     * @param newBuybackContract New buyback contract address
     */
    function setBuybackContract(address newBuybackContract) external onlyOwner {
        require(newBuybackContract != address(0), "Invalid address");
        buybackContract = newBuybackContract;
        emit ContractUpdated("buyback", newBuybackContract);
    }
    
    /**
     * @notice Emergency withdrawal (owner only)
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
    
    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @notice Force yield update (can be called by anyone)
     */
    function forceYieldUpdate() external {
        updateYield();
    }
    
    /**
     * @notice Check if yield update is needed
     * @return needed Whether yield update is recommended
     */
    function needsYieldUpdate() external view returns (bool needed) {
        return block.timestamp >= lastYieldUpdate + 1 days;
    }
    
    /**
     * @notice Estimate current unrealized yield
     * @return estimatedYield Estimated new yield since last update
     */
    function estimateCurrentYield() external view returns (uint256 estimatedYield) {
        uint256 currentBalance = getCurrentBalance();
        uint256 netDeposits = totalDeposited - totalWithdrawn;
        
        if (currentBalance > netDeposits + accumulatedYield) {
            estimatedYield = currentBalance - netDeposits - accumulatedYield;
        }
    }
}