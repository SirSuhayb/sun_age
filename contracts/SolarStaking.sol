// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title SolarToken
 * @dev ERC20 token with emission schedule and governance features
 */
contract SolarToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18; // 100M tokens
    uint256 public constant INITIAL_MONTHLY_EMISSION = 50_000 * 1e18; // 50K per month
    uint256 public constant EMISSION_REDUCTION_RATE = 200; // 2% per month (in basis points)
    
    uint256 public monthlyEmission;
    uint256 public lastEmissionTime;
    uint256 public totalEmitted;
    
    address public stakingContract;
    
    event EmissionReduced(uint256 oldEmission, uint256 newEmission);
    event TokensEmitted(uint256 amount, address recipient);
    
    constructor() ERC20("Solar Token", "SOLAR") {
        monthlyEmission = INITIAL_MONTHLY_EMISSION;
        lastEmissionTime = block.timestamp;
        
        // Initial mint for liquidity and early adopters
        uint256 initialMint = 10_000_000 * 1e18; // 10M tokens
        _mint(msg.sender, initialMint);
        totalEmitted = initialMint;
    }
    
    /**
     * @notice Set the staking contract address
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        stakingContract = _stakingContract;
    }
    
    /**
     * @notice Emit tokens according to schedule
     */
    function emitMonthlyTokens() external {
        require(stakingContract != address(0), "Staking contract not set");
        require(block.timestamp >= lastEmissionTime + 30 days, "Too early for emission");
        require(totalEmitted < MAX_SUPPLY, "Max supply reached");
        
        uint256 emissionAmount = Math.min(monthlyEmission, MAX_SUPPLY - totalEmitted);
        
        _mint(stakingContract, emissionAmount);
        totalEmitted += emissionAmount;
        lastEmissionTime = block.timestamp;
        
        // Reduce next month's emission by 2%
        uint256 oldEmission = monthlyEmission;
        monthlyEmission = (monthlyEmission * (10000 - EMISSION_REDUCTION_RATE)) / 10000;
        
        emit TokensEmitted(emissionAmount, stakingContract);
        emit EmissionReduced(oldEmission, monthlyEmission);
    }
    
    /**
     * @notice Get current emission info
     */
    function getEmissionInfo() external view returns (
        uint256 currentMonthlyEmission,
        uint256 nextEmissionTime,
        uint256 remainingSupply
    ) {
        currentMonthlyEmission = monthlyEmission;
        nextEmissionTime = lastEmissionTime + 30 days;
        remainingSupply = MAX_SUPPLY - totalEmitted;
    }
}

/**
 * @title SolarStaking
 * @dev Staking contract for SOLAR tokens with yield distribution and governance
 */
contract SolarStaking is ReentrancyGuard, Ownable, Pausable {
    using Math for uint256;
    
    // ============ STATE VARIABLES ============
    
    IERC20 public immutable solarToken;
    IERC20 public immutable usdcToken;
    
    // Staking tiers and multipliers
    enum StakingTier { None, SolarSeeker, CosmicGuardian, StellarArchitect, SupernovaCouncil }
    
    struct TierInfo {
        uint256 minStake;
        uint256 multiplier; // In basis points (10000 = 1x)
        string name;
    }
    
    mapping(StakingTier => TierInfo) public tiers;
    
    // Lock periods and bonuses
    struct LockInfo {
        uint256 duration; // in seconds
        uint256 multiplier; // In basis points (10000 = 1x)
    }
    
    mapping(uint256 => LockInfo) public lockPeriods; // 0=30days, 1=90days, 2=180days, 3=365days
    
    // User stake information
    struct StakeInfo {
        uint256 amount;           // Amount of SOLAR staked
        uint256 lockPeriod;       // Lock period index
        uint256 startTime;        // When stake was created
        uint256 endTime;          // When stake can be unstaked
        uint256 lastRewardTime;   // Last time rewards were calculated
        uint256 pendingRewards;   // Pending USDC rewards
        StakingTier tier;         // Current tier
    }
    
    mapping(address => StakeInfo) public stakes;
    address[] public allStakers;
    mapping(address => bool) public isStaker;
    
    // Global staking stats
    uint256 public totalStaked;
    uint256 public totalWeightedStakes; // Weighted by multipliers
    uint256 public totalRewardsDistributed;
    
    // Reward distribution
    uint256 public rewardPool; // USDC available for distribution
    uint256 public accumulatedRewardPerShare; // Accumulated rewards per weighted share
    uint256 public constant PRECISION = 1e18;
    
    // Authorized contracts that can distribute rewards
    mapping(address => bool) public authorizedDistributors;
    
    // ============ EVENTS ============
    
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod, StakingTier tier);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsDistributed(uint256 amount, address indexed distributor);
    event RewardsClaimed(address indexed user, uint256 amount);
    event TierUpgraded(address indexed user, StakingTier oldTier, StakingTier newTier);
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _solarToken, address _usdcToken) {
        solarToken = IERC20(_solarToken);
        usdcToken = IERC20(_usdcToken);
        
        // Initialize tiers
        tiers[StakingTier.SolarSeeker] = TierInfo(1_000 * 1e18, 10000, "Solar Seeker");
        tiers[StakingTier.CosmicGuardian] = TierInfo(10_000 * 1e18, 12500, "Cosmic Guardian");
        tiers[StakingTier.StellarArchitect] = TierInfo(50_000 * 1e18, 15000, "Stellar Architect");
        tiers[StakingTier.SupernovaCouncil] = TierInfo(100_000 * 1e18, 20000, "Supernova Council");
        
        // Initialize lock periods
        lockPeriods[0] = LockInfo(30 days, 10000);   // 30 days - 1x
        lockPeriods[1] = LockInfo(90 days, 12500);   // 90 days - 1.25x
        lockPeriods[2] = LockInfo(180 days, 15000);  // 180 days - 1.5x
        lockPeriods[3] = LockInfo(365 days, 20000);  // 365 days - 2x
    }
    
    // ============ STAKING FUNCTIONS ============
    
    /**
     * @notice Stake SOLAR tokens with specified lock period
     * @param _amount Amount of SOLAR to stake
     * @param _lockPeriodIndex Lock period index (0-3)
     */
    function stake(uint256 _amount, uint256 _lockPeriodIndex) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be positive");
        require(_lockPeriodIndex < 4, "Invalid lock period");
        require(stakes[msg.sender].amount == 0, "Already staking");
        
        // Transfer tokens
        solarToken.transferFrom(msg.sender, address(this), _amount);
        
        // Calculate tier
        StakingTier tier = _calculateTier(_amount);
        
        // Create stake
        stakes[msg.sender] = StakeInfo({
            amount: _amount,
            lockPeriod: _lockPeriodIndex,
            startTime: block.timestamp,
            endTime: block.timestamp + lockPeriods[_lockPeriodIndex].duration,
            lastRewardTime: block.timestamp,
            pendingRewards: 0,
            tier: tier
        });
        
        // Add to stakers list
        if (!isStaker[msg.sender]) {
            allStakers.push(msg.sender);
            isStaker[msg.sender] = true;
        }
        
        // Update global stats
        totalStaked += _amount;
        totalWeightedStakes += _getWeightedStake(_amount, tier, _lockPeriodIndex);
        
        emit Staked(msg.sender, _amount, _lockPeriodIndex, tier);
    }
    
    /**
     * @notice Add more tokens to existing stake
     * @param _amount Additional amount to stake
     */
    function addToStake(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be positive");
        require(stakes[msg.sender].amount > 0, "No existing stake");
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        // Update rewards before modifying stake
        _updateUserRewards(msg.sender);
        
        // Transfer additional tokens
        solarToken.transferFrom(msg.sender, address(this), _amount);
        
        // Update stake amount
        uint256 oldWeightedStake = _getWeightedStake(userStake.amount, userStake.tier, userStake.lockPeriod);
        userStake.amount += _amount;
        
        // Check for tier upgrade
        StakingTier newTier = _calculateTier(userStake.amount);
        if (newTier != userStake.tier) {
            emit TierUpgraded(msg.sender, userStake.tier, newTier);
            userStake.tier = newTier;
        }
        
        // Update global stats
        totalStaked += _amount;
        uint256 newWeightedStake = _getWeightedStake(userStake.amount, userStake.tier, userStake.lockPeriod);
        totalWeightedStakes = totalWeightedStakes - oldWeightedStake + newWeightedStake;
    }
    
    /**
     * @notice Unstake tokens after lock period
     */
    function unstake() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(block.timestamp >= userStake.endTime, "Stake still locked");
        
        // Update and claim rewards
        _updateUserRewards(msg.sender);
        uint256 rewards = userStake.pendingRewards;
        if (rewards > 0) {
            userStake.pendingRewards = 0;
            usdcToken.transfer(msg.sender, rewards);
            totalRewardsDistributed += rewards;
        }
        
        // Return staked tokens
        uint256 stakedAmount = userStake.amount;
        uint256 weightedStake = _getWeightedStake(userStake.amount, userStake.tier, userStake.lockPeriod);
        
        // Update global stats
        totalStaked -= stakedAmount;
        totalWeightedStakes -= weightedStake;
        
        // Clear stake
        delete stakes[msg.sender];
        
        // Transfer tokens back
        solarToken.transfer(msg.sender, stakedAmount);
        
        emit Unstaked(msg.sender, stakedAmount, rewards);
    }
    
    /**
     * @notice Claim pending rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        require(stakes[msg.sender].amount > 0, "No stake found");
        
        _updateUserRewards(msg.sender);
        
        uint256 rewards = stakes[msg.sender].pendingRewards;
        require(rewards > 0, "No rewards available");
        
        stakes[msg.sender].pendingRewards = 0;
        usdcToken.transfer(msg.sender, rewards);
        totalRewardsDistributed += rewards;
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    // ============ REWARD DISTRIBUTION ============
    
    /**
     * @notice Distribute USDC rewards to all stakers (authorized distributors only)
     * @param _amount Amount of USDC to distribute
     */
    function distributeRewards(uint256 _amount) external {
        require(authorizedDistributors[msg.sender], "Not authorized distributor");
        require(_amount > 0, "Amount must be positive");
        require(totalWeightedStakes > 0, "No stakers");
        
        // Transfer USDC from distributor
        usdcToken.transferFrom(msg.sender, address(this), _amount);
        
        // Update global reward accumulator
        accumulatedRewardPerShare += (_amount * PRECISION) / totalWeightedStakes;
        rewardPool += _amount;
        
        emit RewardsDistributed(_amount, msg.sender);
    }
    
    /**
     * @notice Internal function to update user rewards
     */
    function _updateUserRewards(address _user) internal {
        StakeInfo storage userStake = stakes[_user];
        if (userStake.amount == 0) return;
        
        uint256 weightedStake = _getWeightedStake(userStake.amount, userStake.tier, userStake.lockPeriod);
        uint256 userRewardPerShare = (accumulatedRewardPerShare * weightedStake) / PRECISION;
        
        // Calculate rewards since last update
        uint256 lastUserRewardPerShare = (userStake.lastRewardTime * PRECISION) / totalWeightedStakes;
        if (userRewardPerShare > lastUserRewardPerShare) {
            userStake.pendingRewards += userRewardPerShare - lastUserRewardPerShare;
        }
        
        userStake.lastRewardTime = block.timestamp;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get user's current stake information
     */
    function getUserStake(address _user) external view returns (
        uint256 amount,
        uint256 lockPeriod,
        uint256 startTime,
        uint256 endTime,
        uint256 pendingRewards,
        StakingTier tier,
        uint256 weightedStake,
        bool canUnstake
    ) {
        StakeInfo memory userStake = stakes[_user];
        amount = userStake.amount;
        lockPeriod = userStake.lockPeriod;
        startTime = userStake.startTime;
        endTime = userStake.endTime;
        pendingRewards = _calculatePendingRewards(_user);
        tier = userStake.tier;
        weightedStake = _getWeightedStake(userStake.amount, userStake.tier, userStake.lockPeriod);
        canUnstake = block.timestamp >= userStake.endTime;
    }
    
    /**
     * @notice Calculate pending rewards for a user
     */
    function _calculatePendingRewards(address _user) internal view returns (uint256) {
        StakeInfo memory userStake = stakes[_user];
        if (userStake.amount == 0) return 0;
        
        uint256 weightedStake = _getWeightedStake(userStake.amount, userStake.tier, userStake.lockPeriod);
        uint256 userRewardPerShare = (accumulatedRewardPerShare * weightedStake) / PRECISION;
        uint256 lastUserRewardPerShare = (userStake.lastRewardTime * PRECISION) / totalWeightedStakes;
        
        uint256 newRewards = userRewardPerShare > lastUserRewardPerShare ? 
            userRewardPerShare - lastUserRewardPerShare : 0;
        
        return userStake.pendingRewards + newRewards;
    }
    
    /**
     * @notice Get staking statistics
     */
    function getStakingStats() external view returns (
        uint256 totalStakers,
        uint256 totalStakedAmount,
        uint256 totalWeightedAmount,
        uint256 totalRewardsPool,
        uint256 totalDistributed
    ) {
        totalStakers = allStakers.length;
        totalStakedAmount = totalStaked;
        totalWeightedAmount = totalWeightedStakes;
        totalRewardsPool = rewardPool;
        totalDistributed = totalRewardsDistributed;
    }
    
    /**
     * @notice Calculate tier based on stake amount
     */
    function _calculateTier(uint256 _amount) internal view returns (StakingTier) {
        if (_amount >= tiers[StakingTier.SupernovaCouncil].minStake) {
            return StakingTier.SupernovaCouncil;
        } else if (_amount >= tiers[StakingTier.StellarArchitect].minStake) {
            return StakingTier.StellarArchitect;
        } else if (_amount >= tiers[StakingTier.CosmicGuardian].minStake) {
            return StakingTier.CosmicGuardian;
        } else if (_amount >= tiers[StakingTier.SolarSeeker].minStake) {
            return StakingTier.SolarSeeker;
        } else {
            return StakingTier.None;
        }
    }
    
    /**
     * @notice Calculate weighted stake amount
     */
    function _getWeightedStake(uint256 _amount, StakingTier _tier, uint256 _lockPeriod) internal view returns (uint256) {
        uint256 tierMultiplier = tiers[_tier].multiplier;
        uint256 lockMultiplier = lockPeriods[_lockPeriod].multiplier;
        
        return (_amount * tierMultiplier * lockMultiplier) / (10000 * 10000);
    }
    
    /**
     * @notice Get weighted stake for external use
     */
    function getWeightedStake(address _user) external view returns (uint256) {
        StakeInfo memory userStake = stakes[_user];
        return _getWeightedStake(userStake.amount, userStake.tier, userStake.lockPeriod);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Add authorized distributor
     */
    function addAuthorizedDistributor(address _distributor) external onlyOwner {
        authorizedDistributors[_distributor] = true;
    }
    
    /**
     * @notice Remove authorized distributor
     */
    function removeAuthorizedDistributor(address _distributor) external onlyOwner {
        authorizedDistributors[_distributor] = false;
    }
    
    /**
     * @notice Update tier requirements
     */
    function updateTier(StakingTier _tier, uint256 _minStake, uint256 _multiplier, string memory _name) external onlyOwner {
        tiers[_tier] = TierInfo(_minStake, _multiplier, _name);
    }
    
    /**
     * @notice Update lock period settings
     */
    function updateLockPeriod(uint256 _index, uint256 _duration, uint256 _multiplier) external onlyOwner {
        require(_index < 4, "Invalid lock period index");
        lockPeriods[_index] = LockInfo(_duration, _multiplier);
    }
    
    /**
     * @notice Emergency pause
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Emergency unpause
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Emergency withdraw (only when paused)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner whenPaused {
        IERC20(_token).transfer(msg.sender, _amount);
    }
}