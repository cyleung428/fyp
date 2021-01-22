import React, { useState, useEffect } from 'react'
import { DetailsList, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { mergeStyles, mergeStyleSets } from '@fluentui/react';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { PrimaryButton } from 'office-ui-fabric-react';

const pageStyles = mergeStyles({
    padding: "16px 20px"
});

const iconClass = mergeStyles({
    fontSize: 25,
    height: 25,
    width: 25,
});

const classNames = mergeStyleSets({
    deepSkyBlue: [{ color: 'deepskyblue' }, iconClass],
    greenYellow: [{ color: 'greenyellow' }, iconClass],
    salmon: [{ color: 'salmon' }, iconClass],
});

export const Verify = (props) => {
    const { account, electionInstance, isAdmin } = props;
    const [voters, setVoters] = useState([]);
    useEffect(() => {
        if (isAdmin) {
            getAllVoters(electionInstance);
        }
    }, [electionInstance, isAdmin])

    const getAllVoters = async (electionInstance) => {
        if (!electionInstance) {
            return [];
        } else {
            let voters = [];
            const count = await electionInstance.methods.voterCount().call();
            for (let i = 0; i < count; i++) {
                const address = await electionInstance.methods.voters(i).call();
                const details = await electionInstance.methods.getVoterDetails(address).call();
                voters.push(details);
            }
            setVoters(voters);
        }
    }

    const _columns = [
        { key: 'isVerified', name: 'Status', fieldName: 'isVerified', minWidth: 50, maxWidth: 50 },
        { key: 'name', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'hkid', name: 'HKID number', fieldName: 'hkid', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'voterAddress', name: 'Voter Address', fieldName: 'voterAddress', minWidth: 300, maxWidth: 500, isResizable: true },
        { key: 'constituency', name: 'constituency', fieldName: 'constituency', minWidth: 200, maxWidth: 300, isResizable: true },
        { key: 'hkidPhotoHash', name: 'photo', fieldName: 'hkidPhotoHash', minWidth: 200, maxWidth: 300, isResizable: true },
        { key: 'addressPhotoHash', name: 'address proof', fieldName: 'addressPhotoHash', minWidth: 200, maxWidth: 300, isResizable: true },
        { key: 'button', name: '', fieldName: 'button', minWidth: 200, maxWidth: 300 },
    ];

    const verifyVoter = async (address) => {
        try {
            await electionInstance.methods.verifyVoter(address).send({ from: account });
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    }

    const _renderItemColumn = (item, index, column) => {
        const fieldContent = item[column.fieldName];

        switch (column.key) {
            case 'hkidPhotoHash':
            case 'addressPhotoHash':
                return <Image src={"https://gateway.ipfs.io/ipfs/" + fieldContent} width={150} height={150} imageFit={ImageFit.cover} />;
            case 'isVerified':
                return fieldContent ? <FontIcon iconName="Accept" className={classNames.greenYellow} /> : <FontIcon iconName="Clear" className={classNames.salmon} />;
            case 'button':
                return <PrimaryButton disabled={item["isVerified"]} onClick={() => verifyVoter(item['voterAddress'])}> Verify voter</PrimaryButton>
            default:
                return <span>{fieldContent}</span>;
        }
    }
    return (
        isAdmin ?
            <div className={pageStyles}>
                <DetailsList
                    items={voters}
                    columns={_columns}
                    setKey="set"
                    onRenderItemColumn={_renderItemColumn}
                    selectionMode={SelectionMode.none}
                />
            </div> :
            <div>
                Only admin can verify voters
            </div>
    );
}
