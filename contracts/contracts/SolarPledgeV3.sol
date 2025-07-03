// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SolarPledgeV3
 * @dev Enhanced Solar Pledge contract with REAL USDC-to-SOLAR purchase & burn
 * @notice Maintains 1:1 compatibility + actual DEX integration for burns
 */
contract SolarPledgeV3 is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    // Token contracts
    IERC20 public constant USDC = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913); // Base USDC
    IERC20 public constant SOLAR_TOKEN = IERC20(0x746042147240304098C837563aAEc0F671881B07); // SOLAR
    
    // DEX integration for USDC → SOLAR swaps
    address public dexRouter; // Uniswap V3 or equivalent router
    address public constant WETH = 0x4200000000000000000000000000000000000006; // Base WETH
    uint24 public poolFee = 3000; // 0.3% fee tier
    
    // Renaissance integration contracts
    address public morphoTreasuryContract;   // Morpho treasury for yield generation
    address public solarUtilityContract;    // SolarUtility for premium features
    
    // Burn addresses
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Original pledge structure (1:1 compatibility)
    struct Pledge {
        address pledger;
        uint96 pledgeNumber;
        uint96 pledgeTimestamp;
        uint128 usdcPaid;           // Amount paid in USDC
        uint128 surplusAmount;      // Any surplus amount
        uint64 solarAge;            // Solar age in days at time of pledge
        bytes32 commitmentHash;     // Hash of the commitment
        bytes32 farcasterHandle;    // Farcaster handle as bytes32
        string commitmentText;      // The actual vow text
        bool isActive;              // Whether pledge is active
    }
    
    // Storage mappings (1:1 compatibility)
    mapping(address => Pledge) public pledges;
    mapping(address => bool) public hasPledged;
    mapping(address => uint96) public userBirthTimestamp;
    
    // Convergence period tracking (original functionality)
    struct ConvergencePeriod {
        uint96 startTime;
        uint96 endTime;
        uint96 periodTotalPledges;
        uint256 totalVolume;
        bool isActive;
    }
    
    mapping(uint256 => ConvergencePeriod) public convergencePeriods;
    uint256 public currentConvergencePeriodIndex;
    
    // Global counters
    uint256 public totalPledges;
    uint256 public totalVolume;
    uint256 public totalBurned;      // Total SOLAR burned
    uint256 public totalUsdcForBurns; // Total USDC used for burns
    
    // Renaissance features
    uint256 public constant MORPHO_TREASURY_SHARE = 5000; // 50% to Morpho treasury
    uint256 public constant PLEDGE_BURN_PERCENTAGE = 1000; // 10% of pledge amounts for burns
    uint256 public constant PREMIUM_FEATURE_THRESHOLD = 50 * 1e6; // $50+ pledges unlock premium features
    
    // Revenue tracking
    uint256 public totalRevenue;
    uint256 public morphoAllocatedRevenue;
    
    // Burn settings
    uint256 public minBurnThreshold = 10 * 1e6; // $10 minimum for burns
    uint256 public maxSlippage = 500; // 5% max slippage
    
    // ============ EVENTS ============
    
    // Original events
    event PledgeCreated(
        address indexed pledger,
        uint256 pledgeNumber,
        uint128 usdcPaid,
        uint64 solarAge,
        string commitment,
        bytes32 farcasterHandle
    );
    
    event BirthDateSet(address indexed user, uint96 birthTimestamp);
    event ConvergencePeriodSet(uint256 indexed periodId, uint96 startTime, uint96 endTime);
    
    // Renaissance events
    event MorphoTreasuryDeposit(uint256 amount);
    event SolarBurned(uint256 solarAmount, uint256 usdcUsed, string reason);
    event PremiumFeatureUnlocked(address indexed user, uint256 pledgeAmount);
    event RevenueAllocated(uint256 morphoShare, uint256 utilityShare);
    event UsdcToSolarSwap(uint256 usdcIn, uint256 solarOut, uint256 slippage);
    
    // ============ INTERFACES ============
    
    // Simplified Uniswap V3 Router interface
    interface ISwapRouter {
        struct ExactInputSingleParams {
            address tokenIn;
            address tokenOut;
            uint24 fee;
            address recipient;
            uint256 deadline;
            uint256 amountIn;
            uint256 amountOutMinimum;
            uint160 sqrtPriceLimitX96;
        }
        
        function exactInputSingle(ExactInputSingleParams calldata params)
            external
            payable
            returns (uint256 amountOut);
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _morphoTreasuryContract,
        address _solarUtilityContract,
        address _dexRouter
    ) Ownable(msg.sender) {
        morphoTreasuryContract = _morphoTreasuryContract;
        solarUtilityContract = _solarUtilityContract;
        dexRouter = _dexRouter;
        
        // Initialize first convergence period (30 days)
        uint96 startTime = uint96(block.timestamp);
        uint96 endTime = startTime + 30 days;
        
        convergencePeriods[0] = ConvergencePeriod({
            startTime: startTime,
            endTime: endTime,
            periodTotalPledges: 0,
            totalVolume: 0,
            isActive: true
        });
        
        currentConvergencePeriodIndex = 0;
    }
    
    // ============ CORE PLEDGE FUNCTIONS (1:1 COMPATIBILITY) ============
    
    /**
     * @notice Create a pledge with vow commitment (1:1 with original)
     * @param _commitment The text of the vow/commitment
     * @param _farcasterHandle Farcaster handle as bytes32
     * @param _pledgeAmount Amount to pledge in USDC (6 decimals)
     */
    function createPledge(
        string memory _commitment,
        bytes32 _farcasterHandle,
        uint128 _pledgeAmount
    ) external nonReentrant whenNotPaused {
        require(!hasPledged[msg.sender], "User has already pledged");
        require(_pledgeAmount > 0, "Pledge amount must be greater than 0");
        require(bytes(_commitment).length > 0, "Commitment cannot be empty");
        require(userBirthTimestamp[msg.sender] > 0, "Birth date must be set first");
        
        // Calculate solar age
        uint64 solarAge = _calculateSolarAge(msg.sender);
        require(solarAge > 0, "Invalid solar age");
        
        // Transfer USDC from user
        USDC.transferFrom(msg.sender, address(this), _pledgeAmount);
        
        // Create pledge struct
        uint96 pledgeNumber = uint96(totalPledges + 1);
        bytes32 commitmentHash = keccak256(abi.encodePacked(_commitment));
        
        pledges[msg.sender] = Pledge({
            pledger: msg.sender,
            pledgeNumber: pledgeNumber,
            pledgeTimestamp: uint96(block.timestamp),
            usdcPaid: _pledgeAmount,
            surplusAmount: 0, // Can be set by admin later
            solarAge: solarAge,
            commitmentHash: commitmentHash,
            farcasterHandle: _farcasterHandle,
            commitmentText: _commitment,
            isActive: true
        });
        
        hasPledged[msg.sender] = true;
        totalPledges++;
        totalVolume += _pledgeAmount;
        totalRevenue += _pledgeAmount;
        
        // Update current convergence period
        if (convergencePeriods[currentConvergencePeriodIndex].isActive) {
            convergencePeriods[currentConvergencePeriodIndex].periodTotalPledges++;
            convergencePeriods[currentConvergencePeriodIndex].totalVolume += _pledgeAmount;
        }
        
        // RENAISSANCE INTEGRATION: Process revenue through 50/50 split + burns
        _processRenaissanceRevenue(_pledgeAmount);
        
        // Check if pledge unlocks premium features
        if (_pledgeAmount >= PREMIUM_FEATURE_THRESHOLD) {
            _unlockPremiumFeatures(msg.sender, _pledgeAmount);
        }
        
        emit PledgeCreated(
            msg.sender,
            pledgeNumber,
            _pledgeAmount,
            solarAge,
            _commitment,
            _farcasterHandle
        );
    }
    
    /**
     * @notice Set user's birth date (1:1 with original)
     * @param _birthTimestamp Birth timestamp
     */
    function setBirthDate(uint96 _birthTimestamp) external {
        require(_birthTimestamp > 0, "Invalid birth timestamp");
        require(_birthTimestamp < block.timestamp, "Birth date cannot be in the future");
        require(userBirthTimestamp[msg.sender] == 0, "Birth date already set");
        
        userBirthTimestamp[msg.sender] = _birthTimestamp;
        emit BirthDateSet(msg.sender, _birthTimestamp);
    }
    
    // ============ RENAISSANCE INTEGRATION FUNCTIONS ============
    
    /**
     * @notice Process Renaissance revenue split and burns
     * @param _amount USDC amount to process
     */
    function _processRenaissanceRevenue(uint256 _amount) internal {
        // 50% to Morpho treasury for yield generation
        uint256 morphoShare = (_amount * MORPHO_TREASURY_SHARE) / 10000;
        
        // 10% for SOLAR burns (REAL USDC → SOLAR purchase & burn)
        uint256 burnShare = (_amount * PLEDGE_BURN_PERCENTAGE) / 10000;
        
        // Remaining stays in contract for operations
        uint256 remaining = _amount - morphoShare - burnShare;
        
        // Send to Morpho treasury
        if (morphoShare > 0 && morphoTreasuryContract != address(0)) {
            USDC.transfer(morphoTreasuryContract, morphoShare);
            morphoAllocatedRevenue += morphoShare;
            
            // Notify Morpho treasury
            (bool success,) = morphoTreasuryContract.call(
                abi.encodeWithSignature("addRevenue(uint256)", morphoShare)
            );
            
            if (success) {
                emit MorphoTreasuryDeposit(morphoShare);
            }
        }
        
        // Execute REAL USDC → SOLAR purchase & burn
        if (burnShare > 0 && burnShare >= minBurnThreshold) {
            _executeRealBurn(burnShare);
        }
        
        emit RevenueAllocated(morphoShare, remaining);
    }
    
    /**
     * @notice Execute REAL USDC → SOLAR purchase & burn via DEX
     * @param _usdcAmount Amount of USDC to swap for SOLAR and burn
     */
    function _executeRealBurn(uint256 _usdcAmount) internal {
        if (dexRouter == address(0)) {
            // Fallback: keep USDC for manual burns
            return;
        }
        
        try this._performSwapAndBurn(_usdcAmount) {
            totalUsdcForBurns += _usdcAmount;
        } catch {
            // If swap fails, keep USDC for later manual burn
            emit SolarBurned(0, _usdcAmount, "Swap failed - USDC held for manual burn");
        }
    }
    
    /**
     * @notice Perform the actual swap and burn (external call for try/catch)
     * @param _usdcAmount Amount of USDC to swap
     */
    function _performSwapAndBurn(uint256 _usdcAmount) external {
        require(msg.sender == address(this), "Only self-call allowed");
        
        // Approve DEX router to spend USDC
        USDC.approve(dexRouter, _usdcAmount);
        
        // Calculate minimum SOLAR output (with slippage protection)
        uint256 minSolarOut = _calculateMinSolarOutput(_usdcAmount);
        
        // Prepare swap parameters
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: address(USDC),
            tokenOut: address(SOLAR_TOKEN),
            fee: poolFee,
            recipient: address(this),
            deadline: block.timestamp + 300, // 5 minutes
            amountIn: _usdcAmount,
            amountOutMinimum: minSolarOut,
            sqrtPriceLimitX96: 0
        });
        
        // Execute swap: USDC → SOLAR
        uint256 solarReceived = ISwapRouter(dexRouter).exactInputSingle(params);
        
        // Burn all received SOLAR tokens
        SOLAR_TOKEN.transfer(BURN_ADDRESS, solarReceived);
        
        // Update tracking
        totalBurned += solarReceived;
        
        // Calculate actual slippage
        uint256 expectedSolar = (_usdcAmount * 1_000_000 * 1e18) / 1e6; // Rough estimate
        uint256 slippage = expectedSolar > solarReceived ? 
            ((expectedSolar - solarReceived) * 10000) / expectedSolar : 0;
        
        emit UsdcToSolarSwap(_usdcAmount, solarReceived, slippage);
        emit SolarBurned(solarReceived, _usdcAmount, "Real DEX purchase & burn");
    }
    
    /**
     * @notice Calculate minimum SOLAR output with slippage protection
     * @param _usdcAmount Input USDC amount
     * @return minSolarOut Minimum SOLAR output
     */
    function _calculateMinSolarOutput(uint256 _usdcAmount) internal view returns (uint256) {
        // Simplified calculation - in production, use price oracle
        uint256 expectedSolar = (_usdcAmount * 1_000_000 * 1e18) / 1e6; // 1 USDC = 1M SOLAR estimate
        return (expectedSolar * (10000 - maxSlippage)) / 10000;
    }
    
    /**
     * @notice Manual burn function for accumulated USDC (admin only)
     * @param _usdcAmount Amount of USDC to manually swap and burn
     */
    function manualBurn(uint256 _usdcAmount) external onlyOwner {
        require(_usdcAmount <= USDC.balanceOf(address(this)), "Insufficient USDC balance");
        _executeRealBurn(_usdcAmount);
    }
    
    /**
     * @notice Unlock premium features for high-value pledgers
     * @param _user User address
     * @param _pledgeAmount Pledge amount
     */
    function _unlockPremiumFeatures(address _user, uint256 _pledgeAmount) internal {
        if (solarUtilityContract != address(0)) {
            // Grant premium access based on pledge amount
            bytes32 feature;
            uint256 duration = 365 days; // 1 year access
            
            if (_pledgeAmount >= 100 * 1e6) { // $100+
                feature = "vip_support";
            } else if (_pledgeAmount >= 75 * 1e6) { // $75+
                feature = "advanced_journey";
            } else if (_pledgeAmount >= 50 * 1e6) { // $50+
                feature = "premium_analytics";
            }
            
            if (feature != bytes32(0)) {
                (bool success,) = solarUtilityContract.call(
                    abi.encodeWithSignature(
                        "grantTemporaryAccess(address,bytes32,uint256)",
                        _user,
                        feature,
                        duration
                    )
                );
                
                if (success) {
                    emit PremiumFeatureUnlocked(_user, _pledgeAmount);
                }
            }
        }
    }
    
    /**
     * @notice Calculate solar age in days (1:1 with original)
     * @param _user User address
     * @return age Solar age in days
     */
    function _calculateSolarAge(address _user) internal view returns (uint64) {
        uint96 birthTime = userBirthTimestamp[_user];
        if (birthTime == 0) return 0;
        
        uint256 ageInSeconds = block.timestamp - birthTime;
        return uint64(ageInSeconds / 1 days);
    }
    
    // ============ VIEW FUNCTIONS (1:1 COMPATIBILITY) ============
    
    function getPledge(address _pledger) external view returns (Pledge memory pledge) {
        require(hasPledged[_pledger], "User has not pledged");
        return pledges[_pledger];
    }
    
    function hasPledge(address _user) external view returns (bool) {
        return hasPledged[_user];
    }
    
    function getCurrentConvergencePeriodIndex() external view returns (uint256) {
        return currentConvergencePeriodIndex;
    }
    
    function getConvergencePeriod(uint256 _periodIndex) external view returns (ConvergencePeriod memory) {
        return convergencePeriods[_periodIndex];
    }
    
    /**
     * @notice Get Renaissance stats with burn metrics
     */
    function getRenaissanceStats() external view returns (
        uint256 totalPledgeVolume,
        uint256 totalSolarBurned,
        uint256 morphoRevenue,
        uint256 activePledgers,
        uint256 currentPeriodVolume,
        uint256 usdcUsedForBurns
    ) {
        totalPledgeVolume = totalVolume;
        totalSolarBurned = totalBurned;
        morphoRevenue = morphoAllocatedRevenue;
        activePledgers = totalPledges;
        usdcUsedForBurns = totalUsdcForBurns;
        
        if (convergencePeriods[currentConvergencePeriodIndex].isActive) {
            currentPeriodVolume = convergencePeriods[currentConvergencePeriodIndex].totalVolume;
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function updateDexRouter(address _newRouter) external onlyOwner {
        dexRouter = _newRouter;
    }
    
    function updateBurnSettings(
        uint256 _minBurnThreshold,
        uint256 _maxSlippage,
        uint24 _poolFee
    ) external onlyOwner {
        minBurnThreshold = _minBurnThreshold;
        maxSlippage = _maxSlippage;
        poolFee = _poolFee;
    }
    
    function updateRenaissanceContracts(
        address _morphoTreasury,
        address _solarUtility
    ) external onlyOwner {
        morphoTreasuryContract = _morphoTreasury;
        solarUtilityContract = _solarUtility;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency functions
    function emergencyWithdraw(address _token, uint256 _amount, address _to) external onlyOwner {
        IERC20(_token).transfer(_to, _amount);
    }
}