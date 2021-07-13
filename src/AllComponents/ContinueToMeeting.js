import React, { Component } from 'react';

function Fun(){
    const dialog=new  window.mdc.dialog.MDCDialog(document.querySelector('#room-dialog'))
    dialog.open();
    return(
        null
    )
}

//Continue to meeting button functionality
class ContinueToMeeting extends Component {
    state = {
        addContainer: false
    }
    add = () => {
        this.setState({ addContainer: !this.state.addContainer });
        document.getElementById("front_page").classList.add("disabled");
        document.getElementById("main_code").classList.remove("disabled"); 
        document.getElementById("remoteVideo").muted=false;
        let chat_button=document.getElementById("chatBtn");
        chat_button.click();
    }

    myStyle={
        position:"fixed",
        top:"6%",
        left:0,

    }
          
    render() {
        return (
            <>
                <div style={this.myStyle}>
                    <button id="goBackButton" className="mdc-button mdc-button--raised"  onClick={() => this.add()}><span id="gobackSpan" className="mdc-button__label">Go to the meeting</span></button>
                    {this.state.addContainer && <Fun/>}
                </div>
            </>

        );

    }


}
export default ContinueToMeeting;