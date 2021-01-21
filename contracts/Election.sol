// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract Election {
    address public admin;
    uint256 candidateCount;
    uint256 voterCount;
    bool running;

    // Constructor
    constructor() public {
        admin = msg.sender;
        candidateCount = 0;
        voterCount = 0;
        running = false;
    }

    function getAdmin() public view returns (address) {
        return admin;
    }

    // Only Admin can access
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }
    struct Candidate {
        string name;
        string party;
        string manifesto;
        uint256 voteCount;
        uint256 constituency;
        uint256 candidateId;
    }
    mapping(uint256 => Candidate) public candidateDetails;

    function addCandidate(
        string memory _name,
        string memory _party,
        string memory _manifesto,
        uint256 _constituency
    ) public onlyAdmin {
        Candidate memory newCandidate =
            Candidate({
                name: _name,
                party: _party,
                manifesto: _manifesto,
                voteCount: 0,
                constituency: _constituency,
                candidateId: candidateCount
            });
        candidateDetails[candidateCount] = newCandidate;
        candidateCount += 1;
    }

    // get total number of candidates
    function getCandidateNumber() public view returns (uint256) {
        return candidateCount;
    }

    struct Voter {
        address voterAddress;
        string name;
        string hkid;
        string hkidPhotoHash;
        string addressPhotoHash;
        uint256 constituency;
        bool hasVoted;
        bool isVerified;
    }
    address[] public voters;
    mapping(address => Voter) public voterDetails;

    // register to be added as voter
    function registerVoter(
        string memory _name,
        string memory _hkid,
        uint256 _constituency,
        string memory _hkidHash,
        string memory _addressHash
    ) public {
        Voter memory newVoter =
            Voter({
                voterAddress: msg.sender,
                hkidPhotoHash: _hkidHash,
                addressPhotoHash: _addressHash,
                name: _name,
                hkid: _hkid,
                constituency: _constituency,
                hasVoted: false,
                isVerified: false
            });
        voterDetails[msg.sender] = newVoter;
        voters.push(msg.sender);
        voterCount += 1;
    }

    // get total number of voters
    function getVoterCount() public view returns (uint256) {
        return voterCount;
    }

    function verifyVoter(address _address) public onlyAdmin {
        voterDetails[_address].isVerified = true;
    }

    function vote(uint256 candidateId) public {
        require(voterDetails[msg.sender].hasVoted == false);
        require(voterDetails[msg.sender].isVerified == true);
        require(voterDetails[msg.sender].constituency == candidateDetails[candidateId].constituency);
        require(running == true);
        candidateDetails[candidateId].voteCount += 1;
        voterDetails[msg.sender].hasVoted = true;
    }

    function startElection() public onlyAdmin {
        require(running == false);
        running = true;
    }

    function endElection() public onlyAdmin {
        require(running == true);
        running = false;
    }

    function getRunning() public view returns (bool) {
        return running;
    }
}
