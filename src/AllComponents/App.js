import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Navbr from './Navbr';
import Chat from './Chat';

class App extends Component {
    render() {
        return (
            <>
                <Navbr />
                
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
export default App