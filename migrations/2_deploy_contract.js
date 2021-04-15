var IsoToken = artifacts.require("./IsoToken.sol");
var IsoTokenSale = artifacts.require("./IsoTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(IsoToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(IsoTokenSale, IsoToken.address, tokenPrice);
  });
};
