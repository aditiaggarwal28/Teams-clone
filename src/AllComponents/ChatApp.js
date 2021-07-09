import React, { useState, useEffect, useRef } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Chatfun.css';

let auth;

function Chatroom() {
	console.log(window.roomRef);
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
			<main>
				{messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
				<span ref={val}></span>
			</main>

			<form onSubmit={sendMessage}>
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
		console.log("ahfnafkjn")
		const provider = new window.firebase.auth.GoogleAuthProvider();
		console.log(provider)
		auth.signInWithPopup(provider);
	}
	return (
		<button onClick={signInWithGoogle}> Sign In with google</button>
	)
}

function SignOut() {
	return auth.currentUser && (
		<button onClick={() => auth.signOut()}>Sign Out</button>
	)
}


function ChatApp() {
	// Initialize Firebase
	window.firebase.app();
	auth=window.firebase.auth();
	console.log("agya")
	const [user] = useAuthState(auth);
	console.log("aaaya ni")
	return (
		<div className="App">
			<header className="App-header">
				<SignOut />
			</header>
			<section>
				{user ? <Chatroom /> : <SignIn />}
			</section>
		</div>
	)
}
export default ChatApp