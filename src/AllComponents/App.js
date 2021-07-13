import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Chat from './Chat';
import Google from './Google';
import Navbr from './Navbr'
import SignOutButton from './SignOutButton'

// Navbar on every page.
class App extends Component {
    render() {
        return (
            <> 
                <Navbr/>
            </>
        );
    }
}

ReactDOM.render(
    <>
        <Chat />
    </>,
    document.getElementById('chat')
);

ReactDOM.render(
    <>
        <Google/>
    </>,
    document.getElementById('signinGoogle')
);

ReactDOM.render(
    <>
        <SignOutButton/>
    </>,
    document.getElementById('signoutFront')
);


export default App