import React, { Component } from 'react';


class OnlyChat extends Component {
    state = {
        addContainer: false
    }
    render() {
        document.getElementById("front_page").classList.add("disabled");
        document.getElementById("main_code").classList.add("disabled");
        document.getElementById("chat").classList.remove("disabled");
        return (
            <>
            </>

        );

    }


}
export default OnlyChat