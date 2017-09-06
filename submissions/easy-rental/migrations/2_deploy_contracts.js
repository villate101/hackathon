var ConvertLib = artifacts.require("./ConvertLib.sol");
var EasyRental1 = artifacts.require("./EasyRental1.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.deploy(EasyRental1);
  deployer.link(ConvertLib, EasyRental1);
};