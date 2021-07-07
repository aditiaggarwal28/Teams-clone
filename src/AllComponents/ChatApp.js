import React, { useState, useRef } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore'
import 'firebase/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore';
import './Chatfun.css';

//const auth=firebase.auth();

function Chatroom(props) {
    console.log(window.roomRef);
    const val = useRef();
    const messagesRef = window.roomRef.collection('messages');
    console.log("hi babe")
    const query = messagesRef.orderBy('createdAt').limit(25);
    const [messages] = useCollectionData(query, { idField: 'id' });
    const [formValue, setFormValue] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();
        //const { uid, photoURL } = auth.currentUser;
        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
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
    //const messageClass = uid === auth.currentUser.uid ? 'sent' : 'receive';

    return (
        <div >
            <p> {text}</p>
        </div>
    )
}


function ChatApp(props) {
    console.log(props.roomRef);
    return (
        <div className="chatApp">
            <header className="chatApp-header">
            </header>
            <section>
                <Chatroom roomRef={props.roomRef} />
            </section>
        </div>
    )
}
export default ChatApp