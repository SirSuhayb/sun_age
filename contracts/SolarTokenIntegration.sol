// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SolarTokenIntegration
 * @dev Core integration contract for existing SOLAR token utility in Solara ecosystem
 * @notice Manages premium features, burns, and utility for SOLAR token holders
 */
contract SolarTokenIntegration is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    // Existing SOLAR token contract
    IERC20 public constant SOLAR_TOKEN = IERC20(0x746042147240304098c837563aaec0f671881b07);
    
    // Burn address (standard burn address)
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Feature requirements and access
    mapping(bytes32 => uint256) public featureRequirements;
    mapping(address => mapping(bytes32 => bool)) public permanentAccess;
    mapping(address => mapping(bytes32 => uint256)) public temporaryAccess; // timestamp when access expires
    
    // Burn tracking
    uint256 public totalBurned;
    uint256 public burnEvents;
    
    // Premium feature usage tracking
    mapping(bytes32 => uint256) public featureUsage;
    mapping(address => mapping(bytes32 => uint256)) public userFeatureUsage;
    
    // ============ EVENTS ============
    
    event SolarBurned(uint256 amount, string reason, address burner);
    event FeatureRequirementSet(bytes32 indexed feature, uint256 requirement);
    event PermanentAccessGranted(address indexed user, bytes32 indexed feature);
    event TemporaryAccessGranted(address indexed user, bytes32 indexed feature, uint256 duration);
    event FeatureUsed(address indexed user, bytes32 indexed feature);
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Set initial feature requirements (in SOLAR tokens with 18 decimals)
        featureRequirements["premium_analytics"] = 5_000_000 * 1e18;      // 5M SOLAR
        featureRequirements["custom_milestones"] = 15_000_000 * 1e18;     // 15M SOLAR  
        featureRequirements["priority_support"] = 3_000_000 * 1e18;       // 3M SOLAR
        featureRequirements["advanced_journey"] = 10_000_000 * 1e18;      // 10M SOLAR
        featureRequirements["api_access"] = 25_000_000 * 1e18;            // 25M SOLAR
        featureRequirements["governance_vote"] = 1_000_000 * 1e18;        // 1M SOLAR
        featureRequirements["early_access"] = 5_000_000 * 1e18;           // 5M SOLAR
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
        
        // Check current SOLAR balance
        uint256 userBalance = SOLAR_TOKEN.balanceOf(user);
        uint256 required = featureRequirements[feature];
        
        return userBalance >= required;
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
     * @notice Burn SOLAR tokens from contract balance
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burn(uint256 amount, string memory reason) external onlyOwner {
        require(SOLAR_TOKEN.balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        SOLAR_TOKEN.transfer(BURN_ADDRESS, amount);
        totalBurned += amount;
        burnEvents++;
        
        emit SolarBurned(amount, reason, msg.sender);
    }
    
    /**
     * @notice Emergency burn from owner wallet (for immediate impact)
     * @param amount Amount to burn from owner wallet
     * @param reason Reason for burning
     */
    function emergencyBurn(uint256 amount, string memory reason) external onlyOwner {
        SOLAR_TOKEN.transferFrom(msg.sender, BURN_ADDRESS, amount);
        totalBurned += amount;
        burnEvents++;
        
        emit SolarBurned(amount, reason, msg.sender);
    }
    
    /**
     * @notice Strategic burn for major announcements
     * @param amount Amount to burn
     */
    function strategicBurn(uint256 amount) external onlyOwner {
        string memory reason = string(abi.encodePacked("Strategic burn #", toString(burnEvents + 1)));
        this.emergencyBurn(amount, reason);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get user's SOLAR balance and feature access status
     * @param user Address to check
     * @return balance Current SOLAR balance
     * @return accessList Array of accessible features
     */
    function getUserStatus(address user) external view returns (
        uint256 balance,
        bytes32[] memory accessList
    ) {
        balance = SOLAR_TOKEN.balanceOf(user);
        
        // Check access for all features
        bytes32[] memory allFeatures = new bytes32[](7);
        allFeatures[0] = "premium_analytics";
        allFeatures[1] = "custom_milestones";
        allFeatures[2] = "priority_support";
        allFeatures[3] = "advanced_journey";
        allFeatures[4] = "api_access";
        allFeatures[5] = "governance_vote";
        allFeatures[6] = "early_access";
        
        // Count accessible features
        uint256 accessCount = 0;
        for (uint256 i = 0; i < allFeatures.length; i++) {
            if (this.checkAccess(user, allFeatures[i])) {
                accessCount++;
            }
        }
        
        // Create accessible features array
        accessList = new bytes32[](accessCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allFeatures.length; i++) {
            if (this.checkAccess(user, allFeatures[i])) {
                accessList[index] = allFeatures[i];
                index++;
            }
        }
    }
    
    /**
     * @notice Get comprehensive stats
     * @return totalSupply Current SOLAR total supply
     * @return burnedAmount Total tokens burned
     * @return burnCount Number of burn events
     * @return totalUsers Number of users who have used features
     */
    function getStats() external view returns (
        uint256 totalSupply,
        uint256 burnedAmount,
        uint256 burnCount,
        uint256 totalUsers
    ) {
        // Note: SOLAR token total supply would need to be fetched from token contract
        totalSupply = 100_000_000_000 * 1e18; // 100B SOLAR (static for now)
        burnedAmount = totalBurned;
        burnCount = burnEvents;
        
        // Total users is tracked through feature usage
        // This is a simplified version - in production you'd track unique users
        totalUsers = featureUsage["premium_analytics"] + 
                    featureUsage["custom_milestones"] + 
                    featureUsage["priority_support"];
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
     */
    function getAllFeatureRequirements() external view returns (
        bytes32[] memory features,
        uint256[] memory requirements
    ) {
        features = new bytes32[](7);
        requirements = new uint256[](7);
        
        features[0] = "premium_analytics";
        features[1] = "custom_milestones";
        features[2] = "priority_support";
        features[3] = "advanced_journey";
        features[4] = "api_access";
        features[5] = "governance_vote";
        features[6] = "early_access";
        
        for (uint256 i = 0; i < features.length; i++) {
            requirements[i] = featureRequirements[features[i]];
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
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
     * @notice Withdraw any accidentally sent tokens (except SOLAR)
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
     * @notice Convert uint to string
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}