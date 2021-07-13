import React, { useState, useRef } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Chatfun.css';
import OnlyChat from './OnlyChat.js';
import ContinueToMeeting from './ContinueToMeeting';

let auth;

// CHat room retrives chat from databases and displays.
function Chatroom() {
	window.joincall = true;
	const val = useRef();
	const messagesRef = window.roomRef.collection('messages');
	const query = messagesRef.orderBy('createdAt').limit();
	const [messages] = useCollectionData(query, { idField: 'id' });
	const [formValue, setFormValue] = useState('');

	const sendMessage = async (e) => {
		e.preventDefault();
		const { uid, photoURL } = auth.currentUser;
		await messagesRef.add({
			text: formValue,
			createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
			uid, photoURL
		})
		setFormValue('');
		val.current.scrollIntoView({ behavior: 'smooth' });
	}

	return (
		<>
			<h2>Chat</h2>
			<main id="main">
				{messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
				<span ref={val}></span>
			</main>

			<form id="formChat" onSubmit={sendMessage}>
				<input id="inputChat" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
				<button className="chatBtn" type="submit" disabled={!formValue}>Send</button>
			</form>
		</>
	)
}

// Input message
function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;
	const messageClass = uid === auth.currentUser.uid ? 'sent' : 'receive';

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} alt="User" />
			<p> {text}</p>
		</div>
	)
}

// Sign in
function SignIn() {

	const signInWithGoogle = () => {
		const provider = new window.firebase.auth.GoogleAuthProvider();
		console.log(provider)
		auth.signInWithPopup(provider);
	}
	return (
		<button className="chatBtn" onClick={signInWithGoogle}> Sign In with google</button>
	)
}



function ChatApp() {
	// Initialize Firebase
	window.firebase.app();
	auth = window.firebase.auth();
	const [user] = useAuthState(auth);
	return (
		<>
			<div className="mychatcss">
				<h5 style={{position:'fixed',right:'2%'}}>Room ID: <span style={{color:'yellow'}}>{window.roomRef.id}</span></h5>
				<div className="d-flex justify-content-center align-content-center">
					<div className="card shadow border-0 ">
						<div className="card-body">
							<section className="chatsection">
								{user ? <><Chatroom /> <OnlyChat /><ContinueToMeeting /> </> : <SignIn />}
							</section>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
export default ChatApp