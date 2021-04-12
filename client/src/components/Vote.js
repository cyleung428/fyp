import React, { useState, useEffect } from 'react'
import * as faceapi from '@vladmandic/face-api';
// import * as tf from '@tensorflow/tfjs';
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useBoolean } from '@uifabric/react-hooks';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import {
    DocumentCard,
    DocumentCardActivity,
    DocumentCardTitle,
    DocumentCardType
} from 'office-ui-fabric-react/lib/DocumentCard';
import {
    MessageBar,
    MessageBarType
} from 'office-ui-fabric-react';


const narrowTextFieldStyles = { fieldGroup: { width: 200 } };

const cardStyles = {
    root: { marginRight: 20, width: 500, maxWidth: 500 },
};

const Vote = (props) => {
    const { account, electionInstance, isAdmin } = props;
    const [voterInfo, setVoterInfo] = useState(null);
    const [running, setRunning] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [video,] = useState(React.createRef());
    const [hkid, setHkid] = useState("")
    const [valid, setValid] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState();
    const [model, setModel] = useState();
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [dialogContentProps, setdialogContentProps] = useState({
        type: DialogType.normal,
        title: 'Confirm voting transaction',
        subText: 'loading',
    })

    useEffect(() => {
        if (selectedCandidate) {
            setdialogContentProps(prev => ({
                ...prev,
                subText: `vote to ${selectedCandidate.name}`
            }))
        }
    }, [selectedCandidate])

    const videoError = (error) => {
        console.log("error", error);
    }

    const handleVideo = (stream) => {
        video.current.srcObject = stream;
    }

    const onPlay = async () => {
        if (!video.current) {
            return;
        }
        if (
            video.current.paused ||
            video.current.ended
        ) {
            setTimeout(() => onPlay());
            return;
        }

        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 512,
            scoreThreshold: 0.5
        });


        const result = await faceapi
            .detectAllFaces(video.current, options)
            .withFaceExpressions();


        if (result.length === 2) {
            const canvases = await faceapi.extractFaces(video.current, result.map(result => result.detection))
            const faceDes1 = await faceapi.computeFaceDescriptor(canvases[0])
            const faceDes2 = await faceapi.computeFaceDescriptor(canvases[1])
            const distance = faceapi.utils.round(
                faceapi.euclideanDistance(faceDes1, faceDes2)
            )
            if (distance > 0.4) {
                setValid(true);
                const hand = await handpose.load()
                if (hand) {
                    const handResult = await hand.estimateHands(video.current, true);
                    console.log(handResult);
                    const GE = new fp.GestureEstimator([
                        fp.Gestures.ThumbsUpGesture
                    ]);
                    if (handResult.length > 0) {
                        const estimatedGestures = GE.estimate(handResult[0].landmarks, 5);
                        if (estimatedGestures) {
                            const poseData = estimatedGestures.poseData;
                            let allNoCurl = true;
                            poseData.forEach(finger => {
                                if (finger[1] !== "No Curl") {
                                    allNoCurl = false;
                                }
                            });
                            if (allNoCurl) {
                                selectNextCandidate();
                            }
                            const gestures = estimatedGestures.gestures;
                            if (gestures.length > 0 && gestures[0].name === "thumbs_up") {
                                toggleHideDialog();
                            }
                        }
                    }
                }
            } else {
                setValid(false);
            }
        } else {
            setValid(false);
        }

        setTimeout(() => onPlay(), 2000);
    };

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

    const selectNextCandidate = () => {
        setSelectedCandidate((prev) => {
            const index = candidates.findIndex(candidate => candidate.candidateId === prev.candidateId);
            return candidates[(index + 1) % candidates.length];
        });
    }

    useEffect(() => {
        if (candidates.length > 0) {
            setSelectedCandidate(candidates[0]);
        }
    }, [candidates])

    useEffect(() => {
        async function loadModels() {
            await faceapi.loadFaceRecognitionModel("/models");
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
            await faceapi.loadFaceExpressionModel("/models");
            setModel(await handpose.load());
        }
        loadModels();
        getVoterInfo(electionInstance);
        getAllCandidates(electionInstance);
    }, [electionInstance, account])

    useEffect(() => {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
        if (navigator.getUserMedia && video.current) {
            navigator.getUserMedia({ video: true }, handleVideo, videoError);
        }
    }, [video.current])

    const voteTo = async () => {
        try {
            await electionInstance.methods.vote(selectedCandidate.candidateId, hkid, new Date().getTime()).send({ from: account });
            alert("Successfully vote");
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    }

    const onChangeHkid = React.useCallback(
        (event, newValue) => {
            if (!newValue || newValue.length <= 8) {
                setHkid(newValue || '');
            }
        },
        [],
    );





    return (
        <div style={{ width: "100%", padding: "15px" }}>
            {
                isAdmin ?
                    <div>
                        Only voters can vote
                    </div> :
                    running && voterInfo && !voterInfo.hasVoted && candidates.length > 0 ?
                        <div style={{ width: "100%" }}>
                            {
                                selectedCandidate ?
                                    <DocumentCard
                                        aria-label="Default Document Card"
                                    >
                                        <DocumentCardTitle
                                            title={
                                                selectedCandidate.name
                                            }
                                            shouldTruncate
                                        />
                                        <DocumentCardActivity activity="Democracy Party" people={[{ name: selectedCandidate.candidateId }]} />
                                    </DocumentCard> :
                                    <div>
                                        loading candidate
                            </div>
                            }
                            <div>
                                {valid ?
                                    <>
                                        <MessageBar
                                            messageBarType={MessageBarType.success}
                                        >
                                            Biometric scanning test pass, you can show 👍 for selecting the candidate and 🖐️ for switching candidte
                              </MessageBar>
                                    </>
                                    :
                                    <MessageBar
                                        messageBarType={MessageBarType.error}
                                    >
                                        Biometric scanning test fail, please turn your camera on, show your hkid card as well as your face
                                    </MessageBar>
                                }
                            </div>
                            <TextField
                                label="HKID number"
                                value={hkid}
                                onChange={onChangeHkid}
                                styles={narrowTextFieldStyles}
                            />
                            <video
                                ref={video}
                                autoPlay
                                muted
                                onPlay={onPlay}
                                width="480"
                                height="360"
                            />
                        </div>
                        :
                        <div>
                        </div>
            }
            {
                voterInfo && voterInfo.hasVoted && <DocumentCard
                    styles={cardStyles}
                    aria-label="Default Document Card"
                >
                    <DocumentCardTitle
                        title="Vote record"
                        shouldTruncate
                        type={DocumentCardType.compact}
                    />
                    <DocumentCardActivity shouldTruncate activity={new Date(parseInt(voterInfo["voteTimeStamp"])).toLocaleString()} people={[{ name: `${voterInfo["hkidHash"]}` }]} />
                </DocumentCard>
            }
            <Dialog
                hidden={hideDialog}
                onDismiss={toggleHideDialog}
                dialogContentProps={dialogContentProps}
                modalProps={modelProps}
            >
                <DialogFooter>
                    <PrimaryButton onClick={voteTo} text="Vote" />
                    <DefaultButton onClick={toggleHideDialog} text="Cancel" />
                </DialogFooter>
            </Dialog>
        </div>
    )
}
const modelProps = {
    isBlocking: false,
    styles: { main: { maxWidth: 450 } },
};

export default Vote
