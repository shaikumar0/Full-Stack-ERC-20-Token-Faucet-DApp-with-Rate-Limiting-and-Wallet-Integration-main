// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IToken {
    function mint(address to, uint256 amount) external;
}

contract TokenFaucet is ReentrancyGuard {
    IToken public token;

    uint256 public constant FAUCET_AMOUNT = 100 ether;
    uint256 public constant COOLDOWN_TIME = 24 hours;
    uint256 public constant MAX_CLAIM_AMOUNT = 1000 ether;

    address public admin;
    bool private paused;

    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    constructor(address tokenAddress) {
        token = IToken(tokenAddress);
        admin = msg.sender;
        paused = false;
    }

    function requestTokens() external nonReentrant {
       require(!paused, "Faucet is paused");

        uint256 remaining = remainingAllowance(msg.sender);
        require(remaining >= FAUCET_AMOUNT, "Lifetime claim limit reached");

        require(
            block.timestamp >= lastClaimAt[msg.sender] + COOLDOWN_TIME,
            "Cooldown period not elapsed"
        );


        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        token.mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    function canClaim(address user) public view returns (bool) {
        if (paused) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        return true;
    }

    function remainingAllowance(address user) public view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return 0;
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    function setPaused(bool _paused) external {
        require(msg.sender == admin, "Only admin can pause");
        paused = _paused;
        emit FaucetPaused(_paused);
    }

    function isPaused() external view returns (bool) {
        return paused;
    }
}
