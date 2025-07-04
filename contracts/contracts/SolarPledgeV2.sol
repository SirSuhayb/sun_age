// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SolarPledgeV2
 * @dev Enhanced Solar Pledge contract with SOLAR Renaissance integration
 * @notice Maintains 1:1 compatibility with original SolarPledge + Morpho yield integration
 */
contract SolarPledgeV2 is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    // Token contracts
    IERC20 public constant USDC = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913); // Base USDC
    IERC20 public constant SOLAR_TOKEN = IERC20(0x746042147240304098C837563aAEc0F671881B07); // SOLAR
    
    // Renaissance integration contracts
    address public morphoTreasuryContract;   // Morpho treasury for yield generation
    address public solarUtilityContract;    // SolarUtility for premium features
    
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
    uint256 public totalBurned;  // New: track SOLAR burns
    
    // Renaissance features
    uint256 public constant MORPHO_TREASURY_SHARE = 5000; // 50% to Morpho treasury
    uint256 public constant PLEDGE_BURN_PERCENTAGE = 1000; // 10% of pledge amounts for burns
    uint256 public constant PREMIUM_FEATURE_THRESHOLD = 50 * 1e6; // $50+ pledges unlock premium features
    
    // Revenue tracking
    uint256 public totalRevenue;
    uint256 public morphoAllocatedRevenue;
    
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
    event SolarBurned(uint256 amount, string reason);
    event PremiumFeatureUnlocked(address indexed user, uint256 pledgeAmount);
    event RevenueAllocated(uint256 morphoShare, uint256 utilityShare);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _morphoTreasuryContract,
        address _solarUtilityContract
    ) Ownable(msg.sender) {
        morphoTreasuryContract = _morphoTreasuryContract;
        solarUtilityContract = _solarUtilityContract;
        
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
    
    // ============ VIEW FUNCTIONS (1:1 COMPATIBILITY) ============
    
    /**
     * @notice Get pledge for a user (1:1 with original)
     * @param _pledger Address to check
     * @return pledge Pledge struct
     */
    function getPledge(address _pledger) external view returns (Pledge memory pledge) {
        require(hasPledged[_pledger], "User has not pledged");
        return pledges[_pledger];
    }
    
    /**
     * @notice Check if user has pledged (1:1 with original)
     * @param _user Address to check
     * @return hasPledge Whether user has pledged
     */
    function hasPledge(address _user) external view returns (bool) {
        return hasPledged[_user];
    }
    
    /**
     * @notice Get current convergence period index (1:1 with original)
     * @return index Current period index
     */
    function getCurrentConvergencePeriodIndex() external view returns (uint256) {
        return currentConvergencePeriodIndex;
    }
    
    /**
     * @notice Get convergence period details (1:1 with original)
     * @param _periodIndex Period index
     * @return period ConvergencePeriod struct
     */
    function getConvergencePeriod(uint256 _periodIndex) external view returns (ConvergencePeriod memory) {
        return convergencePeriods[_periodIndex];
    }
    
    // ============ RENAISSANCE INTEGRATION FUNCTIONS ============
    
    /**
     * @notice Process Renaissance revenue split and burns
     * @param _amount USDC amount to process
     */
    function _processRenaissanceRevenue(uint256 _amount) internal {
        // 50% to Morpho treasury for yield generation
        uint256 morphoShare = (_amount * MORPHO_TREASURY_SHARE) / 10000;
        
        // 10% for SOLAR burns (convert USDC to SOLAR and burn)
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
        
        // Execute SOLAR burn (simplified - uses static conversion rate)
        if (burnShare > 0) {
            _executePledgeBurn(burnShare);
        }
        
        emit RevenueAllocated(morphoShare, remaining);
    }
    
    /**
     * @notice Execute SOLAR burn from pledge revenue
     * @param _usdcAmount Amount of USDC to convert to SOLAR and burn
     */
    function _executePledgeBurn(uint256 _usdcAmount) internal {
        // Simplified conversion: 1 USDC = 1M SOLAR (adjustable by owner)
        uint256 solarPerUSDC = 1_000_000 * 1e18;
        uint256 solarToBurn = (_usdcAmount * solarPerUSDC) / 1e6;
        
        // Burn from contract balance if available, otherwise skip
        if (SOLAR_TOKEN.balanceOf(address(this)) >= solarToBurn) {
            SOLAR_TOKEN.transfer(0x000000000000000000000000000000000000dEaD, solarToBurn);
            totalBurned += solarToBurn;
            emit SolarBurned(solarToBurn, "Pledge revenue burn");
        }
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
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Set convergence period (1:1 with original)
     * @param _startTime Start timestamp
     * @param _endTime End timestamp
     * @param _setAsActive Whether to set as active period
     */
    function setConvergencePeriod(
        uint96 _startTime,
        uint96 _endTime,
        bool _setAsActive
    ) external onlyOwner {
        require(_endTime > _startTime, "End time must be after start time");
        
        uint256 newPeriodIndex = currentConvergencePeriodIndex + 1;
        
        convergencePeriods[newPeriodIndex] = ConvergencePeriod({
            startTime: _startTime,
            endTime: _endTime,
            periodTotalPledges: 0,
            totalVolume: 0,
            isActive: _setAsActive
        });
        
        if (_setAsActive) {
            // Deactivate current period
            convergencePeriods[currentConvergencePeriodIndex].isActive = false;
            currentConvergencePeriodIndex = newPeriodIndex;
        }
        
        emit ConvergencePeriodSet(newPeriodIndex, _startTime, _endTime);
    }
    
    /**
     * @notice Update Renaissance contract addresses
     * @param _morphoTreasury New Morpho treasury address
     * @param _solarUtility New SolarUtility address
     */
    function updateRenaissanceContracts(
        address _morphoTreasury,
        address _solarUtility
    ) external onlyOwner {
        morphoTreasuryContract = _morphoTreasury;
        solarUtilityContract = _solarUtility;
    }
    
    /**
     * @notice Fund contract with SOLAR for burns
     * @param _amount Amount of SOLAR to transfer to contract
     */
    function fundSolarForBurns(uint256 _amount) external onlyOwner {
        SOLAR_TOKEN.transferFrom(msg.sender, address(this), _amount);
    }
    
    /**
     * @notice Emergency withdraw function
     * @param _token Token address to withdraw
     * @param _amount Amount to withdraw
     * @param _to Recipient address
     */
    function emergencyWithdraw(
        address _token,
        uint256 _amount,
        address _to
    ) external onlyOwner {
        IERC20(_token).transfer(_to, _amount);
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
    
    // ============ RENAISSANCE VIEW FUNCTIONS ============
    
    /**
     * @notice Get Renaissance stats
     * @return totalPledgeVolume Total volume of pledges
     * @return totalSolarBurned Total SOLAR tokens burned
     * @return morphoRevenue Revenue sent to Morpho
     * @return activePledgers Number of active pledgers
     * @return currentPeriodVolume Volume in current period
     */
    function getRenaissanceStats() external view returns (
        uint256 totalPledgeVolume,
        uint256 totalSolarBurned,
        uint256 morphoRevenue,
        uint256 activePledgers,
        uint256 currentPeriodVolume
    ) {
        totalPledgeVolume = totalVolume;
        totalSolarBurned = totalBurned;
        morphoRevenue = morphoAllocatedRevenue;
        activePledgers = totalPledges;
        
        if (convergencePeriods[currentConvergencePeriodIndex].isActive) {
            currentPeriodVolume = convergencePeriods[currentConvergencePeriodIndex].totalVolume;
        }
    }
    
    /**
     * @notice Check if user qualifies for premium features
     * @param _user User address
     * @return qualifies Whether user qualifies
     * @return pledgeAmount Their pledge amount
     */
    function checkPremiumQualification(address _user) external view returns (
        bool qualifies,
        uint256 pledgeAmount
    ) {
        if (!hasPledged[_user]) {
            return (false, 0);
        }
        
        pledgeAmount = pledges[_user].usdcPaid;
        qualifies = pledgeAmount >= PREMIUM_FEATURE_THRESHOLD;
    }
    
    /**
     * @notice Get user's complete profile
     * @param _user User address
     * @return hasSetBirthDate Whether user has set birth date
     * @return birthTimestamp User's birth timestamp
     * @return hasMadePledge Whether user has made a pledge
     * @return pledge User's pledge data
     * @return currentSolarAge User's current solar age
     * @return premiumQualified Whether user qualifies for premium features
     */
    function getUserProfile(address _user) external view returns (
        bool hasSetBirthDate,
        uint96 birthTimestamp,
        bool hasMadePledge,
        Pledge memory pledge,
        uint64 currentSolarAge,
        bool premiumQualified
    ) {
        hasSetBirthDate = userBirthTimestamp[_user] > 0;
        birthTimestamp = userBirthTimestamp[_user];
        hasMadePledge = hasPledged[_user];
        
        if (hasMadePledge) {
            pledge = pledges[_user];
        }
        
        if (hasSetBirthDate) {
            currentSolarAge = _calculateSolarAge(_user);
        }
        
        if (hasMadePledge) {
            premiumQualified = pledges[_user].usdcPaid >= PREMIUM_FEATURE_THRESHOLD;
        }
    }
}