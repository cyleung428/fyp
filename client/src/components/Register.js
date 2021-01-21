import React, { useState, useEffect } from 'react'
import { mergeStyles, Stack, TextField, PrimaryButton, Dropdown } from '@fluentui/react'
import ipfs from "../ipfs";

const pageStyle = mergeStyles({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
});

const labelStyle = mergeStyles({
    fontFamily: "Segoe UI",
    fontSize: "14px",
    fontWeight: "600",
    color: "rgb(50, 49, 48)",
    boxSizing: "border-box",
    boxShadow: "none",
    margin: "0px",
    display: "inline-block",
    padding: "15px 0px",
    overflowWrap: "break-word",
})

const constituencies = [
    { key: 0, text: 'District 1' },
    { key: 1, text: 'District 2' },
    { key: 2, text: 'District 3' },
];
const dropdownStyles = { dropdown: { width: 300 } };

export default function Register(props) {
    const { account, electionInstance, isAdmin } = props
    const [name, setName] = useState("");
    const [hkid, setHkid] = useState("");
    const [constituency, setConstituency] = useState();
    const [hkidBuffer, setHkidBuffer] = useState(null);
    const [addressBuffer, setAddressBuffer] = useState(null);
    const [successMsg, setSuccessMsg] = useState("")
    const [loading, setLoading] = useState(false);

    const nameOnChange = (event, value) => {
        if (value !== undefined) {
            setName(value);
        }
    };

    const hkidOnChange = (event, value) => {
        if (value !== undefined) {
            setHkid(value);
        }
    };

    const constituencyOnChange = (event, item) => {
        setConstituency(item);
    };

    const captureHkid = (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            let reader = new window.FileReader();
            reader.readAsArrayBuffer(file);
            reader.onloadend = () => convertToBuffer("hkid", reader)
        }
    }

    const captureAddressProof = (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            let reader = new window.FileReader();
            reader.readAsArrayBuffer(file);
            reader.onloadend = () => convertToBuffer("addressProof", reader)
        }
    }

    const convertToBuffer = async (id, reader) => {
        const buffer = await Buffer.from(reader.result);
        if (id === "hkid") {
            setHkidBuffer(buffer);
        } else {
            setAddressBuffer(buffer)
        }
    }

    const uploadToChain = async () => {
        try {
            setLoading(true);
            const hkidHash = await ipfs.add(hkidBuffer);
            const addressHash = await ipfs.add(addressBuffer);
            await electionInstance.methods.registerVoter(name, hkid, constituency.key, hkidHash.path, addressHash.path).send({ from: account });
            setSuccessMsg("Successfully upload");
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
        if (!name || !hkid || !constituency || !addressBuffer || !hkidBuffer) {
            setSuccessMsg("Missing input field");
        } else {
            uploadToChain();
        }
    }


    return (
        isAdmin ? <div>
            Only voters can register
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
                                label="Full name"
                                value={name}
                                onChange={nameOnChange}
                            />
                            <TextField
                                name="hkid"
                                label="HKID number"
                                value={hkid}
                                onChange={hkidOnChange}
                            />
                            <Dropdown
                                label="Constituency"
                                selectedKey={constituency ? constituency.key : undefined}
                                onChange={constituencyOnChange}
                                placeholder="Select an constituency"
                                options={constituencies}
                                styles={dropdownStyles}
                            />
                            <div className={labelStyle}>
                                HKID card upload
                        </div>
                            <input
                                label="HKID card upload"
                                type="file"
                                onChange={captureHkid}
                                accept="image/png, image/jpeg"
                            />
                            <div className={labelStyle}>
                                address proof upload
                        </div>
                            <input
                                label="HKID card upload"
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={captureAddressProof}
                            />
                            <div>
                                <PrimaryButton
                                    disabled={loading}
                                    type="submit"
                                    className={buttonStyle}
                                    text="Register"
                                ></PrimaryButton>
                            </div>
                            <div className={successMsgStyle}> {successMsg}</div>
                        </form>
                    </Stack>

                </Stack>
            </div>
    )
}


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
