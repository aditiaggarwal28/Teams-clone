import React from 'react';
import './Chatfun.css';
import { useAuthState } from 'react-firebase-hooks/auth';
let auth;
function Sign_in() {
	const provider = new window.firebase.auth.GoogleAuthProvider();
	console.log(provider)
	auth.signInWithPopup(provider);
	window.loggedIn = true;
	return null;

}

function Change() {
	window.loggedIn = true;
	console.log(window.loggedIn)
	document.getElementById("front_page").classList.remove("disabled");
	document.getElementById("signin").classList.add("disabled");
	return null;
}

function MainSign() {
	// Initialize Firebase
	window.firebase.app();
	auth = window.firebase.auth();
	const [user] = useAuthState(auth);
	return (
		<div>
			<section>
				{user ? <Change /> : <Sign_in />}
			</section>
		</div>
	)
}
export default MainSign;