mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-button'));
const configuration = {
    iceServers: [{
        urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
        ],
    }, ],
    iceCandidatePoolSize: 10,
};
let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;
let localStreamSender = null;
let remoteStreamSender = null;
let remoteScreenShare = null;
let localScreenShare = null;
let mediaRecorder = null;
window.roomRef = null;
let recordedBlobs = null;
const recordButton = document.querySelector('#startRecording');
const recordedVideo = document.querySelector('#recordedVideo');
const downloadButton = document.querySelector('#downloadRecord');
const stopShare = document.querySelector('#stopScreenShare');
const startShare = document.querySelector('#screenShare');
recordButton.textContent = 'Start Recording'
const video_list = []

function init() {
    document.querySelector('#hangupBtn').addEventListener('click', hangUp);
    document.querySelector('#startRecording').addEventListener('click', screen_recording);;
    document.querySelector('#downloadRecord').addEventListener('click', download_recording);;
    document.querySelector('#screenShare').addEventListener('click', screen_share);
    document.querySelector('#closecameraBtn').addEventListener('click', closeCamera);
    document.querySelector('#stopScreenShare').addEventListener('click', end_screen_share);
    document.querySelector('#muteAudio').addEventListener('click', closeMic);
    roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
}

function closeCamera() {
    if (localStream == null) {
        console.log("no stream found")
        return;
    }
    var videoTracks = localStream.getVideoTracks();
    console.log("video change");
    for (var i = 0; i < videoTracks.length; ++i) {
        videoTracks[i].enabled = !videoTracks[i].enabled;
        if (!videoTracks[i].enabled) {
            document.getElementById("camImg").src = "img/cameraoff.png";
            document.getElementById("closecameraBtn").classList.add("blue");
        } else {
            document.getElementById("camImg").src = "img/cam.png";
            document.getElementById("closecameraBtn").classList.remove("blue");
        }
    }
}

function closeMic() {
    if (localStream == null) {
        console.log("no stream found")
        return;
    }
    var audioTracks = localStream.getAudioTracks();
    console.log("Audio change");
    for (var i = 0; i < audioTracks.length; ++i) {
        audioTracks[i].enabled = !audioTracks[i].enabled;
        if (!audioTracks[i].enabled) {
            document.getElementById("micImg").src = "img/micoff.png";
            document.getElementById("muteAudio").classList.add("blue");
        } else {
            document.getElementById("micImg").src = "img/mic.png";
            document.getElementById("muteAudio").classList.remove("blue");
        }
    }
}

async function createRoom() {
    remoteStream = new MediaStream();
    document.querySelector('#localVideo').srcObject = localStream;
    document.querySelector('#remoteVideo').srcObject = remoteStream;
    console.log("HI\n");
    const db = window.firebase.firestore();
    window.roomRef = await db.collection('rooms').doc();

    console.log('Create PeerConnection with configuration: ', configuration);
    peerConnection = new RTCPeerConnection(configuration);

    registerPeerConnectionListeners();

    localStream.getTracks().forEach(track => {
        localStreamSender = peerConnection.addTrack(track, localStream);
        video_list.push(localStreamSender);
    });

    // Code for collecting ICE candidates below
    const callerCandidatesCollection = window.roomRef.collection('callerCandidates');

    peerConnection.addEventListener('icecandidate', event => {
        if (!event.candidate) {
            console.log('Got final candidate!');
            return;
        }
        console.log('Got candidate: ', event.candidate);
        callerCandidatesCollection.add(event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above

    // Code for creating a room below
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('Created offer:', offer);

    const roomWithOffer = {
        'offer': {
            type: offer.type,
            sdp: offer.sdp,
        },
    };

    await window.roomRef.set(roomWithOffer);
    roomId = window.roomRef.id;
    console.log(`New room created with SDP offer. Room ID: ${window.roomRef.id}`);
    document.querySelector(
        '#currentRoom').innerText = `Current room is ${window.roomRef.id} - You are the caller!`;

    // Code for creating a room above

    peerConnection.addEventListener('track', event => {
        console.log('Got remote track:', event.streams[0]);
        event.streams[0].getTracks().forEach(track => {
            console.log('Add a track to the remoteStream:', track);
            remoteStream.addTrack(track);
        });
    });


    if (!remoteStream) {
        document.querySelector('#remoteVideo').srcObject = null;
    }
    // Listening for remote session description below
    window.roomRef.onSnapshot(async snapshot => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data && data.answer) {
            console.log('Got remote description: ', data.answer);
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            await peerConnection.setRemoteDescription(rtcSessionDescription);
        }
    });
    // Listening for remote session description above

    // Listen for remote ICE candidates below
    window.roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
                let data = change.doc.data();
                console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });

    // Listen for remote ICE candidates above
}

function joinRoom() {
    console.log("abdakj");
    remoteStream = new MediaStream();
    document.querySelector('#localVideo').srcObject = localStream;
    document.querySelector('#remoteVideo').srcObject = remoteStream;
    document.querySelector('#confirmJoinBtn').addEventListener('click', async() => {
        roomId = document.querySelector('#room-id').value;
        console.log('Join room: ', roomId);
        document.querySelector(
            '#currentRoom').innerText = `Current room is ${roomId} - You are the callee!`;
        await joinRoomById(roomId);
    }, { once: true });
    roomDialog.open();
}

async function joinRoomById(roomId) {
    const db = window.firebase.firestore();
    window.roomRef = db.collection('rooms').doc(`${roomId}`);
    const roomSnapshot = await window.roomRef.get();
    console.log('Got room:', roomSnapshot.exists);

    if (roomSnapshot.exists) {
        console.log('Create PeerConnection with configuration: ', configuration);
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();
        localStream.getTracks().forEach(track => {
            localStreamSender = peerConnection.addTrack(track, localStream);
        });

        // Code for collecting ICE candidates below
        const calleeCandidatesCollection = window.roomRef.collection('calleeCandidates');
        peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            calleeCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        peerConnection.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                remoteStream.addTrack(track);
            });
        });

        if (remoteStream == null) {
            document.querySelector('#remoteVideo').srcObject = null;
        }


        // Code for creating SDP answer below
        const offer = roomSnapshot.data().offer;
        console.log('Got offer:', offer);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        console.log('Created answer:', answer);
        await peerConnection.setLocalDescription(answer);

        const roomWithAnswer = {
            answer: {
                type: answer.type,
                sdp: answer.sdp,
            },
        };
        await window.roomRef.update(roomWithAnswer);
        // Code for creating SDP answer above

        // Listening for remote ICE candidates below
        window.roomRef.collection('callerCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        document.getElementById("main_code").classList.remove("disabled");
        document.getElementById("front_page").classList.add("disabled");
        // Listening for remote ICE candidates above
    }
}

async function openForFrontPage(e) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.querySelector('#myVid').srcObject = stream;
    localStream = stream;
}

async function openUserMedia(e) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.querySelector('#localVideo').srcObject = stream;
    localStream = stream;
    remoteStream = new MediaStream();
    document.querySelector('#remoteVideo').srcObject = remoteStream;
    remoteScreenShare = new MediaStream();
    document.querySelector('#remoteScreenShare').srcObject = remoteScreenShare;
    console.log('Stream:', document.querySelector('#localVideo').srcObject);
}

async function hangUp(e) {
    const tracks = document.querySelector('#localVideo').srcObject.getTracks();
    tracks.forEach(track => {
        track.stop();
    });

    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection) {
        peerConnection.close();
    }

    document.querySelector('#localVideo').srcObject = null;
    document.querySelector('#remoteVideo').srcObject = null;
    document.querySelector('#hangupBtn').disabled = true;
    document.querySelector('#currentRoom').innerText = '';

    // Delete room on hangup
    if (roomId) {
        const db = window.firebase.firestore();
        window.roomRef = db.collection('rooms').doc(roomId);
        const calleeCandidates = await window.roomRef.collection('calleeCandidates').get();
        calleeCandidates.forEach(async candidate => {
            await candidate.ref.delete();
        });
        const callerCandidates = await window.roomRef.collection('callerCandidates').get();
        callerCandidates.forEach(async candidate => {
            await candidate.ref.delete();
        });
        await window.roomRef.delete();
    }

    document.location.reload(true);
}

function registerPeerConnectionListeners() {
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`);
        if (peerConnection.connectionState === 'disconnected') {
            document.querySelector('#remoteVideo').srcObject = null;
        }
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(
            `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
}


async function screen_share() {
    if (!localScreenShare) {
        localScreenShare = await navigator.mediaDevices.getDisplayMedia({ video: true });
    }
    video_list.find(sender => sender.track.kind === 'video').replaceTrack(localScreenShare.getTracks()[0]);
    document.querySelector('#localVideo').srcObject = localScreenShare;
    stopShare.disabled = false;
    startShare.disabled = true;
};

async function end_screen_share() {
    video_list.find(sender => sender.track.kind === 'video').replaceTrack(localStream.getTracks().find(track => track.kind === 'video'));
    document.querySelector('#localVideo').srcObject = localStream;
    stopShare.disabled = true;
    startShare.disabled = false;
};


async function screen_recording() {
    if (recordButton.textContent === 'Start Recording') {
        Recordingstart();
    } else {
        stopRecording();
        recordButton.textContent = 'Start Recording';
        downloadButton.disabled = false;
        codecPreferences.disabled = false;
    }
};



//function for downloading the recorded files 
async function download_recording() {
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
};

function handleDataAvailable(event) {
    console.log('handleDataAvailable', event);
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

function getSupportedMimeTypes() {
    const possibleTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/mp4;codecs=h264,aac',
    ];
    return possibleTypes.filter(mimeType => {
        return MediaRecorder.isTypeSupported(mimeType);
    });
}

async function Recordingstart() {
    recordedBlobs = [];
    const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value;
    const options = { mimeType };
    const recordedStream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: "screen" }, audio: true });
    //recordedStream= navigator.mediaDevices.getDisplayMedia({video: { mediaSource: "screen" }});
    mediaRecorder = new MediaRecorder(recordedStream, options);
    recordButton.textContent = 'Stop Recording';
    downloadButton.disabled = true;
    codecPreferences.disabled = true;
    mediaRecorder.onstop = (event) => {
        console.log('Recorder stopped: ', event);
        console.log('Recorded Blobs: ', recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
    mediaRecorder.stop();
}




let inRoom = false;


//init();
async function frontFun() {
    openForFrontPage();
    getSupportedMimeTypes().forEach(mimeType => {
        const option = document.createElement('option');
        option.value = mimeType;
        option.innerText = option.value;
        codecPreferences.appendChild(option);
    });
    codecPreferences.disabled = false;
    document.querySelector('#createIt').addEventListener('click', () => {
        init();
        createRoom();
        main_code();
    });
    roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
    document.querySelector('#joinIt').addEventListener('click', () => {
        init();
        joinRoom();
    });

}

function main_code() {
    document.getElementById("main_code").classList.remove("disabled");
    document.getElementById("front_page").classList.add("disabled");
}

if (inRoom === false) {
    console.log("hello aditi")
    document.getElementById("main_code").classList.add("disabled");
    frontFun();
} else {
    main_code();
}