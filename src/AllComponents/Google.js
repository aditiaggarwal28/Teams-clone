import React, { Component } from 'react';
import MainSign from './SignIn'

//Sign in with google
class Google extends Component {
    constructor() {
        super();
        this.add=this.add.bind(this)
    }
    state = {
        addContainer: false
    }
    add = () => {
        this.setState({ addContainer: !this.state.addContainer });
        window.loggedIn=true;
    }

    style={
        borderRadius:"0",
    }

    render() {
        return (
            <>
                <div>
                    <button style={this.style} className="btn btn-primary border-0" onClick={() => this.add()}>Sign in with Google</button>
                    {this.state.addContainer &&
                        <MainSign />
                    }
                </div>
            </>

        );

    }


}
export default Google