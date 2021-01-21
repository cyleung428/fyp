import React, { useState, useEffect } from 'react'
import { mergeStyles, Stack, TextField, PrimaryButton, Dropdown } from '@fluentui/react';

export const AddCandidate = (props) => {
    const { account, electionInstance, isAdmin } = props;
    const [successMsg, setSuccessMsg] = useState("");
    const [name, setName] = useState("");
    const [party, setParty] = useState("");
    const [constituency, setConstituency] = useState("");
    const [manifesto, setManifesto] = useState("");
    const [loading, setLoading] = useState(false);

    const nameOnChange = (event, value) => {
        if (value !== undefined) {
            setName(value);
        }
    };

    const partyOnChange = (event, value) => {
        if (value !== undefined) {
            setParty(value);
        }
    };

    const manifestoOnChange = (_, value) => {
        if (value !== undefined) {
            setManifesto(value);
        }
    }

    const constituencyOnChange = (event, item) => {
        setConstituency(item);
    };

    const uploadToChain = async () => {
        try {
            setLoading(true);
            await electionInstance.methods.addCandidate(name, party, manifesto, constituency.key).send({ from: account });
            setSuccessMsg("Successfully add candidate");
            window.location.reload()
            setLoading(false);
        } catch (error) {
            console.log(error);
            setSuccessMsg("Error occurs");
            setLoading(false);
        }
    }

    const onSubmit = (event) => {
        event.preventDefault();
        if (!name || !party || !constituency || !manifesto) {
            setSuccessMsg("Missing input field");
        } else {
            uploadToChain();
        }
    }

    return (
        !isAdmin ? <div>
            Only Admin can add candidate
        </div> :
            <div className={pageStyle}>
                <Stack
                    horizontal
                    tokens={stackTokens}
                    styles={stackStyles}
                >

                    <Stack {...columnProps}>
                        <form
                            id="signup"
                            onSubmit={onSubmit}
                        >
                            <TextField
                                name="name"
                                label="Candidate name"
                                value={name}
                                onChange={nameOnChange}
                            />
                            <TextField
                                name="party"
                                label="Party"
                                value={party}
                                onChange={partyOnChange}
                            />
                            <Dropdown
                                label="Constituency"
                                selectedKey={constituency ? constituency.key : undefined}
                                onChange={constituencyOnChange}
                                placeholder="Select an constituency"
                                options={constituencies}
                                styles={dropdownStyles}
                            />

                            <TextField
                                name="manifesto"
                                label="manifesto"
                                value={manifesto}
                                onChange={manifestoOnChange}
                                multiline
                                rows={5}
                            />

                            <div>
                                <PrimaryButton
                                    disabled={loading}
                                    type="submit"
                                    className={buttonStyle}
                                    text="Add Candidate"
                                ></PrimaryButton>
                            </div>
                            <div className={successMsgStyle}> {successMsg}</div>
                        </form>
                    </Stack>

                </Stack>
            </div>
    )
}

const pageStyle = mergeStyles({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
});

const constituencies = [
    { key: 0, text: 'District 1' },
    { key: 1, text: 'District 2' },
    { key: 2, text: 'District 3' },
];
const dropdownStyles = { dropdown: { width: 300 } };

const stackTokens = { childrenGap: 50 };
const stackStyles = {
    root: {
        width: 390,
        padding: "70px 55px 70px 55px",
        background: "white",
    },
};

const columnProps = {
    tokens: { childrenGap: 15 },
    styles: { root: { width: 300 } },
};

const buttonStyle = mergeStyles({
    marginTop: "25px !important",
});

const successMsgStyle = mergeStyles({
    height: "40px",
    fontSize: "0.9em",
});
