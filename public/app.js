mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-button')); //mdc popup text area
const configuration = { // turn and stun servers
    iceServers: [{
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
            ],
        },
        {

            url: 'turn:numb.viagenie.ca',

            credential: 'muazkh',

            username: 'webrtc@live.com'

        },
        {

            url: 'turn:192.158.29.39:3478?transport=udp',

            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',

            username: '28224511:1379330808'

        },
        {
            url: 'turn:192.158.29.39:3478?transport=tcp',

            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',

            username: '28224511:1379330808'

        }
    ],
    iceCandidatePoolSize: 10,
};
let peerConnection = null; //main peerConnection
let localStream = null; //stores the local stream of the user
let remoteStream = null; //stores the remote stream obtained via peerconnection
let roomDialog = null; //popup mdc room dialog
let roomId = null;
let localStreamSender = null; //The RTCRtpSender object which will be used to transmit the localstream data
let remoteScreenShare = null; // screenShare stream for remote user
let localScreenShare = null; // screenShare stream for local user
let mediaRecorder = null;
window.roomRef = null;
window.joincall = false;
let recordedBlobs = null;
const recordButton = document.querySelector('#startRecording');
const downloadButton = document.querySelector('#downloadRecord');
const stopShare = document.querySelector('#stopScreenShare');
const startShare = document.querySelector('#screenShare');
recordButton.textContent = 'Start Recording'
const video_list = []

function init() {
    // this function assigns all buttons to their respective functions and
    // also initializes the dialog box for entering room id.
    document.querySelector('#hangupBtn').addEventListener('click', hangUp);
    document.querySelector('#startRecording').addEventListener('click', screen_recording);;
    document.querySelector('#downloadRecord').addEventListener('click', download_recording);;
    document.querySelector('#screenShare').addEventListener('click', screen_share);
    document.querySelector('#closecameraBtn').addEventListener('click', closeCamera);
    document.querySelector('#stopScreenShare').addEventListener('click', end_screen_share);
    document.querySelector('#muteAudio').addEventListener('click', closeMic);
    console.log(window.firebase.auth().currentUser.displayName);
    document.getElementById("localName").innerHTML = window.firebase.auth().currentUser.displayName + "(You)";
    roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
}

function closeCamera() {
    // this function is to close and open camera on clicking camera off button.
    // This is done by disabling and enabling the video tracks of localStream.
    if (localStream == null) {
        console.log("no stream found")
        return;
    }
    var videoTracks = localStream.getVideoTracks();
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
    // this function is to close and open mic on clicking mic off button.
    // This is done by disabling and enabling the audio tracks of localStream.
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
    // Create Room for WebApp
    /*
        It creates a new room at the firebase databases and adds the user in it.

    */
    remoteStream = new MediaStream();
    document.querySelector('#localVideo').srcObject = localStream;
    document.querySelector('#remoteVideo').srcObject = remoteStream;
    console.log("HI\n");
    const db = window.firebase.firestore();

    // creating new room at firestore database of firebase collections
    if (window.roomRef == null) {
        window.roomRef = await db.collection('rooms').doc();
    } else {
        db.collection('rooms').doc(window.roomRef.id);
    }

    //changing the display pages on entering the room.
    document.getElementById("main_code").classList.add("disabled");
    document.getElementById("front_page").classList.add("disabled");
    document.getElementById("chat").classList.remove("disabled");
    let chat_button = document.getElementById("chatBtn");
    chat_button.click();

    //new pperconnnection
    console.log('Create PeerConnection with configuration: ', configuration);
    peerConnection = new RTCPeerConnection(configuration);

    registerPeerConnectionListeners();


    // adding local strams on the peerconnection
    // to be retrieved the the other user as remote stream
    // also maintaining a video list which contains the video
    // of user and the screen sharing video to display user video
    // and to share screen on the same stream as and when required.
    localStream.getTracks().forEach(track => {
        localStreamSender = peerConnection.addTrack(track, localStream);
        video_list.push(localStreamSender);
    });

    //initially both camera and mic are off for the user.
    closeMic();
    closeCamera();

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
        '#currentRoom').innerText = `Room ID: ${window.roomRef.id} `;

    // Code for creating a room above


    //retrriving remote user tracks as remote stream from the peerConnection.
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



// Copying the room id to clipboard.
// Room id is copied by creating a new textarea element
// and selecting and copying it.
// Also, a tooltip is displayed for 1 second on button press.
document.querySelector("#copyBtn").addEventListener("click", copyIt);

function copyIt() {
    /* Get the text field */
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = window.roomRef.id;
    dummy.select();
    document.getElementById("custom-tooltip").style.display = "inline";
    document.execCommand("copy");
    document.body.removeChild(dummy);
    setTimeout(function() {
        document.getElementById("custom-tooltip").style.display = "none";
    }, 1000);
}
//copy room id above



// joining a room with custom roomid
function joinRoom() {
    remoteStream = new MediaStream();
    document.querySelector('#localVideo').srcObject = localStream;
    document.querySelector('#remoteVideo').srcObject = remoteStream;
    document.querySelector('#confirmJoinBtn').addEventListener('click', async() => {
        roomId = document.querySelector('#room-id').value;
        console.log('Join room: ', roomId);
        document.querySelector(
            '#currentRoom').innerText = `Room ID: ${roomId} `;
        await joinRoomById(roomId);
    }, { once: true });
    roomDialog.open();
}

async function joinRoomById(roomId) {
    //getting articular room from the firestore databases
    //using room id.
    const db = window.firebase.firestore();
    window.roomRef = db.collection('rooms').doc(`${roomId}`);
    const roomSnapshot = await window.roomRef.get();
    console.log('Got room:', roomSnapshot.exists);

    if (roomSnapshot.exists) {
        console.log('Create PeerConnection with configuration: ', configuration);

        //new peerConnection
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();

        // adding local strams on the peerconnection
        // to be retrieved the the other user as remote stream
        // also maintaining a video list which contains the video
        // of user and the screen sharing video to display user video
        // and to share screen on the same stream as and when required.
        localStream.getTracks().forEach(track => {
            localStreamSender = peerConnection.addTrack(track, localStream);
            video_list.push(localStreamSender);
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


        //retrriving remote user tracks as remote stream from the peerConnection.
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

        //initally camera and mic are off.
        closeMic();
        closeCamera();

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
        document.getElementById("main_code").classList.add("disabled");
        document.getElementById("front_page").classList.add("disabled");
        document.getElementById("chat").classList.remove("disabled");
        let chat_button = document.getElementById("chatBtn");
        chat_button.click();
        // Listening for remote ICE candidates above
    }
}


// Asks for permission to open camera and mic.
// Opens camera and mic for site.
async function openForFrontPage(e) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.querySelector('#myVid').srcObject = stream;
    localStream = stream;
}


// Disconnects and hangs up the call.
// Video call is disconnected but anyone can still chat in here.
// This is because chats are stored in rooms of firebase databases.
async function hangUp(e) {
    //close localStream
    const tracks = document.querySelector('#localVideo').srcObject.getTracks();
    tracks.forEach(track => {
        track.stop();
    });

    // Close Remote Stream
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
    }

    //close peerconnection
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
    }

    //opening chat page on hangup
    window.joincall = false;
    document.getElementById("main_code").classList.add("disabled");
    document.getElementById("front_page").classList.add("disabled");
    document.getElementById("chat").classList.remove("disabled");
    let chat_button = document.getElementById("chatBtn");
    chat_button.click();
    document.getElementById("gobackSpan").textContent = "Leave Chat"
    document.querySelector('#goBackButton').addEventListener('click', () => {
        leaveChat();
    }); //from here just take it to the page of chat..where we have one button to leave chat
}


//To permanently leave the room, leaving chat as well as call.
async function leaveChat(e) {
    if (roomId) {
        const db = window.firebase.firestore();
        window.roomRef = db.collection('rooms').doc(roomId);
        const messages = await window.roomRef.collection('messages').get();
        messages.forEach(async candidate => {
            await candidate.ref.delete();
        });
        await window.roomRef.delete();
    }
    //automatically signs out user on hangup.
    window.firebase.auth().signOut();
    window.location.reload();
}

// Peerconnection registration code below.
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
// Peerconnection registration code above.

// Screen share
async function screen_share() {
    if (!localScreenShare) {
        localScreenShare = await navigator.mediaDevices.getDisplayMedia({ video: true });
    }

    //adds the screen share stream to video_list 
    //to be able to be displayed in place of user video.
    video_list.find(sender => sender.track.kind === 'video').replaceTrack(localScreenShare.getTracks()[0]);
    document.querySelector('#localVideo').srcObject = localScreenShare;
    stopShare.disabled = false;
    startShare.disabled = true;
};

// Ends the sceren share and puts back the user video on the localstream.
async function end_screen_share() {
    video_list.find(sender => sender.track.kind === 'video').replaceTrack(localStream.getTracks().find(track => track.kind === 'video'));
    document.querySelector('#localVideo').srcObject = localStream;
    stopShare.disabled = true;
    startShare.disabled = false;
};


// Starting and ending the screen recording
// this function controls when to start and stoop the sceen recording .
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

// to recored the video in different codecs.
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


// stating thr recording.
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

// stop recording
function stopRecording() {
    mediaRecorder.stop();
}

// this is always false at the beginning of the code.
// This decides when to execute what code.
let inRoom = false;

//init();
//front page initialization with create room and join room.
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
    });
    roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
    document.querySelector('#joinIt').addEventListener('click', () => {
        init();
        joinRoom();
    });

}


window.loggedIn = false; // if user is logged in or not.

if (inRoom === false) {
    document.getElementById("main_code").classList.add("disabled");
    frontFun();
}