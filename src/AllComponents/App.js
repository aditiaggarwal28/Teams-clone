import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Navbr from './Navbr';
import Create from './Create';
import Interface from './Interface';

class App extends Component{
    constructor(){
        super();
    }
    render(){
        let inRoom = true;
        if(inRoom===false){
            return(
                <>
                    <Navbr/>
                    <Create name={inRoom}/>
                </>
            )
        }
        return(
            <>
                <Navbr/>
                
            </>
        )
    }
}
export default App