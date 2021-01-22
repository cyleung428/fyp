// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;


contract Election {
    address public admin;
    uint256 public candidateCount;
    uint256 public voterCount;
    bool public running;
    bool public end;

    // Constructor
    constructor() public {
        admin = msg.sender;
        candidateCount = 0;
        voterCount = 0;
        running = false;
        end = false;
    }



    struct Candidate {
        string name;
        uint256 constituency;
        uint256 candidateId;
    }
    mapping(uint256 => Candidate) public candidateDetails;
    mapping(uint256 => uint) voteCountMap;

    function getVoteCount(uint id) public view returns (uint) {
        // require(end);
        return voteCountMap[id];
    }


    function addCandidate(
        string memory _name,
        uint256 _constituency
    ) public {
        require(msg.sender == admin);
        Candidate memory newCandidate =
            Candidate({
                name: _name,
                constituency: _constituency,
                candidateId: candidateCount
            });
        candidateDetails[candidateCount] = newCandidate;
        candidateCount += 1;
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
    mapping(address => Voter) voterDetails;

    function getVoterDetails(address voterAddress) public view returns (Voter memory){
        require(msg.sender == admin || msg.sender == voterAddress);
        return voterDetails[voterAddress];
    }

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

    function verifyVoter(address _address) public {
        require(msg.sender == admin);
        voterDetails[_address].isVerified = true;
    }

    function vote(uint256 candidateId) public {
        require(voterDetails[msg.sender].hasVoted == false);
        require(voterDetails[msg.sender].isVerified == true);
        require(
            voterDetails[msg.sender].constituency ==
                candidateDetails[candidateId].constituency
        );
        require(running == true);
        voteCountMap[candidateId] += 1;
        voterDetails[msg.sender].hasVoted = true;
    }

    function startElection() public {
        require(msg.sender == admin);
        require(running == false);
        running = true;
    }


    function endElection() public {
        require(msg.sender == admin);
        require(running == true);
        running = false;
        end = true;
    }

}
