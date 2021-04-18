var SabaToken = artifacts.require("./SabaToken.sol");
var SabaTokenSale = artifacts.require("./SabaTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SabaToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(SabaTokenSale, SabaToken.address, tokenPrice);
  });
};
