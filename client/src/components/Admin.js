import React, { useState, useEffect } from 'react'
import { mergeStyles, Stack, TextField, PrimaryButton, Dropdown } from '@fluentui/react'

const pageStyle = mergeStyles({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
});

export const Admin = (props) => {
    const { account, electionInstance, isAdmin } = props;
    const [running, setRunning] = useState(false);

    useEffect(() => {
        try {
            getRunning(electionInstance);
        } catch (error) {
            alert(error);
        }
    }, [electionInstance])

    const getRunning = async (electionInstance) => {
        if (electionInstance) {
            let running = await electionInstance.methods.running().call();
            setRunning(running);
        }
    }

    const startElection = async () => {
        try {
            await electionInstance.methods.startElection().send({ from: account });
            window.location.reload();
        } catch (error) {
            alert(error);
        }
    }

    const endElection = async () => {
        try {
            await electionInstance.methods.endElection().send({ from: account });
            window.location.reload();
        } catch (error) {
            alert(error);
        }
    }

    return (
        isAdmin ? <div className={pageStyle}>
            {running ? <div>
                <div>
                    Currently Running
                </div>
                <PrimaryButton onClick={endElection}>
                    Stop running
                </PrimaryButton>
            </div>
                :
                <div>
                    <div>
                        Currently not running
                </div>
                    <PrimaryButton onClick={startElection}>
                        Start running
                </PrimaryButton>
                </div>
            }
        </div> :
            <div className={pageStyle}>
                Only admin can manage the election
            </div>
    )
}
