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
        string hkidHash;
        uint voteTimeStamp;
        bool hasVoted;
    }
    address[] public voters;
    mapping(address => Voter) voterDetails;

    function getVoterDetails(address voterAddress) public view returns (Voter memory){
        require(msg.sender == admin || msg.sender == voterAddress);
        return voterDetails[voterAddress];
    }

    function vote(uint256 candidateId) public {
        require(voterDetails[msg.sender].hasVoted == false);
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
