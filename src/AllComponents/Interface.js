import React, { Component } from 'react';
import ReactDOM from 'react-dom';


class Interface extends Component {
    render() {
        return (
            <>
                < div id="videos">
                    <div class="container">
                        <div class="row">
                            <div class="col-2">
                                <video id="localVideo" muted autoplay playsinline></video>
                            </div>
                            <div class="col-2">
                                <video id="remoteVideo" autoplay playsinline></video>
                            </div>
                            <div class="col-2">
                                <video id="screenVideo" autoplay playsinline muted></video>
                            </div>
                            <div class="col-2">
                                <video id="remoteScreenShare" autoplay playsinline muted></video>
                            </div>
                        </div>
                    </div>
                </div>
            </>

        )
    }
}
export default Interface