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
        candidateCount = 3;
        voterCount = 0;
        running = false;
        end = false;
        candidateDetails[0] =
            Candidate({
                name: "candidate A",
                candidateId: 0
            });
        candidateDetails[1] =
            Candidate({
                name: "candidate B",
                candidateId: 1
            });
        candidateDetails[2] = 
            Candidate({
                name: "candidate C",
                candidateId: 2
            });
    }



    struct Candidate {
        string name;
        uint256 candidateId;
    }
    mapping(uint256 => Candidate) public candidateDetails;
    mapping(uint256 => uint) voteCountMap;

    function getVoteCount(uint id) public view returns (uint) {
        // require(end);
        return voteCountMap[id];
    }

    struct Voter {
        bytes32 hkidHash;
        uint voteTimeStamp;
        bool hasVoted;
    }
    address[] public voters;
    mapping(address => Voter) voterDetails;
    mapping(bytes32 => bool) hkidHashMap;

    function getVoterDetails(address voterAddress) public view returns (Voter memory){
        return voterDetails[voterAddress];
    }

    function vote(uint256 candidateId, string memory hkId, uint timeStamp) public {
        require(voterDetails[msg.sender].hasVoted == false, "Voter has voted");
        require(running == true, "Currently not running");
        require(hkidHashMap[sha256(abi.encodePacked(hkId))] == false, "The HKID has been voted");
        bytes32 hkidHash = sha256(abi.encodePacked(hkId));
        hkidHashMap[hkidHash] = true;
        voteCountMap[candidateId] += 1;
        voterDetails[msg.sender] = Voter({
            hkidHash: hkidHash,
            voteTimeStamp: timeStamp,
            hasVoted: true
        });
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
