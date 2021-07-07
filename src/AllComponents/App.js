import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Navbr from './Navbr';
import Interface from './Interface';
import ChatApp from './ChatApp';

class App extends Component {
    state = {
        addContainer: false
    }
    add = () => {
        this.setState({ addContainer: !this.state.addContainer });
    }

    render() {
        return (
            <>
                <Navbr />
                <div>
                    <button onClick={() => this.add()}>CLICK</button>
                    {this.state.addContainer &&
                        <ChatApp roomRef={window.roomRef}/>
                    }
                </div>
            </>

        );

    }


}
export default App