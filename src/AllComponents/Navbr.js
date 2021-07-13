import React, { Component } from 'react';
import Logo from '../Images/Logo.png';
import { Navbar, Nav } from 'react-bootstrap';

// Navbar 
class Navbr extends Component {
    render() {
        const myStyle = {
            height: "50px",
            backgroundColor: "#202020",
            zIndex:"90",
        };
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
                                color: "white",
                                paddingLeft: 9,
                                paddingRight: 9,
                                borderRadius:"5%",
                                paddingTop:4,
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