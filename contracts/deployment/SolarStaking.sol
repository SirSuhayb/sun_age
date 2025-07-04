// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";



/**
 * @title SolarStaking
 * @dev SOLAR token staking contract with tier-based rewards and emission schedule
 * @notice Stake SOLAR tokens to earn rewards based on staking tiers and duration
 */
contract SolarStaking is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    // SOLAR token contract
    IERC20 public constant SOLAR_TOKEN = IERC20(0x746042147240304098C837563aAEc0F671881B07);
    
    // Staking tiers (adjusted for 100B supply)
    struct StakingTier {
        uint256 minimumStake;   // Minimum SOLAR required
        uint256 multiplier;     // Reward multiplier (basis points)
        string name;            // Tier name
        bool active;            // Whether tier is active
    }
    
    mapping(uint256 => StakingTier) public stakingTiers;
    uint256 public totalTiers;
    
    // User staking information
    struct UserStake {
        uint256 amount;          // Amount staked
        uint256 tier;            // Current tier
        uint256 stakeTime;       // When user staked
        uint256 lastClaimTime;   // Last reward claim time
        uint256 totalClaimed;    // Total rewards claimed
    }
    
    mapping(address => UserStake) public userStakes;
    
    // Global staking statistics
    uint256 public totalStaked;
    uint256 public totalStakers;
    uint256 public totalRewardsDistributed;
    
    // Emission schedule
    uint256 public currentMonthlyEmission;  // Current monthly emission amount
    uint256 public emissionStartTime;       // When emissions started
    uint256 public lastEmissionUpdate;      // Last emission update
    uint256 public constant EMISSION_REDUCTION_RATE = 98; // 2% monthly reduction (98%)
    uint256 public constant INITIAL_MONTHLY_EMISSION = 50_000 * 1e18; // 50,000 SOLAR/month
    uint256 public constant SECONDS_PER_MONTH = 30 days;
    
    // Reward pool
    uint256 public rewardPool;
    uint256 public lastRewardCalculation;
    
    // Emergency features
    bool public emergencyWithdrawEnabled;
    
    // ============ EVENTS ============
    
    event Staked(address indexed user, uint256 amount, uint256 tier);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event EmissionUpdated(uint256 newMonthlyEmission);
    event TierUpdated(uint256 tierId, uint256 minimumStake, uint256 multiplier, string name);
    event RewardPoolFunded(uint256 amount);
    event EmergencyWithdrawToggled(bool enabled);
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        // Initialize staking tiers (adjusted for 100B supply)
        stakingTiers[1] = StakingTier(10_000_000 * 1e18, 10000, "Bronze", true);     // 10M SOLAR, 1x multiplier
        stakingTiers[2] = StakingTier(100_000_000 * 1e18, 15000, "Silver", true);    // 100M SOLAR, 1.5x multiplier
        stakingTiers[3] = StakingTier(500_000_000 * 1e18, 20000, "Gold", true);      // 500M SOLAR, 2x multiplier
        stakingTiers[4] = StakingTier(1_000_000_000 * 1e18, 30000, "Diamond", true); // 1B SOLAR, 3x multiplier
        totalTiers = 4;
        
        // Initialize emission schedule
        currentMonthlyEmission = INITIAL_MONTHLY_EMISSION;
        emissionStartTime = block.timestamp;
        lastEmissionUpdate = block.timestamp;
        lastRewardCalculation = block.timestamp;
    }
    
    // ============ CORE STAKING FUNCTIONS ============
    
    /**
     * @notice Stake SOLAR tokens
     * @param amount Amount to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(SOLAR_TOKEN.balanceOf(msg.sender) >= amount, "Insufficient SOLAR balance");
        
        // Update emissions and rewards before staking
        updateEmissions();
        updateRewards();
        
        UserStake storage userStake = userStakes[msg.sender];
        
        // If user has existing stake, claim rewards first
        if (userStake.amount > 0) {
            _claimRewards(msg.sender);
        } else {
            totalStakers++;
        }
        
        // Transfer tokens to contract
        SOLAR_TOKEN.transferFrom(msg.sender, address(this), amount);
        
        // Update user stake
        userStake.amount += amount;
        userStake.stakeTime = block.timestamp;
        userStake.lastClaimTime = block.timestamp;
        
        // Calculate new tier
        uint256 newTier = calculateUserTier(userStake.amount);
        userStake.tier = newTier;
        
        // Update global stats
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, newTier);
    }
    
    /**
     * @notice Unstake SOLAR tokens
     * @param amount Amount to unstake (0 for all)
     */
    function unstake(uint256 amount) external nonReentrant {
        UserStake storage userStake = userStakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        
        if (amount == 0) {
            amount = userStake.amount;
        }
        require(amount <= userStake.amount, "Amount exceeds staked balance");
        
        // Update emissions and claim rewards before unstaking
        updateEmissions();
        updateRewards();
        _claimRewards(msg.sender);
        
        // Update user stake
        userStake.amount -= amount;
        totalStaked -= amount;
        
        // Update tier after unstaking
        if (userStake.amount > 0) {
            userStake.tier = calculateUserTier(userStake.amount);
        } else {
            userStake.tier = 0;
            totalStakers--;
        }
        
        // Transfer tokens back to user
        SOLAR_TOKEN.transfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @notice Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        updateEmissions();
        updateRewards();
        _claimRewards(msg.sender);
    }
    
    /**
     * @notice Emergency unstake (when enabled by owner)
     */
    function emergencyUnstake() external nonReentrant {
        require(emergencyWithdrawEnabled, "Emergency withdraw not enabled");
        
        UserStake storage userStake = userStakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        
        uint256 amount = userStake.amount;
        
        // Update global stats
        totalStaked -= amount;
        totalStakers--;
        
        // Reset user stake
        delete userStakes[msg.sender];
        
        // Transfer tokens (no rewards in emergency)
        SOLAR_TOKEN.transfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @notice Internal function to claim rewards for a user
     * @param user Address of user
     */
    function _claimRewards(address user) internal {
        uint256 rewards = calculatePendingRewards(user);
        
        if (rewards > 0 && rewardPool >= rewards) {
            UserStake storage userStake = userStakes[user];
            
            userStake.lastClaimTime = block.timestamp;
            userStake.totalClaimed += rewards;
            
            rewardPool -= rewards;
            totalRewardsDistributed += rewards;
            
            SOLAR_TOKEN.transfer(user, rewards);
            
            emit RewardsClaimed(user, rewards);
        }
    }
    
    /**
     * @notice Update monthly emissions (reduces by 2% each month)
     */
    function updateEmissions() public {
        uint256 monthsPassed = (block.timestamp - lastEmissionUpdate) / SECONDS_PER_MONTH;
        
        if (monthsPassed > 0) {
            for (uint256 i = 0; i < monthsPassed; i++) {
                currentMonthlyEmission = (currentMonthlyEmission * EMISSION_REDUCTION_RATE) / 100;
            }
            
            lastEmissionUpdate += (monthsPassed * SECONDS_PER_MONTH);
            emit EmissionUpdated(currentMonthlyEmission);
        }
    }
    
    /**
     * @notice Update reward pool based on time elapsed and emissions
     */
    function updateRewards() public {
        uint256 timeElapsed = block.timestamp - lastRewardCalculation;
        
        if (timeElapsed > 0 && totalStaked > 0) {
            // Calculate rewards to add based on current emission rate
            uint256 rewardsToAdd = (currentMonthlyEmission * timeElapsed) / SECONDS_PER_MONTH;
            
            // Add to reward pool (will be funded by owner)
            rewardPool += rewardsToAdd;
            lastRewardCalculation = block.timestamp;
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Calculate user's tier based on staked amount
     * @param stakedAmount Amount of SOLAR staked
     * @return tier Tier number (0 if below minimum)
     */
    function calculateUserTier(uint256 stakedAmount) public view returns (uint256 tier) {
        for (uint256 i = totalTiers; i >= 1; i--) {
            if (stakingTiers[i].active && stakedAmount >= stakingTiers[i].minimumStake) {
                return i;
            }
        }
        return 0; // No tier
    }
    
    /**
     * @notice Calculate pending rewards for a user
     * @param user Address of user
     * @return rewards Pending reward amount
     */
    function calculatePendingRewards(address user) public view returns (uint256 rewards) {
        UserStake memory userStake = userStakes[user];
        
        if (userStake.amount == 0 || userStake.tier == 0 || totalStaked == 0) {
            return 0;
        }
        
        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        if (timeStaked == 0) return 0;
        
        // Base reward rate (proportional to user's stake)
        uint256 baseReward = (currentMonthlyEmission * userStake.amount * timeStaked) / (totalStaked * SECONDS_PER_MONTH);
        
        // Apply tier multiplier
        uint256 multiplier = stakingTiers[userStake.tier].multiplier;
        rewards = (baseReward * multiplier) / 10000;
    }
    
    /**
     * @notice Get user staking information
     * @param user Address of user
     * @return amount Staked amount
     * @return tier Current tier
     * @return stakeTime When user first staked
     * @return pendingRewards Pending reward amount
     * @return totalClaimed Total rewards claimed
     */
    function getUserStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 tier,
        uint256 stakeTime,
        uint256 pendingRewards,
        uint256 totalClaimed
    ) {
        UserStake memory userStake = userStakes[user];
        amount = userStake.amount;
        tier = userStake.tier;
        stakeTime = userStake.stakeTime;
        pendingRewards = calculatePendingRewards(user);
        totalClaimed = userStake.totalClaimed;
    }
    
    /**
     * @notice Get current staking statistics
     * @return totalStakedAmount Total SOLAR staked
     * @return totalUsers Total number of stakers
     * @return totalDistributed Total rewards distributed
     * @return currentEmission Current monthly emission rate
     * @return poolBalance Current reward pool balance
     */
    function getStakingStats() external view returns (
        uint256 totalStakedAmount,
        uint256 totalUsers,
        uint256 totalDistributed,
        uint256 currentEmission,
        uint256 poolBalance
    ) {
        totalStakedAmount = totalStaked;
        totalUsers = totalStakers;
        totalDistributed = totalRewardsDistributed;
        currentEmission = currentMonthlyEmission;
        poolBalance = rewardPool;
    }
    
    /**
     * @notice Get all staking tier information
     * @return tierIds Array of tier IDs
     * @return minimumStakes Array of minimum stake amounts
     * @return multipliers Array of reward multipliers
     * @return names Array of tier names
     * @return activeStatus Array of tier active status
     */
    function getAllTiers() external view returns (
        uint256[] memory tierIds,
        uint256[] memory minimumStakes,
        uint256[] memory multipliers,
        string[] memory names,
        bool[] memory activeStatus
    ) {
        tierIds = new uint256[](totalTiers);
        minimumStakes = new uint256[](totalTiers);
        multipliers = new uint256[](totalTiers);
        names = new string[](totalTiers);
        activeStatus = new bool[](totalTiers);
        
        for (uint256 i = 1; i <= totalTiers; i++) {
            tierIds[i-1] = i;
            minimumStakes[i-1] = stakingTiers[i].minimumStake;
            multipliers[i-1] = stakingTiers[i].multiplier;
            names[i-1] = stakingTiers[i].name;
            activeStatus[i-1] = stakingTiers[i].active;
        }
    }
    
    /**
     * @notice Get estimated APY for a tier
     * @param tierId Tier ID
     * @return apy Estimated APY in basis points
     */
    function getEstimatedAPY(uint256 tierId) external view returns (uint256 apy) {
        if (tierId == 0 || tierId > totalTiers || !stakingTiers[tierId].active) {
            return 0;
        }
        
        if (totalStaked == 0) {
            // If no one is staking, return theoretical max APY
            uint256 tierMultiplier = stakingTiers[tierId].multiplier;
            // Assume user would get 100% of emissions with their tier multiplier
            apy = (currentMonthlyEmission * 12 * tierMultiplier) / stakingTiers[tierId].minimumStake;
            return apy > 500000 ? 500000 : apy; // Cap at 5000% APY
        }
        
        // Calculate APY based on current conditions
        uint256 annualEmissions = currentMonthlyEmission * 12;
        uint256 multiplier = stakingTiers[tierId].multiplier;
        
        // Estimated share of total emissions for minimum stake at this tier
        uint256 userShare = (stakingTiers[tierId].minimumStake * 10000) / totalStaked;
        uint256 userAnnualRewards = (annualEmissions * userShare * multiplier) / (10000 * 10000);
        
        apy = (userAnnualRewards * 10000) / stakingTiers[tierId].minimumStake;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Fund reward pool with SOLAR tokens
     * @param amount Amount to add to reward pool
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        
        SOLAR_TOKEN.transferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        
        emit RewardPoolFunded(amount);
    }
    
    /**
     * @notice Update a staking tier
     * @param tierId Tier ID to update
     * @param minimumStake New minimum stake amount
     * @param multiplier New reward multiplier
     * @param name New tier name
     * @param active Whether tier is active
     */
    function updateTier(
        uint256 tierId,
        uint256 minimumStake,
        uint256 multiplier,
        string memory name,
        bool active
    ) external onlyOwner {
        require(tierId > 0 && tierId <= totalTiers, "Invalid tier ID");
        require(multiplier >= 10000 && multiplier <= 50000, "Multiplier must be between 1x and 5x");
        
        stakingTiers[tierId] = StakingTier(minimumStake, multiplier, name, active);
        
        emit TierUpdated(tierId, minimumStake, multiplier, name);
    }
    
    /**
     * @notice Add new staking tier
     * @param minimumStake Minimum stake amount
     * @param multiplier Reward multiplier
     * @param name Tier name
     */
    function addTier(
        uint256 minimumStake,
        uint256 multiplier,
        string memory name
    ) external onlyOwner {
        require(multiplier >= 10000 && multiplier <= 50000, "Multiplier must be between 1x and 5x");
        
        totalTiers++;
        stakingTiers[totalTiers] = StakingTier(minimumStake, multiplier, name, true);
        
        emit TierUpdated(totalTiers, minimumStake, multiplier, name);
    }
    
    /**
     * @notice Toggle emergency withdraw
     * @param enabled Whether to enable emergency withdrawals
     */
    function setEmergencyWithdraw(bool enabled) external onlyOwner {
        emergencyWithdrawEnabled = enabled;
        emit EmergencyWithdrawToggled(enabled);
    }
    
    /**
     * @notice Emergency withdraw (owner only)
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(SOLAR_TOKEN), "Cannot withdraw staked SOLAR");
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
     * @notice Force emission update (can be called by anyone)
     */
    function forceEmissionUpdate() external {
        updateEmissions();
        updateRewards();
    }
    
    /**
     * @notice Check if emission update is needed
     * @return needed Whether emission update is needed
     */
    function needsEmissionUpdate() external view returns (bool needed) {
        return (block.timestamp - lastEmissionUpdate) >= SECONDS_PER_MONTH;
    }
    
    /**
     * @notice Get months since emission start
     * @return months Number of months since emissions started
     */
    function getMonthsSinceStart() external view returns (uint256 months) {
        months = (block.timestamp - emissionStartTime) / SECONDS_PER_MONTH;
    }
}