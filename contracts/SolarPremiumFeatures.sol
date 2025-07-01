// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface ISolarToken {
    function burn(uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IDEXRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
}

/**
 * @title SolarPremiumFeatures
 * @dev Premium feature system with dual USDC/SOLAR payments and token value accrual
 */
contract SolarPremiumFeatures is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    ISolarToken public immutable solarToken;
    IERC20 public immutable usdcToken;
    IDEXRouter public dexRouter; // For USDC->SOLAR swaps
    
    address public treasuryAddress;
    address public stakingContract;
    
    // Feature definitions
    struct PremiumFeature {
        string name;
        uint256 usdcPrice;        // Price in USDC (6 decimals)
        uint256 solarPrice;       // Price in SOLAR (18 decimals)
        uint256 solarDiscount;    // Discount when paying with SOLAR (basis points)
        uint256 duration;         // Feature duration in seconds
        bool isActive;
    }
    
    mapping(bytes32 => PremiumFeature) public features;
    bytes32[] public featureIds;
    
    // User subscriptions
    struct Subscription {
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }
    
    mapping(address => mapping(bytes32 => Subscription)) public subscriptions;
    
    // Revenue tracking
    uint256 public totalUsdcRevenue;
    uint256 public totalSolarBurned;
    uint256 public totalSolarBuyback;
    uint256 public lastBuybackTime;
    
    // Buyback settings
    uint256 public buybackPercentage = 3000; // 30% of USDC revenue for buyback
    uint256 public burnPercentage = 5000;    // 50% of SOLAR payments burned
    uint256 public minBuybackAmount = 100 * 1e6; // Minimum $100 for buyback
    uint256 public buybackCooldown = 1 hours;    // Cooldown between buybacks
    
    // Token requirements for features
    mapping(bytes32 => uint256) public tokenRequirements; // Min SOLAR to hold for feature
    
    // ============ EVENTS ============
    
    event FeatureCreated(bytes32 indexed featureId, string name, uint256 usdcPrice, uint256 solarPrice);
    event FeaturePurchased(bytes32 indexed featureId, address indexed user, bool paidWithSolar, uint256 amount);
    event SolarBurned(uint256 amount, string reason);
    event SolarBuyback(uint256 usdcSpent, uint256 solarBought, uint256 solarBurned);
    event SubscriptionActivated(address indexed user, bytes32 indexed featureId, uint256 endTime);
    event RevenueDistributed(uint256 toTreasury, uint256 toBuyback);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _solarToken,
        address _usdcToken,
        address _treasuryAddress,
        address _dexRouter
    ) {
        solarToken = ISolarToken(_solarToken);
        usdcToken = IERC20(_usdcToken);
        treasuryAddress = _treasuryAddress;
        dexRouter = IDEXRouter(_dexRouter);
        
        // Initialize default features
        _createFeature(
            "analytics_premium",
            "Advanced Solar Analytics",
            5 * 1e6,    // $5 USDC
            20 * 1e18,  // 20 SOLAR
            2000,       // 20% discount with SOLAR
            30 days
        );
        
        _createFeature(
            "priority_support",
            "Priority Support",
            3 * 1e6,    // $3 USDC
            12 * 1e18,  // 12 SOLAR
            1500,       // 15% discount with SOLAR
            30 days
        );
        
        _createFeature(
            "custom_milestones",
            "Custom Cosmic Milestones",
            8 * 1e6,    // $8 USDC
            30 * 1e18,  // 30 SOLAR
            2500,       // 25% discount with SOLAR
            30 days
        );
    }
    
    // ============ FEATURE MANAGEMENT ============
    
    /**
     * @notice Create a new premium feature
     */
    function createFeature(
        string memory _id,
        string memory _name,
        uint256 _usdcPrice,
        uint256 _solarPrice,
        uint256 _solarDiscount,
        uint256 _duration
    ) external onlyOwner {
        _createFeature(_id, _name, _usdcPrice, _solarPrice, _solarDiscount, _duration);
    }
    
    function _createFeature(
        string memory _id,
        string memory _name,
        uint256 _usdcPrice,
        uint256 _solarPrice,
        uint256 _solarDiscount,
        uint256 _duration
    ) internal {
        bytes32 featureId = keccak256(abi.encodePacked(_id));
        require(!features[featureId].isActive, "Feature already exists");
        
        features[featureId] = PremiumFeature({
            name: _name,
            usdcPrice: _usdcPrice,
            solarPrice: _solarPrice,
            solarDiscount: _solarDiscount,
            duration: _duration,
            isActive: true
        });
        
        featureIds.push(featureId);
        
        emit FeatureCreated(featureId, _name, _usdcPrice, _solarPrice);
    }
    
    // ============ PURCHASE FUNCTIONS ============
    
    /**
     * @notice Purchase premium feature with USDC
     * @param _featureId Feature ID to purchase
     */
    function purchaseWithUSDC(bytes32 _featureId) external nonReentrant whenNotPaused {
        PremiumFeature memory feature = features[_featureId];
        require(feature.isActive, "Feature not active");
        
        // Check token requirements
        uint256 requiredSolar = tokenRequirements[_featureId];
        if (requiredSolar > 0) {
            require(solarToken.balanceOf(msg.sender) >= requiredSolar, "Insufficient SOLAR balance");
        }
        
        // Transfer USDC from user
        usdcToken.transferFrom(msg.sender, address(this), feature.usdcPrice);
        
        // Update revenue tracking
        totalUsdcRevenue += feature.usdcPrice;
        
        // Distribute revenue
        uint256 buybackAmount = (feature.usdcPrice * buybackPercentage) / 10000;
        uint256 treasuryAmount = feature.usdcPrice - buybackAmount;
        
        // Send to treasury
        if (treasuryAmount > 0) {
            usdcToken.transfer(treasuryAddress, treasuryAmount);
        }
        
        // Execute buyback if threshold met
        if (buybackAmount >= minBuybackAmount && 
            block.timestamp >= lastBuybackTime + buybackCooldown) {
            _executeBuybackAndBurn(buybackAmount);
        }
        
        // Activate subscription
        _activateSubscription(msg.sender, _featureId, feature.duration);
        
        emit FeaturePurchased(_featureId, msg.sender, false, feature.usdcPrice);
        emit RevenueDistributed(treasuryAmount, buybackAmount);
    }
    
    /**
     * @notice Purchase premium feature with SOLAR tokens
     * @param _featureId Feature ID to purchase
     */
    function purchaseWithSOLAR(bytes32 _featureId) external nonReentrant whenNotPaused {
        PremiumFeature memory feature = features[_featureId];
        require(feature.isActive, "Feature not active");
        
        // Calculate discounted price
        uint256 solarCost = (feature.solarPrice * (10000 - feature.solarDiscount)) / 10000;
        
        // Transfer SOLAR from user
        solarToken.transferFrom(msg.sender, address(this), solarCost);
        
        // Burn percentage of SOLAR received
        uint256 burnAmount = (solarCost * burnPercentage) / 10000;
        uint256 treasuryAmount = solarCost - burnAmount;
        
        if (burnAmount > 0) {
            solarToken.burn(burnAmount);
            totalSolarBurned += burnAmount;
            emit SolarBurned(burnAmount, "Premium feature purchase");
        }
        
        // Send remaining to treasury or staking rewards
        if (treasuryAmount > 0 && stakingContract != address(0)) {
            solarToken.transfer(stakingContract, treasuryAmount);
        }
        
        // Activate subscription
        _activateSubscription(msg.sender, _featureId, feature.duration);
        
        emit FeaturePurchased(_featureId, msg.sender, true, solarCost);
    }
    
    /**
     * @notice Internal function to activate user subscription
     */
    function _activateSubscription(address _user, bytes32 _featureId, uint256 _duration) internal {
        Subscription storage sub = subscriptions[_user][_featureId];
        
        uint256 startTime = block.timestamp;
        // If user has active subscription, extend it
        if (sub.isActive && sub.endTime > block.timestamp) {
            startTime = sub.endTime;
        }
        
        sub.startTime = startTime;
        sub.endTime = startTime + _duration;
        sub.isActive = true;
        
        emit SubscriptionActivated(_user, _featureId, sub.endTime);
    }
    
    // ============ BUYBACK AND BURN ============
    
    /**
     * @notice Execute SOLAR buyback and burn with accumulated USDC
     */
    function _executeBuybackAndBurn(uint256 _usdcAmount) internal {
        if (_usdcAmount == 0) return;
        
        // Get SOLAR price in USDC
        address[] memory path = new address[](2);
        path[0] = address(usdcToken);
        path[1] = address(solarToken);
        
        try dexRouter.getAmountsOut(_usdcAmount, path) returns (uint[] memory amounts) {
            if (amounts.length >= 2 && amounts[1] > 0) {
                // Approve DEX to spend USDC
                usdcToken.approve(address(dexRouter), _usdcAmount);
                
                // Execute swap
                uint[] memory swapAmounts = dexRouter.swapExactTokensForTokens(
                    _usdcAmount,
                    amounts[1] * 95 / 100, // 5% slippage tolerance
                    path,
                    address(this),
                    block.timestamp + 300
                );
                
                uint256 solarBought = swapAmounts[1];
                
                // Burn all purchased SOLAR
                if (solarBought > 0) {
                    solarToken.burn(solarBought);
                    totalSolarBurned += solarBought;
                    totalSolarBuyback += _usdcAmount;
                    lastBuybackTime = block.timestamp;
                    
                    emit SolarBuyback(_usdcAmount, solarBought, solarBought);
                    emit SolarBurned(solarBought, "Revenue buyback");
                }
            }
        } catch {
            // If swap fails, send USDC to treasury instead
            usdcToken.transfer(treasuryAddress, _usdcAmount);
        }
    }
    
    /**
     * @notice Manual buyback execution (owner only)
     */
    function executeBuyback() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance >= minBuybackAmount, "Insufficient balance for buyback");
        _executeBuybackAndBurn(balance);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Check if user has active subscription to feature
     */
    function hasActiveSubscription(address _user, bytes32 _featureId) external view returns (bool) {
        Subscription memory sub = subscriptions[_user][_featureId];
        return sub.isActive && sub.endTime > block.timestamp;
    }
    
    /**
     * @notice Get user subscription info
     */
    function getSubscription(address _user, bytes32 _featureId) external view returns (
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        uint256 timeRemaining
    ) {
        Subscription memory sub = subscriptions[_user][_featureId];
        startTime = sub.startTime;
        endTime = sub.endTime;
        isActive = sub.isActive && sub.endTime > block.timestamp;
        timeRemaining = isActive ? sub.endTime - block.timestamp : 0;
    }
    
    /**
     * @notice Get all active features
     */
    function getActiveFeatures() external view returns (bytes32[] memory activeIds, PremiumFeature[] memory activeFeatures) {
        uint256 activeCount = 0;
        
        // Count active features
        for (uint256 i = 0; i < featureIds.length; i++) {
            if (features[featureIds[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create arrays
        activeIds = new bytes32[](activeCount);
        activeFeatures = new PremiumFeature[](activeCount);
        
        // Populate arrays
        uint256 index = 0;
        for (uint256 i = 0; i < featureIds.length; i++) {
            if (features[featureIds[i]].isActive) {
                activeIds[index] = featureIds[i];
                activeFeatures[index] = features[featureIds[i]];
                index++;
            }
        }
    }
    
    /**
     * @notice Get revenue and burn statistics
     */
    function getStats() external view returns (
        uint256 totalRevenue,
        uint256 totalBurned,
        uint256 totalBuyback,
        uint256 currentBalance,
        uint256 nextBuybackEligible
    ) {
        totalRevenue = totalUsdcRevenue;
        totalBurned = totalSolarBurned;
        totalBuyback = totalSolarBuyback;
        currentBalance = usdcToken.balanceOf(address(this));
        nextBuybackEligible = lastBuybackTime + buybackCooldown;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update feature parameters
     */
    function updateFeature(
        bytes32 _featureId,
        uint256 _usdcPrice,
        uint256 _solarPrice,
        uint256 _solarDiscount,
        bool _isActive
    ) external onlyOwner {
        require(features[_featureId].isActive || _isActive, "Feature does not exist");
        
        PremiumFeature storage feature = features[_featureId];
        feature.usdcPrice = _usdcPrice;
        feature.solarPrice = _solarPrice;
        feature.solarDiscount = _solarDiscount;
        feature.isActive = _isActive;
    }
    
    /**
     * @notice Set token requirement for feature access
     */
    function setTokenRequirement(bytes32 _featureId, uint256 _requiredAmount) external onlyOwner {
        tokenRequirements[_featureId] = _requiredAmount;
    }
    
    /**
     * @notice Update buyback settings
     */
    function updateBuybackSettings(
        uint256 _buybackPercentage,
        uint256 _burnPercentage,
        uint256 _minBuybackAmount,
        uint256 _buybackCooldown
    ) external onlyOwner {
        require(_buybackPercentage <= 5000, "Buyback percentage too high"); // Max 50%
        require(_burnPercentage <= 10000, "Burn percentage too high"); // Max 100%
        
        buybackPercentage = _buybackPercentage;
        burnPercentage = _burnPercentage;
        minBuybackAmount = _minBuybackAmount;
        buybackCooldown = _buybackCooldown;
    }
    
    /**
     * @notice Update contract addresses
     */
    function updateAddresses(
        address _treasuryAddress,
        address _stakingContract,
        address _dexRouter
    ) external onlyOwner {
        if (_treasuryAddress != address(0)) treasuryAddress = _treasuryAddress;
        if (_stakingContract != address(0)) stakingContract = _stakingContract;
        if (_dexRouter != address(0)) dexRouter = IDEXRouter(_dexRouter);
    }
    
    /**
     * @notice Emergency functions
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner whenPaused {
        IERC20(_token).transfer(msg.sender, _amount);
    }
}