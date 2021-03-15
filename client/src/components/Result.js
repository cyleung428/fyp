import React, { useState, useEffect } from 'react'
import { DetailsList, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { mergeStyles, mergeStyleSets } from '@fluentui/react';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { PrimaryButton } from 'office-ui-fabric-react';
import { Pivot, PivotItem, PivotLinkSize } from 'office-ui-fabric-react/lib/Pivot';

const pageStyles = mergeStyles({
    padding: "16px 20px"
});

const iconClass = mergeStyles({
    fontSize: 25,
    height: 25,
    width: 25,
});

export const Result = (props) => {
    const { account, electionInstance, isAdmin } = props;
    const [candidates, setCandidates] = useState([]);
    useEffect(() => {
        getAllCandidates(electionInstance);
    }, [electionInstance, isAdmin, account])

    const getAllCandidates = async (electionInstance) => {
        if (!electionInstance) {
            return [];
        } else {
            let candidates = [];
            const count = await electionInstance.methods.candidateCount().call();
            console.log(count);
            for (let i = 0; i < count; i++) {
                const details = await electionInstance.methods.candidateDetails(i).call();
                const voteCount = await electionInstance.methods.getVoteCount(i).call();
                details.voteCount = voteCount;
                candidates.push(details);
            }
            console.log(candidates);
            setCandidates(candidates);
        }
    }

    const _columns = [
        { key: 'candidateId', name: 'CandidateID', fieldName: 'candidateId', minWidth: 150, maxWidth: 250 },
        { key: 'name', name: 'name', fieldName: 'name', minWidth: 250, maxWidth: 300 },
        { key: 'voteCount', name: 'votes', fieldName: 'voteCount', minWidth: 150, maxWidth: 150 },
    ];

    return (
        !isAdmin ?
            <div className={pageStyles}>
                <DetailsList
                    items={candidates}
                    columns={_columns}
                    setKey="set"
                    selectionMode={SelectionMode.none}
                />
            </div> :
            <div>
                Only admin can verify voters
            </div>
    );
}
