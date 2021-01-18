var BallotContract = artifacts.require("./Ballot.sol");
module.exports = function (deployer) {
    deployer.deploy(BallotContract);
};