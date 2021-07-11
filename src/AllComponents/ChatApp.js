import React, { useState, useEffect, useRef } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Chatfun.css';
import OnlyChat from './OnlyChat.js';
import ContinueToMeeting from './ContinueToMeeting';

let auth;

function Chatroom() {
	window.joincall = true;
	const val = useRef();
	const messagesRef = window.roomRef.collection('messages');
	const query = messagesRef.orderBy('createdAt').limit(25);
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

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;
	const messageClass = uid === auth.currentUser.uid ? 'sent' : 'receive';

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} />
			<p> {text}</p>
		</div>
	)
}

function SignIn() {

	const signInWithGoogle = () => {
		console.log("ahfnafkjn")
		const provider = new window.firebase.auth.GoogleAuthProvider();
		console.log(provider)
		auth.signInWithPopup(provider);
	}
	return (
		<button className="chatBtn" onClick={signInWithGoogle}> Sign In with google</button>
	)
}

function SignOut() {
	return auth.currentUser && (
		<button className="chatBtn" onClick={() => auth.signOut()}>Sign Out</button>
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