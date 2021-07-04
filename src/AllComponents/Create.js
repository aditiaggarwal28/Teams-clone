import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Helmet } from "react-helmet";
import Webcam from "react-webcam";


class Create extends Component {
    constructor(props) {
        super();
        this.state = {
            isVideo: true,
            isAudio: true
        };
        this.changeVid = this.changeVid.bind(this);
        this.changeAud = this.changeAud.bind(this);
        this.changeroom = this.changeroom.bind(this);
    }

    changeVid() {
        this.setState(prev =>
            ({ isVideo: !prev.isVideo })
        );
    }

    changeAud() {
        this.setState(prev =>
            ({ isAudio: !prev.isAudio })
        );
    }

    changeroom(){
        this.props.name=!this.props.name;
    }

    render() {
        const videoConstraints = {
            width: 800,
            height: 900,
            facingMode: "user"
        };
        let caming;
        if (this.state.isVideo) {
            caming = <Webcam
                audio={this.state.isAudio}
                height={720}
                screenshotFormat="image/jpeg"
                width={1280}
            />
        }
        else {
            caming = <div style={{
                backgroundColor: "white",
                width: "40%",
                height: "30%"
            }}></div>
        }
        console.log(this.state.isVideo);

        return (
            <>
                <div id="frontPage">

                    {caming}
                    <button onClick={this.changeVid}>vid</button>
                    <button onClick={this.changeAud}>aud</button>
                    <button onClick={this.changeroom}>room</button>
                </div>
            </>
        )
    }
}
export default Create