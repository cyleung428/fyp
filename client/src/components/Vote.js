import React, { useState, useEffect } from 'react'
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import {
    DocumentCard,
    DocumentCardActivity,
    DocumentCardTitle,
} from 'office-ui-fabric-react/lib/DocumentCard';
import {
    MessageBar,
    MessageBarType
} from 'office-ui-fabric-react';


const narrowTextFieldStyles = { fieldGroup: { width: 200 } };

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

        const handResult = await model.estimateHands(video.current, true);
        const GE = new fp.GestureEstimator([
            fp.Gestures.VictoryGesture,
            fp.Gestures.ThumbsUpGesture
        ]);
        if (handResult.length > 0) {
            const estimatedGestures = GE.estimate(handResult[0].landmarks, 7.5);
            console.log(estimatedGestures);
        }


        if (result.length === 2) {
            const canvases = await faceapi.extractFaces(video.current, result.map(result => result.detection))
            const faceDes1 = await faceapi.computeFaceDescriptor(canvases[0])
            const faceDes2 = await faceapi.computeFaceDescriptor(canvases[1])
            const distance = faceapi.utils.round(
                faceapi.euclideanDistance(faceDes1, faceDes2)
            )
            if (distance > 0.6) {
                setValid(true);
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
        const index = candidates.findIndex(candidate => candidate.candidateId === selectedCandidate.candidateId);
        setSelectedCandidate(candidates[(index + 1) % candidates.length]);
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
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ video: true }, handleVideo, videoError);
        }
    }, [electionInstance, account])

    const voteTo = async (candidateId) => {
        try {
            await electionInstance.methods.vote(candidateId).send({ from: account });
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
        <div style={{ width: "100%" }}>
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
                                            Biometric scanning test pass, you can show 👍 for selecting the candidate and ✌️ for switching candidte
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
                            />
                        </div>
                        :
                        <div>
                            unavaiable
                    </div>
            }
        </div>
    )
}

export default Vote
