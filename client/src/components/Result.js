import React, { useState, useEffect } from 'react'
import { DetailsList, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { mergeStyles } from '@fluentui/react';

const pageStyles = mergeStyles({
    padding: "16px 20px"
});

export const Result = (props) => {
    const { account, electionInstance, isAdmin } = props;
    const [candidates, setCandidates] = useState([]);
    const [running, setRunning] = useState(true);
    useEffect(() => {
        getAllCandidates(electionInstance);
    }, [electionInstance, isAdmin, account])

    const getAllCandidates = async (electionInstance) => {
        if (!electionInstance) {
            return [];
        } else {
            let running = await electionInstance.methods.running().call();
            setRunning(running);
            let candidates = [];
            const count = await electionInstance.methods.candidateCount().call();
            console.log(count);
            for (let i = 0; i < count; i++) {
                const details = await electionInstance.methods.candidateDetails(i).call();
                const voteCount = await electionInstance.methods.getVoteCount(i).call();
                details.voteCount = voteCount;
                candidates.push(details);
            }
            setCandidates(candidates);
        }
    }

    const _columns = [
        { key: 'candidateId', name: 'CandidateID', fieldName: 'candidateId', minWidth: 150, maxWidth: 250 },
        { key: 'name', name: 'name', fieldName: 'name', minWidth: 250, maxWidth: 300 },
        { key: 'voteCount', name: 'votes', fieldName: 'voteCount', minWidth: 150, maxWidth: 150 },
    ];

    return (
        !running ?
            <div className={pageStyles}>
                <DetailsList
                    items={candidates}
                    columns={_columns}
                    setKey="set"
                    selectionMode={SelectionMode.none}
                />
            </div> :
            <div>
               Only avaiable when the election finish
            </div>
    );
}
