const JetonCasino = artifacts.require("JetonCasino");
const JeuBlackjack = artifacts.require("JeuBlackjack");

module.exports = async function (deployer, network, accounts) {
  const initialOwner = accounts[0]; 

  await deployer.deploy(JetonCasino, initialOwner, { value: web3.utils.toWei("1", "ether") });
  const jetonCasinoInstance = await JetonCasino.deployed();

  await deployer.deploy(JeuBlackjack, jetonCasinoInstance.address);
};
