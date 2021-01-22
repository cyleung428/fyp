import React, { useState, useEffect } from 'react'
import { mergeStyles, Stack, TextField, PrimaryButton, Dropdown } from '@fluentui/react'
import {
    DocumentCard,
    DocumentCardActivity,
    DocumentCardTitle,
    DocumentCardDetails,
    DocumentCardStatus,
    DocumentCardImage,
    IDocumentCardStyles,
    IDocumentCardActivityPerson,
} from 'office-ui-fabric-react/lib/DocumentCard';

const pageStyle = mergeStyles({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
});

const Vote = (props) => {
    const { account, electionInstance, isAdmin } = props;
    const [voterInfo, setVoterInfo] = useState(null);
    const [running, setRunning] = useState(false);
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        getVoterInfo(electionInstance);
        getAllCandidates(electionInstance)
    }, [electionInstance, account])

    const getVoterInfo = async () => {
        if (electionInstance) {
            let voterInfo = await electionInstance.methods.getVoterDetails(account).call();
            let running = await electionInstance.methods.running().call();
            setRunning(running);
            setVoterInfo(voterInfo);
        }
    }

    const getAllCandidates = async () => {
        if (electionInstance) {
            let candidateList = [];
            let candidateCount = await electionInstance.methods.candidateCount().call();
            for (let i = 0; i < candidateCount; i++) {
                let candidateDetails = await electionInstance.methods.candidateDetails(i).call();
                candidateList.push(candidateDetails);
            }
            setCandidates(candidateList);
        }
    }

    const cardStyles = {
        root: { display: 'block', marginRight: 20, marginBottom: 20, width: 320 },
    };

    const voteTo = async (candidateId) => {
        try {
            await electionInstance.methods.vote(candidateId).send({ from: account });
            alert("Successfully vote");
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    }



    return (
        isAdmin ?
            <div>
                Only voters can vote
        </div> :
            running && voterInfo && voterInfo.isVerified && !voterInfo.hasVoted ?
                <div className={pageStyle}>
                    {
                        candidates.filter(candadate=>candadate.constituency===voterInfo.constituency).map(candidate =>
                            <DocumentCard
                                key={candidate.candidateId}
                                styles={cardStyles}
                                onClick={() => voteTo(candidate.candidateId)}
                            >
                                <DocumentCardDetails>
                                    <DocumentCardTitle title={candidate.candidateId+ ": "+candidate.name} shouldTruncate />
                                </DocumentCardDetails>
                            </DocumentCard>)
                    }
                </div>
                :
                <div>
                    Currently unavaiable
                </div>
    )
}

export default Vote
