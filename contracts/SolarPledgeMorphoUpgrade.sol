// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// Morpho Blue interface (simplified for example)
interface IMorphoBlue {
    function supply(
        bytes32 marketId,
        uint256 assets,
        uint256 shares,
        address onBehalf,
        bytes calldata data
    ) external returns (uint256 assetsSupplied, uint256 sharesSupplied);
    
    function withdraw(
        bytes32 marketId,
        uint256 assets,
        uint256 shares,
        address onBehalf,
        address receiver
    ) external returns (uint256 assetsWithdrawn, uint256 sharesWithdrawn);
    
    function supplyShares(bytes32 marketId, address user) external view returns (uint256);
    function market(bytes32 marketId) external view returns (
        uint128 totalSupplyAssets,
        uint128 totalSupplyShares,
        uint128 totalBorrowAssets,
        uint128 totalBorrowShares,
        uint128 lastUpdate,
        uint128 fee
    );
}

/**
 * @title SolarPledgeMorphoUpgrade
 * @dev Upgrade to SolarPledge contract adding Morpho Blue yield farming
 * @notice Enables community treasury to earn yield through Morpho lending
 */
contract SolarPledgeMorphoUpgrade is ReentrancyGuard, Ownable, Pausable {
    
    // ============ EXISTING SOLARPLEDGE VARIABLES ============
    // (These would be inherited from the existing contract)
    
    IERC20 public immutable usdcToken;
    address public treasuryAddress;
    uint256 public constant PLEDGE_FEE = 1 * 10**6; // $1 USDC
    uint128 public communityPool;
    uint128 public payItForwardPool;
    
    // ============ NEW MORPHO VARIABLES ============
    
    IMorphoBlue public immutable morphoBlue;
    bytes32 public morphoMarketId; // USDC lending market on Morpho
    
    uint128 public morphoDeposited; // Amount currently deposited in Morpho
    uint128 public morphoYieldEarned; // Total yield earned from Morpho
    uint128 public lastYieldHarvest; // Timestamp of last yield harvest
    
    // Yield distribution settings
    uint256 public constant STAKER_SHARE = 5000; // 50% to SOLAR stakers
    uint256 public constant TREASURY_SHARE = 3000; // 30% to treasury
    uint256 public constant COMMUNITY_SHARE = 2000; // 20% back to community pool
    
    address public solarStakingContract; // $SOLAR staking contract
    
    // Auto-investment settings
    uint128 public autoInvestThreshold = 10000 * 10**6; // Auto-invest when pool > $10k
    uint128 public reserveBuffer = 5000 * 10**6; // Keep $5k in reserve
    bool public autoInvestEnabled = true;
    
    // ============ EVENTS ============
    
    event MorphoDeposit(uint256 amount, uint256 shares);
    event MorphoWithdrawal(uint256 amount, uint256 shares);
    event YieldHarvested(uint256 totalYield, uint256 toStakers, uint256 toTreasury, uint256 toCommunity);
    event AutoInvestmentExecuted(uint256 amount);
    event MorphoMarketUpdated(bytes32 indexed oldMarket, bytes32 indexed newMarket);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _usdcToken,
        address _treasuryAddress,
        address _morphoBlue,
        bytes32 _morphoMarketId
    ) {
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_treasuryAddress != address(0), "Invalid treasury address");
        require(_morphoBlue != address(0), "Invalid Morpho address");
        
        usdcToken = IERC20(_usdcToken);
        treasuryAddress = _treasuryAddress;
        morphoBlue = IMorphoBlue(_morphoBlue);
        morphoMarketId = _morphoMarketId;
    }
    
    // ============ MORPHO INTEGRATION FUNCTIONS ============
    
    /**
     * @notice Deposit community pool funds into Morpho for yield farming
     * @param _amount Amount of USDC to deposit
     */
    function depositToMorpho(uint128 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "Amount must be positive");
        
        uint128 availablePool = getAvailableCommunityPool();
        require(_amount <= availablePool, "Insufficient community pool");
        
        // Approve and deposit to Morpho
        usdcToken.approve(address(morphoBlue), _amount);
        
        (uint256 assetsSupplied, uint256 sharesSupplied) = morphoBlue.supply(
            morphoMarketId,
            _amount,
            0,
            address(this),
            ""
        );
        
        morphoDeposited += uint128(assetsSupplied);
        
        emit MorphoDeposit(assetsSupplied, sharesSupplied);
    }
    
    /**
     * @notice Withdraw funds from Morpho
     * @param _amount Amount to withdraw (0 for all)
     */
    function withdrawFromMorpho(uint128 _amount) external onlyOwner nonReentrant {
        require(morphoDeposited > 0, "No funds deposited");
        
        uint256 withdrawAmount = _amount == 0 ? morphoDeposited : _amount;
        require(withdrawAmount <= morphoDeposited, "Insufficient deposited amount");
        
        (uint256 assetsWithdrawn, uint256 sharesWithdrawn) = morphoBlue.withdraw(
            morphoMarketId,
            withdrawAmount,
            0,
            address(this),
            address(this)
        );
        
        morphoDeposited -= uint128(assetsWithdrawn);
        
        emit MorphoWithdrawal(assetsWithdrawn, sharesWithdrawn);
    }
    
    /**
     * @notice Harvest yield from Morpho and distribute according to tokenomics
     */
    function harvestMorphoYield() external nonReentrant {
        require(morphoDeposited > 0, "No funds deposited");
        
        uint256 currentBalance = getCurrentMorphoBalance();
        require(currentBalance > morphoDeposited, "No yield to harvest");
        
        uint256 yieldEarned = currentBalance - morphoDeposited;
        
        // Withdraw only the yield
        (uint256 assetsWithdrawn,) = morphoBlue.withdraw(
            morphoMarketId,
            yieldEarned,
            0,
            address(this),
            address(this)
        );
        
        // Distribute yield according to tokenomics
        uint256 toStakers = (assetsWithdrawn * STAKER_SHARE) / 10000;
        uint256 toTreasury = (assetsWithdrawn * TREASURY_SHARE) / 10000;
        uint256 toCommunity = assetsWithdrawn - toStakers - toTreasury;
        
        // Transfer to staking contract if available
        if (solarStakingContract != address(0) && toStakers > 0) {
            usdcToken.transfer(solarStakingContract, toStakers);
        } else {
            // If no staking contract, add to community pool
            toCommunity += toStakers;
        }
        
        // Transfer to treasury
        if (toTreasury > 0) {
            usdcToken.transfer(treasuryAddress, toTreasury);
        }
        
        // Add to community pool
        if (toCommunity > 0) {
            communityPool += uint128(toCommunity);
        }
        
        morphoYieldEarned += uint128(assetsWithdrawn);
        lastYieldHarvest = uint128(block.timestamp);
        
        emit YieldHarvested(assetsWithdrawn, toStakers, toTreasury, toCommunity);
    }
    
    /**
     * @notice Auto-invest community pool surplus into Morpho
     */
    function autoInvestCommunityPool() external {
        require(autoInvestEnabled, "Auto-investment disabled");
        
        uint128 availablePool = getAvailableCommunityPool();
        
        if (availablePool > autoInvestThreshold) {
            uint128 investAmount = availablePool - reserveBuffer;
            
            // Approve and deposit to Morpho
            usdcToken.approve(address(morphoBlue), investAmount);
            
            (uint256 assetsSupplied,) = morphoBlue.supply(
                morphoMarketId,
                investAmount,
                0,
                address(this),
                ""
            );
            
            morphoDeposited += uint128(assetsSupplied);
            
            emit AutoInvestmentExecuted(assetsSupplied);
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get current balance in Morpho (principal + yield)
     */
    function getCurrentMorphoBalance() public view returns (uint256) {
        if (morphoDeposited == 0) return 0;
        
        uint256 shares = morphoBlue.supplyShares(morphoMarketId, address(this));
        if (shares == 0) return 0;
        
        // Get market data to calculate assets from shares
        (uint128 totalSupplyAssets, uint128 totalSupplyShares,,,,,) = morphoBlue.market(morphoMarketId);
        
        if (totalSupplyShares == 0) return 0;
        
        return (shares * totalSupplyAssets) / totalSupplyShares;
    }
    
    /**
     * @notice Get available community pool (excluding pay-it-forward)
     */
    function getAvailableCommunityPool() public view returns (uint128) {
        return communityPool > payItForwardPool ? communityPool - payItForwardPool : 0;
    }
    
    /**
     * @notice Get current yield earned from Morpho
     */
    function getCurrentYield() external view returns (uint256) {
        uint256 currentBalance = getCurrentMorphoBalance();
        return currentBalance > morphoDeposited ? currentBalance - morphoDeposited : 0;
    }
    
    /**
     * @notice Get comprehensive Morpho stats
     */
    function getMorphoStats() external view returns (
        uint128 deposited,
        uint256 currentBalance,
        uint256 currentYield,
        uint128 totalYieldEarned,
        uint128 lastHarvest
    ) {
        deposited = morphoDeposited;
        currentBalance = getCurrentMorphoBalance();
        currentYield = currentBalance > morphoDeposited ? currentBalance - morphoDeposited : 0;
        totalYieldEarned = morphoYieldEarned;
        lastHarvest = lastYieldHarvest;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update Morpho market ID
     * @param _newMarketId New market ID to use
     */
    function updateMorphoMarket(bytes32 _newMarketId) external onlyOwner {
        require(morphoDeposited == 0, "Must withdraw all funds first");
        
        bytes32 oldMarket = morphoMarketId;
        morphoMarketId = _newMarketId;
        
        emit MorphoMarketUpdated(oldMarket, _newMarketId);
    }
    
    /**
     * @notice Set SOLAR staking contract address
     * @param _stakingContract Address of the staking contract
     */
    function setSolarStakingContract(address _stakingContract) external onlyOwner {
        solarStakingContract = _stakingContract;
    }
    
    /**
     * @notice Configure auto-investment parameters
     * @param _threshold Minimum community pool size to trigger auto-investment
     * @param _buffer Amount to keep in reserve
     * @param _enabled Whether auto-investment is enabled
     */
    function configureAutoInvestment(
        uint128 _threshold,
        uint128 _buffer,
        bool _enabled
    ) external onlyOwner {
        require(_buffer < _threshold, "Buffer must be less than threshold");
        
        autoInvestThreshold = _threshold;
        reserveBuffer = _buffer;
        autoInvestEnabled = _enabled;
    }
    
    /**
     * @notice Emergency function to pause Morpho operations
     */
    function emergencyPauseMorpho() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Emergency function to withdraw all funds from Morpho
     */
    function emergencyWithdrawFromMorpho() external onlyOwner whenPaused {
        if (morphoDeposited > 0) {
            morphoBlue.withdraw(
                morphoMarketId,
                morphoDeposited,
                0,
                address(this),
                address(this)
            );
            morphoDeposited = 0;
        }
    }
    
    // ============ MODIFIER OVERRIDE FOR EXISTING FUNCTIONS ============
    
    /**
     * @notice Override pledge creation to trigger auto-investment
     * @dev This would replace the existing _handleSurplus function
     */
    function _handleSurplusWithMorpho(address pledger, uint128 surplusAmount) internal {
        uint128 payItForwardAmount = surplusAmount / 2;
        payItForwardPool += payItForwardAmount;
        
        require(
            usdcToken.transferFrom(pledger, address(this), surplusAmount),
            "USDC transfer for surplus failed"
        );
        
        communityPool += surplusAmount;
        
        // Trigger auto-investment if enabled and threshold met
        if (autoInvestEnabled && getAvailableCommunityPool() > autoInvestThreshold) {
            try this.autoInvestCommunityPool() {} catch {}
        }
        
        emit PayItForwardContribution(pledger, payItForwardAmount, payItForwardPool);
    }
    
    // ============ EVENTS FROM ORIGINAL CONTRACT ============
    
    event PayItForwardContribution(
        address indexed contributor,
        uint128 amount,
        uint128 newBalance
    );
}