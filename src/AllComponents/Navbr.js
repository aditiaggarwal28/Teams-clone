import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Logo from '../Images/Logo.png';
import { Navbar, Form, Nav, Button, FormControl } from 'react-bootstrap';

class Navbr extends Component {
    render() {
        const myStyle = {
            height: "50px",
            backgroundColor: "#202020",
        };
        console.log("nononnonononononono");
        return (
            <>
                <Navbar style={myStyle}>
                    <Nav className="mr-auto">
                        <Nav.Link href="">
                        </Nav.Link>
                        <Nav.Link href="#home">
                            <img
                                src={Logo}
                                width="30"
                                height="30"
                                className="d-inline-block align-top"
                                alt="Microsoft Teams logo"
                            />
                        </Nav.Link>
                        <Nav.Link href="">
                            <h2 style={{
                                fontSize: "25px",
                                color: "white",
                                background:"rgb(94, 48, 221)",
                                paddingLeft: 9,
                                paddingRight: 9,
                                borderRadius:"5%",
                                fontWeight:"inherit",
                            }}>Microsoft Teams</h2>

                        </Nav.Link>
                    </Nav>

                </Navbar>
            </>
        )
    }
}
export default Navbr