// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Vertex is ERC20, Ownable, ReentrancyGuard, Pausable {
    uint256 public constant SLOPE = 1000000000000000;
    uint256 public constant TAX_RATE = 5;

    uint256 public poolBalance;
    uint256 public floorBalance;

    event Trade(
        address indexed user,
        string side,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 tax,
        uint256 timestamp
    );

    constructor() ERC20("Vertex Protocol", "VTX") Ownable(msg.sender) {}

    function getBuyPrice(uint256 amount) public view returns (uint256) {
        uint256 currentSupply = totalSupply();
        uint256 newSupply = currentSupply + amount;
        return (SLOPE * ((newSupply**2) - (currentSupply**2))) / (2 * 10**36);
    }

    function getSellPrice(uint256 amount) public view returns (uint256) {
        uint256 currentSupply = totalSupply();
        uint256 newSupply = currentSupply - amount;
        return (SLOPE * ((currentSupply**2) - (newSupply**2))) / (2 * 10**36);
    }

    function getSpotPrice() public view returns (uint256) {
        return (totalSupply() * SLOPE) / 10**18;
    }

    function buy(uint256 tokenAmount, uint256 maxEthCost) public payable nonReentrant whenNotPaused {
        require(tokenAmount > 0, "Amount must be > 0");

        uint256 cost = getBuyPrice(tokenAmount);
        require(cost <= maxEthCost, "Slippage: Price too high");
        require(msg.value >= cost, "Insufficient ETH sent");

        uint256 tax = (cost * TAX_RATE) / 100;
        uint256 toPool = cost - tax;

        floorBalance += tax;
        poolBalance += toPool;

        _mint(msg.sender, tokenAmount);

        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        emit Trade(msg.sender, "BUY", cost, tokenAmount, tax, block.timestamp);
    }

    function sell(uint256 tokenAmount, uint256 minEthReturn) public nonReentrant whenNotPaused {
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient VTX balance");

        uint256 ethReturn = getSellPrice(tokenAmount);

        uint256 tax = (ethReturn * TAX_RATE) / 100;
        uint256 userGet = ethReturn - tax;

        require(userGet >= minEthReturn, "Slippage: Return too low");
        require(poolBalance >= userGet, "Pool underflow protection");

        poolBalance -= userGet;
        floorBalance += tax;

        _burn(msg.sender, tokenAmount);
        payable(msg.sender).transfer(userGet);

        emit Trade(msg.sender, "SELL", ethReturn, tokenAmount, tax, block.timestamp);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
