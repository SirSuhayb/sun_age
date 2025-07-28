// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract USDCPurchaser {
    address public owner;
    address public treasury;
    IERC20 public usdc;
    IERC20 public solar;

    // Track user purchases (optional)
    mapping(address => uint256) public userRolls;

    event RollsPurchased(address indexed user, address indexed token, uint256 amount, uint256 rolls, string packageId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _usdc, address _solar, address _treasury) {
        owner = msg.sender;
        usdc = IERC20(_usdc);
        solar = IERC20(_solar);
        treasury = _treasury;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function purchaseRollsWithUSDC(uint256 usdcAmount, uint256 rolls, string calldata packageId) external {
        require(usdcAmount > 0 && rolls > 0, "Invalid params");
        require(usdc.transferFrom(msg.sender, treasury, usdcAmount), "USDC transfer failed");
        userRolls[msg.sender] += rolls;
        emit RollsPurchased(msg.sender, address(usdc), usdcAmount, rolls, packageId);
    }

    function purchaseRollsWithSOLAR(uint256 solarAmount, uint256 rolls, string calldata packageId) external {
        require(solarAmount > 0 && rolls > 0, "Invalid params");
        require(solar.transferFrom(msg.sender, treasury, solarAmount), "SOLAR transfer failed");
        userRolls[msg.sender] += rolls;
        emit RollsPurchased(msg.sender, address(solar), solarAmount, rolls, packageId);
    }
} 