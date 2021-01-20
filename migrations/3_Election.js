var ElectionContract = artifacts.require("./Election.sol");
module.exports = function (deployer) {
    deployer.deploy(ElectionContract);
};