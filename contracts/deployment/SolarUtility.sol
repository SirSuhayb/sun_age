// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SolarUtility
 * @dev Core SOLAR token utility contract for premium features and burns
 * @notice Manages premium feature access, burns, and utility tracking
 */
contract SolarUtility is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    // Existing SOLAR token contract
    IERC20 public constant SOLAR_TOKEN = IERC20(0x746042147240304098C837563aAEc0F671881B07);
    
    // USDC token for payments
    IERC20 public constant USDC = IERC20(0xa0b86a33e6441B8Db72C5Ab9cBF4428c7bb060B6);
    
    // Burn address (standard burn address)
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Feature requirements (in SOLAR tokens with 18 decimals)
    mapping(bytes32 => uint256) public featureRequirements;
    
    // Feature pricing (in USDC with 6 decimals)
    mapping(bytes32 => uint256) public featurePricing;
    
    // User access tracking
    mapping(address => mapping(bytes32 => bool)) public permanentAccess;
    mapping(address => mapping(bytes32 => uint256)) public temporaryAccess; // timestamp when access expires
    mapping(address => mapping(bytes32 => uint256)) public paidAccess; // timestamp when paid access expires
    
    // Burn tracking
    uint256 public totalBurned;
    uint256 public burnEvents;
    
    // Feature usage tracking
    mapping(bytes32 => uint256) public featureUsage;
    mapping(address => mapping(bytes32 => uint256)) public userFeatureUsage;
    
    // Revenue tracking for burns
    uint256 public totalRevenue; // Total USDC revenue collected
    uint256 public lastBurnTime;
    uint256 public constant BURN_INTERVAL = 90 days; // Quarterly burns
    uint256 public constant BURN_PERCENTAGE = 2500; // 25% of revenue for burns (in basis points)
    
    // Treasury contract for automatic deposits
    address public treasuryContract;
    uint256 public constant TREASURY_THRESHOLD = 1000 * 1e6; // Auto-deposit when 1000+ USDC
    
    // ============ EVENTS ============
    
    event SolarBurned(uint256 amount, string reason, address burner);
    event FeatureRequirementSet(bytes32 indexed feature, uint256 requirement);
    event FeaturePricingSet(bytes32 indexed feature, uint256 price);
    event PermanentAccessGranted(address indexed user, bytes32 indexed feature);
    event TemporaryAccessGranted(address indexed user, bytes32 indexed feature, uint256 duration);
    event FeatureUsed(address indexed user, bytes32 indexed feature);
    event FeaturePurchased(address indexed user, bytes32 indexed feature, uint256 price, uint256 duration);
    event RevenueAdded(uint256 amount, address source);
    event TreasuryDeposit(uint256 amount);
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        // Set realistic feature requirements for 100B supply
        featureRequirements["premium_analytics"] = 50_000_000 * 1e18;      // 50M SOLAR
        featureRequirements["custom_milestones"] = 150_000_000 * 1e18;     // 150M SOLAR  
        featureRequirements["priority_support"] = 30_000_000 * 1e18;       // 30M SOLAR
        featureRequirements["advanced_journey"] = 100_000_000 * 1e18;      // 100M SOLAR
        featureRequirements["api_access"] = 250_000_000 * 1e18;            // 250M SOLAR
        featureRequirements["early_access"] = 50_000_000 * 1e18;           // 50M SOLAR
        featureRequirements["vip_support"] = 500_000_000 * 1e18;           // 500M SOLAR
        
        // Set pricing for paid access (USDC with 6 decimals)
        featurePricing["premium_analytics"] = 10 * 1e6;    // $10/month
        featurePricing["custom_milestones"] = 25 * 1e6;    // $25/month
        featurePricing["priority_support"] = 15 * 1e6;     // $15/month
        featurePricing["advanced_journey"] = 20 * 1e6;     // $20/month
        featurePricing["api_access"] = 50 * 1e6;           // $50/month
        featurePricing["early_access"] = 5 * 1e6;          // $5/month
        featurePricing["vip_support"] = 100 * 1e6;         // $100/month
        
        lastBurnTime = block.timestamp;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Check if user has access to a premium feature
     * @param user Address to check
     * @param feature Feature identifier
     * @return hasAccess Whether user has access
     */
    function checkAccess(address user, bytes32 feature) external view returns (bool hasAccess) {
        // Check permanent access first
        if (permanentAccess[user][feature]) {
            return true;
        }
        
        // Check temporary access
        if (temporaryAccess[user][feature] > block.timestamp) {
            return true;
        }
        
        // Check paid access
        if (paidAccess[user][feature] > block.timestamp) {
            return true;
        }
        
        // Check current SOLAR balance
        uint256 userBalance = SOLAR_TOKEN.balanceOf(user);
        uint256 required = featureRequirements[feature];
        
        return userBalance >= required;
    }
    
    /**
     * @notice Purchase paid access to a premium feature
     * @param feature Feature identifier
     * @param duration Duration in days (30, 90, 365)
     */
    function purchaseFeatureAccess(bytes32 feature, uint256 duration) external nonReentrant whenNotPaused {
        require(duration == 30 || duration == 90 || duration == 365, "Invalid duration");
        require(featurePricing[feature] > 0, "Feature not available for purchase");
        
        // Calculate price based on duration
        uint256 basePrice = featurePricing[feature];
        uint256 totalPrice;
        
        if (duration == 30) {
            totalPrice = basePrice; // 1 month
        } else if (duration == 90) {
            totalPrice = (basePrice * 3 * 90) / 100; // 10% discount for 3 months
        } else { // 365 days
            totalPrice = (basePrice * 12 * 80) / 100; // 20% discount for annual
        }
        
        // Transfer USDC from user
        USDC.transferFrom(msg.sender, address(this), totalPrice);
        
        // Grant paid access
        uint256 accessDuration = duration * 1 days;
        uint256 newExpiry = block.timestamp + accessDuration;
        
        // Extend existing access if any
        if (paidAccess[msg.sender][feature] > block.timestamp) {
            newExpiry = paidAccess[msg.sender][feature] + accessDuration;
        }
        
        paidAccess[msg.sender][feature] = newExpiry;
        
        // Track revenue
        totalRevenue += totalPrice;
        
        // Auto-deposit to treasury if threshold reached
        _checkTreasuryDeposit();
        
        emit FeaturePurchased(msg.sender, feature, totalPrice, duration);
        emit RevenueAdded(totalPrice, msg.sender);
    }
    
    /**
     * @notice Use a premium feature (tracking + access control)
     * @param feature Feature identifier
     */
    function useFeature(bytes32 feature) external nonReentrant whenNotPaused {
        require(this.checkAccess(msg.sender, feature), "Insufficient SOLAR balance or access");
        
        // Track usage
        featureUsage[feature]++;
        userFeatureUsage[msg.sender][feature]++;
        
        emit FeatureUsed(msg.sender, feature);
    }
    
    /**
     * @notice Internal function to check and execute treasury deposits
     */
    function _checkTreasuryDeposit() internal {
        if (treasuryContract != address(0)) {
            uint256 balance = USDC.balanceOf(address(this));
            if (balance >= TREASURY_THRESHOLD) {
                // Deposit to treasury
                USDC.transfer(treasuryContract, balance);
                
                // Notify treasury of new revenue
                (bool success,) = treasuryContract.call(
                    abi.encodeWithSignature("addRevenue(uint256)", balance)
                );
                
                if (success) {
                    emit TreasuryDeposit(balance);
                }
            }
        }
    }
    
    /**
     * @notice Manual treasury deposit (owner only)
     */
    function depositToTreasury() external onlyOwner {
        require(treasuryContract != address(0), "Treasury not set");
        
        uint256 balance = USDC.balanceOf(address(this));
        require(balance > 0, "No USDC to deposit");
        
        USDC.transfer(treasuryContract, balance);
        
        // Notify treasury
        (bool success,) = treasuryContract.call(
            abi.encodeWithSignature("addRevenue(uint256)", balance)
        );
        
        if (success) {
            emit TreasuryDeposit(balance);
        }
    }
    
    /**
     * @notice Grant permanent access to a feature (for special users/partnerships)
     * @param user Address to grant access to
     * @param feature Feature identifier
     */
    function grantPermanentAccess(address user, bytes32 feature) external onlyOwner {
        permanentAccess[user][feature] = true;
        emit PermanentAccessGranted(user, feature);
    }
    
    /**
     * @notice Grant temporary access to a feature (for trials/promotions)
     * @param user Address to grant access to  
     * @param feature Feature identifier
     * @param duration Duration in seconds
     */
    function grantTemporaryAccess(address user, bytes32 feature, uint256 duration) external onlyOwner {
        temporaryAccess[user][feature] = block.timestamp + duration;
        emit TemporaryAccessGranted(user, feature, duration);
    }
    
    // ============ BURN FUNCTIONS ============
    
    /**
     * @notice Strategic burn from owner wallet
     * @param amount Amount to burn from owner wallet
     * @param reason Reason for burning
     */
    function strategicBurn(uint256 amount, string memory reason) external onlyOwner {
        SOLAR_TOKEN.transferFrom(msg.sender, BURN_ADDRESS, amount);
        totalBurned += amount;
        burnEvents++;
        
        emit SolarBurned(amount, reason, msg.sender);
    }
    
    /**
     * @notice Execute quarterly revenue-based burn
     * @dev Anyone can call this after the interval has passed
     */
    function executeQuarterlyBurn() external nonReentrant {
        require(block.timestamp >= lastBurnTime + BURN_INTERVAL, "Too early for quarterly burn");
        require(totalRevenue > 0, "No revenue to burn");
        
        // Calculate burn amount (25% of total revenue converted to SOLAR)
        uint256 burnAmount = calculateBurnAmount();
        require(burnAmount > 0, "No SOLAR available for burn");
        
        // Execute burn from contract balance or owner
        if (SOLAR_TOKEN.balanceOf(address(this)) >= burnAmount) {
            SOLAR_TOKEN.transfer(BURN_ADDRESS, burnAmount);
        } else {
            // If contract doesn't have enough, burn from owner
            SOLAR_TOKEN.transferFrom(owner(), BURN_ADDRESS, burnAmount);
        }
        
        totalBurned += burnAmount;
        burnEvents++;
        lastBurnTime = block.timestamp;
        
        // Reset revenue counter
        totalRevenue = 0;
        
        emit SolarBurned(burnAmount, "Quarterly revenue burn", msg.sender);
    }
    
    /**
     * @notice Calculate burn amount based on current revenue and SOLAR price
     * @dev This is a simplified calculation - in practice would use price oracle
     */
    function calculateBurnAmount() public view returns (uint256) {
        if (totalRevenue == 0) return 0;
        
        // Simplified: assume 1 USDC can buy ~1M SOLAR tokens (adjustable)
        uint256 solarPerUSDC = 1_000_000 * 1e18; // 1M SOLAR per USDC
        uint256 burnBudget = (totalRevenue * BURN_PERCENTAGE) / 10000; // 25% of revenue
        
        return burnBudget * solarPerUSDC / 1e6; // Convert USDC (6 decimals) to SOLAR (18 decimals)
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get user's access status for a feature
     * @param user Address to check
     * @param feature Feature identifier
     * @return hasAccess Whether user has access
     * @return accessType Type of access ("solar", "paid", "permanent", "temporary")
     * @return expiryTime When access expires (0 if permanent)
     */
    function getUserFeatureAccess(address user, bytes32 feature) external view returns (
        bool hasAccess,
        string memory accessType,
        uint256 expiryTime
    ) {
        if (permanentAccess[user][feature]) {
            return (true, "permanent", 0);
        }
        
        if (temporaryAccess[user][feature] > block.timestamp) {
            return (true, "temporary", temporaryAccess[user][feature]);
        }
        
        if (paidAccess[user][feature] > block.timestamp) {
            return (true, "paid", paidAccess[user][feature]);
        }
        
        uint256 userBalance = SOLAR_TOKEN.balanceOf(user);
        uint256 required = featureRequirements[feature];
        
        if (userBalance >= required) {
            return (true, "solar", 0);
        }
        
        return (false, "none", 0);
    }
    
    /**
     * @notice Get feature pricing for different durations
     * @param feature Feature identifier
     * @return monthly Monthly price in USDC
     * @return quarterly Quarterly price in USDC (10% discount)
     * @return annual Annual price in USDC (20% discount)
     */
    function getFeaturePricing(bytes32 feature) external view returns (
        uint256 monthly,
        uint256 quarterly,
        uint256 annual
    ) {
        uint256 basePrice = featurePricing[feature];
        monthly = basePrice;
        quarterly = (basePrice * 3 * 90) / 100; // 10% discount
        annual = (basePrice * 12 * 80) / 100; // 20% discount
    }
    
    /**
     * @notice Get user's SOLAR balance and accessible features
     * @param user Address to check
     * @return balance Current SOLAR balance
     * @return accessibleFeatures Array of accessible feature names
     */
    function getUserStatus(address user) external view returns (
        uint256 balance,
        bytes32[] memory accessibleFeatures
    ) {
        balance = SOLAR_TOKEN.balanceOf(user);
        
        // Check access for all features
        bytes32[] memory allFeatures = new bytes32[](7);
        allFeatures[0] = "premium_analytics";
        allFeatures[1] = "custom_milestones";
        allFeatures[2] = "priority_support";
        allFeatures[3] = "advanced_journey";
        allFeatures[4] = "api_access";
        allFeatures[5] = "early_access";
        allFeatures[6] = "vip_support";
        
        // Count accessible features
        uint256 accessCount = 0;
        for (uint256 i = 0; i < allFeatures.length; i++) {
            if (this.checkAccess(user, allFeatures[i])) {
                accessCount++;
            }
        }
        
        // Create accessible features array
        accessibleFeatures = new bytes32[](accessCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allFeatures.length; i++) {
            if (this.checkAccess(user, allFeatures[i])) {
                accessibleFeatures[index] = allFeatures[i];
                index++;
            }
        }
    }
    
    /**
     * @notice Get comprehensive stats
     * @return totalSupply Current SOLAR total supply
     * @return burnedAmount Total tokens burned
     * @return burnCount Number of burn events
     * @return revenueForBurns Total revenue accumulated for burns
     * @return nextBurnTime When next quarterly burn can be executed
     * @return usdcBalance Current USDC balance in contract
     */
    function getStats() external view returns (
        uint256 totalSupply,
        uint256 burnedAmount,
        uint256 burnCount,
        uint256 revenueForBurns,
        uint256 nextBurnTime,
        uint256 usdcBalance
    ) {
        totalSupply = 100_000_000_000 * 1e18; // 100B SOLAR (static)
        burnedAmount = totalBurned;
        burnCount = burnEvents;
        revenueForBurns = totalRevenue;
        nextBurnTime = lastBurnTime + BURN_INTERVAL;
        usdcBalance = USDC.balanceOf(address(this));
    }
    
    /**
     * @notice Get feature requirement
     * @param feature Feature identifier
     * @return requirement SOLAR tokens required
     */
    function getFeatureRequirement(bytes32 feature) external view returns (uint256 requirement) {
        return featureRequirements[feature];
    }
    
    /**
     * @notice Get all feature requirements
     * @return features Array of feature names
     * @return requirements Array of SOLAR requirements
     * @return prices Array of USDC prices
     */
    function getAllFeatureRequirements() external view returns (
        bytes32[] memory features,
        uint256[] memory requirements,
        uint256[] memory prices
    ) {
        features = new bytes32[](7);
        requirements = new uint256[](7);
        prices = new uint256[](7);
        
        features[0] = "premium_analytics";
        features[1] = "custom_milestones";
        features[2] = "priority_support";
        features[3] = "advanced_journey";
        features[4] = "api_access";
        features[5] = "early_access";
        features[6] = "vip_support";
        
        for (uint256 i = 0; i < features.length; i++) {
            requirements[i] = featureRequirements[features[i]];
            prices[i] = featurePricing[features[i]];
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Set treasury contract address
     * @param _treasuryContract Treasury contract address
     */
    function setTreasuryContract(address _treasuryContract) external onlyOwner {
        treasuryContract = _treasuryContract;
    }
    
    /**
     * @notice Update feature requirement
     * @param feature Feature identifier
     * @param requirement New SOLAR requirement
     */
    function setFeatureRequirement(bytes32 feature, uint256 requirement) external onlyOwner {
        featureRequirements[feature] = requirement;
        emit FeatureRequirementSet(feature, requirement);
    }
    
    /**
     * @notice Update feature pricing
     * @param feature Feature identifier
     * @param price New USDC price (monthly)
     */
    function setFeaturePricing(bytes32 feature, uint256 price) external onlyOwner {
        featurePricing[feature] = price;
        emit FeaturePricingSet(feature, price);
    }
    
    /**
     * @notice Update burn percentage (for revenue burns)
     * @param newPercentage New percentage in basis points (2500 = 25%)
     */
    function setBurnPercentage(uint256 newPercentage) external onlyOwner view {
        require(newPercentage <= 5000, "Cannot exceed 50%"); // Max 50% of revenue
        // This would need to be a state variable, simplified for now
    }
    
    /**
     * @notice Emergency withdraw (owner only)
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(SOLAR_TOKEN), "Cannot withdraw SOLAR");
        IERC20(token).transfer(msg.sender, amount);
    }
    
    /**
     * @notice Pause contract (emergency only)
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
    
    // ============ HELPER FUNCTIONS ============
    
    /**
     * @notice Check if quarterly burn is available
     */
    function canExecuteQuarterlyBurn() external view returns (bool) {
        return block.timestamp >= lastBurnTime + BURN_INTERVAL && totalRevenue > 0;
    }
    
    /**
     * @notice Get time until next burn
     */
    function timeUntilNextBurn() external view returns (uint256) {
        uint256 nextBurn = lastBurnTime + BURN_INTERVAL;
        if (block.timestamp >= nextBurn) {
            return 0;
        }
        return nextBurn - block.timestamp;
    }
}