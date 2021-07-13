import React, { Component } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

function SignOut() {
    document.getElementById('front_page').classList.add('disabled');
    document.getElementById('signin').classList.remove('disabled');
    window.firebase.app();
    let auth = window.firebase.auth();
    if (auth.currentUser) {
        auth.signOut();
    }
    return null;
}

function DisplayName() {
    window.firebase.app();
    let auth = window.firebase.auth();
    const [user] = useAuthState(auth);
    if (user) {
        return (
            <div style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
            <h6 style={{paddingRight:20}}>{user.email}</h6>
            <img src={user.photoURL} alt="User"/>
            </div>
        )   
    }
    return null;
}

class SignOutButton extends Component {
    constructor() {
        super();
        this.add = this.add.bind(this)
    }
    state = {
        addContainer: false
    }
    add = () => {
        this.setState({ addContainer: !this.state.addContainer });
    }

    myStyle = {
        position: 'fixed',
        top: '1%',
        right: '1%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        zIndex:91
    }

    buttonStyle = {
        borderRadius: '0',
        color: 'white',
        background: "none",
        border: "none",
        margin: "0",
        padding: '0',
    }

    render() {
        return (
            <>
                <div style={this.myStyle}>
                    {window.loggedIn && <DisplayName />}
                    <button style={this.buttonStyle} className="btn btn-link border-0" onClick={() => this.add()}>Sign Out</button>
                    {this.state.addContainer && <SignOut />}
                </div>
            </>

        );

    }


}
export default SignOutButton