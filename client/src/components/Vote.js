import React, { useState, useEffect } from 'react'
import { mergeStyles } from '@fluentui/react'
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";

const Vote = (props) => {
    const { account, electionInstance, isAdmin } = props;
    const [voterInfo, setVoterInfo] = useState(null);
    const [running, setRunning] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [video,] = useState(React.createRef());

    const videoError = (error) => {
        console.log("error", error);
    }

    const handleVideo = (stream) => {
        video.current.srcObject = stream;
    }

    const onPlay = async () => {
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

        if (result) {
            console.log(result);
        }

        const hand = await handpose.load();
        const handResult = await hand.estimateHands(video.current, true);
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
            console.log(distance)
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

    useEffect(() => {
        async function loadModels() {
            await faceapi.loadFaceRecognitionModel("/models");
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
            await faceapi.loadFaceExpressionModel("/models");
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



    return (
        <div style={{ width: "100%" }}>
            {
                isAdmin ?
                    <div>
                        Only voters can vote
                    </div> :
                    running && voterInfo && !voterInfo.hasVoted && candidates.length>0 ?
                    <div style={{ width: "100%" }}>
                        <video
                            ref={video}
                            autoPlay
                            muted
                            onPlay={onPlay}
                            width="100%"
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
