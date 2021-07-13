import React, { Component } from 'react';
import ChatApp from './ChatApp';
import '../img/chat.png'
import './Chatfun.css'

// CHat button functionality.
class Chat extends Component {
    state = {
        addContainer: false
    }
    add = () => {
        this.setState({ addContainer: !this.state.addContainer });
    }

    myStyle={
        position: 'fixed',
        bottom:'1%',
        left:'1%',
    }

    render() {
        return (
            <>
                <div>
                    <button title="Chat" className="btn btn-secondary" style={this.myStyle} onClick={() => this.add()}><img id="chatBtn" src="../img/chat.png" alt="img"></img></button>
                    {this.state.addContainer &&
                        <ChatApp />
                    }
                </div>
            </>

        );

    }


}
export default Chat