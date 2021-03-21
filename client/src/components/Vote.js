import React, { useState, useEffect } from 'react'
import { mergeStyles } from '@fluentui/react'
import {
    DocumentCard,
    DocumentCardTitle,
    DocumentCardDetails,
} from 'office-ui-fabric-react/lib/DocumentCard';

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
    const [video,]=useState(React.createRef());

    const videoError=(error)=>{
        console.log("error",error);
    }

    const handleVideo=(stream)=>{
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

        // const options = new faceApi.TinyFaceDetectorOptions({
        //   inputSize: 512,
        //   scoreThreshold: 0.5
        // });

        // const result = await faceApi
        //   .detectSingleFace(this.video.current, options)
        //   .withFaceExpressions();

        // if (result) {
        //   this.log(result);
        //   const expressions = result.expressions.reduce(
        //     (acc, { expression, probability }) => {
        //       acc.push([expressionMap[expression], probability]);
        //       return acc;
        //     },
        //     []
        //   );
        //   this.log(expressions);
        //   this.setState(() => ({ expressions }));
        // }

        setTimeout(() => onPlay(), 1000);
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
        getVoterInfo(electionInstance);
        getAllCandidates(electionInstance);
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true}, handleVideo, videoError);
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
        <>
            {
                isAdmin ?
                    <div>
                        Only voters can vote
                    </div>:
                    <div style={{ width: "100%", height: "60vh"}}>
                    <video
                        ref={video}
                        autoPlay
                        muted
                        onPlay={onPlay}
                        style={{
                            width: "100%",
                            height: "50vh",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            top: 0
                        }}
                    />
                </div>
            }
            {
                running && voterInfo && !voterInfo.hasVoted?
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
        </>
    )
}

export default Vote
