import React, { useState, useEffect } from 'react'
import { mergeStyles } from '@fluentui/react'
import {
    DocumentCard,
    DocumentCardTitle,
    DocumentCardDetails,
} from 'office-ui-fabric-react/lib/DocumentCard';
import * as faceapi from 'face-api.js';

const pageStyle = mergeStyles({
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "50px"
});

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

        if (result.length >1) {
            const canvases = await faceapi.extractFaces(video.current, result.map(result=>result.detection))
            // console.log(canvases)
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
        <div style={{ width: "100%" }}>
            {
                isAdmin ?
                    <div>
                        Only voters can vote
                    </div> :
                    <div style={{ width: "100%"}}>
                        <video
                            ref={video}
                            autoPlay
                            muted
                            onPlay={onPlay}
                            style={{
                                width: "100%",
                                left: 0,
                                right: 0,
                                bottom: 0,
                                top: 0
                            }}
                        />
                    </div>
            }
            {
                running && voterInfo && !voterInfo.hasVoted ?
                    <div className={pageStyle}>
                        {
                            candidates.filter(candadate => candadate.constituency === voterInfo.constituency).map(candidate =>
                                <DocumentCard
                                    key={candidate.candidateId}
                                    styles={cardStyles}
                                    onClick={() => voteTo(candidate.candidateId)}
                                >
                                    <DocumentCardDetails>
                                        <DocumentCardTitle title={candidate.candidateId + ": " + candidate.name} shouldTruncate />
                                    </DocumentCardDetails>
                                </DocumentCard>)
                        }
                    </div>
                    :
                    <div>
                        Currently unavaiable
                </div>
            }
        </div>
    )
}

export default Vote
