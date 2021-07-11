import React, { Component } from 'react';
import ChatApp from './ChatApp';

function Fun(){
    const dialog=new  window.mdc.dialog.MDCDialog(document.querySelector('#room-dialog'))
    dialog.open();
    return(
        null
    )
}

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