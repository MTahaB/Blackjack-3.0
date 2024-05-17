// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./JetonCasino.sol";

contract JeuBlackjack {
    JetonCasino public jetonCasino;
    uint256 public tokenPrice = 0.0004 ether;
    address public owner;

    constructor(JetonCasino _jetonCasino) {
        jetonCasino = _jetonCasino;
        owner = msg.sender;
    }

    function buyTokens(uint256 amount) public payable {
        require(msg.value >= amount * tokenPrice, "Insufficient ETH sent");
        jetonCasino.mint(msg.sender, amount);
        jetonCasino.approve(address(this), jetonCasino.allowance(msg.sender, address(this)) + amount);
        (bool success, ) = payable(address(this)).call{value: msg.value}("");
        require(success, "Transfer failed.");
    }

    function getTokenPrice() public view returns (uint256) {
        return tokenPrice;
    }

    function setAllowance(uint256 amount) public {
        jetonCasino.approve(address(this), amount);
    }

    function setTokenPrice(uint256 _tokenPrice) public {
        require(msg.sender == owner, "Only the owner can change the token price");
        tokenPrice = _tokenPrice;
    }

    function withdrawETH(uint256 tokenAmount) public {
        jetonCasino.approve(address(this), tokenAmount);
        require(tokenAmount > 0, "Amount must be greater than zero");
        uint256 tokenBalance = jetonCasino.balanceOf(msg.sender);
        require(tokenBalance >= tokenAmount, "Insufficient token balance");

        uint256 ethAmount = tokenAmount * tokenPrice;
        require(address(this).balance >= ethAmount, "Insufficient ETH in contract");
        jetonCasino.transferFrom(msg.sender, address(this), tokenAmount);
        payable(msg.sender).transfer(ethAmount);
    }

    function getUserTokenBalance(address user) public view returns (uint256) {
        return jetonCasino.balanceOf(user);
    }
     function sendETHToPlayer(address payable player,uint256 amount) external {
        require(address(this).balance >= amount, "Insufficient balance in the contract");
        player.transfer(amount);
    }

    receive() external payable {}
}
