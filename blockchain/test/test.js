const JetonCasino = artifacts.require("JetonCasino");
const JeuBlackjack = artifacts.require("JeuBlackjack");

contract("JeuBlackjack", accounts => {
  let casino;
  let blackjack;

  before(async () => {
    casino = await JetonCasino.new();
    blackjack = await JeuBlackjack.new(casino.address);
    await casino.mint(accounts[1], web3.utils.toWei('100', 'ether'));
    await casino.approve(blackjack.address, web3.utils.toWei('100', 'ether'), {from: accounts[1]});
  });

  it("should allow users to withdraw ETH equivalent to their tokens", async () => {
    
    const initialEthBalance = await web3.eth.getBalance(accounts[1]);

    // User buys tokens
    await blackjack.buyTokens(web3.utils.toWei('10', 'ether'), {from: accounts[1], value: web3.utils.toWei('10', 'ether')});
    await casino.approve(blackjack.address, web3.utils.toWei('10', 'ether'), {from: accounts[1]});
    // User withdraws ETH
    await blackjack.withdrawETH(web3.utils.toWei('9', 'ether'), {from: accounts[1]});

    // Check new ETH balance
    const newEthBalance = await web3.eth.getBalance(accounts[1]);
    assert(newEthBalance > initialEthBalance, "ETH balance should have increased after withdrawal");

    // Check token balance to ensure it's decreased
    const remainingTokens = await casino.balanceOf(accounts[1]);
    assert.equal(remainingTokens, 0, "Token balance should be zero after withdrawal");
  });
});
