import React, { useState, useEffect, useRef } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Chatfun.css';

let auth;

function Chatroom() {
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
			<main className="border border-light rounded">
				{messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
				<span ref={val}></span>
			</main>

			<form className="border border-light rounded" onSubmit={sendMessage}>
				<input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
				<button type="submit" disabled={!formValue}>Send</button>
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
		const provider = new window.firebase.auth.GoogleAuthProvider();
		console.log(provider)
		auth.signInWithPopup(provider);
	}
	return (
		<button className="btn btn-secondary"onClick={signInWithGoogle}> Sign In with google</button>
	)
}

function SignOut() {
	return auth.currentUser && (
		<button className="btn btn-secondary" onClick={() => auth.signOut()}>Sign Out</button>
	)
}


function ChatApp() {
	// Initialize Firebase
	window.firebase.app();
	auth=window.firebase.auth();
	const [user] = useAuthState(auth);
	return (
		<div className="ChatApp">
			<header className="App-header">
				<SignOut />
			</header>
			<section >
				{user ? <Chatroom /> : <SignIn />}
			</section>
		</div>
	)
}
export default ChatApp