import React from "react";
import { Link, useLocation } from 'react-router-dom';
import "../ui/Navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-upper">
                <Link to="/" className="navbar-logo">
                    <span>HOTEL ROOM</span>
                    <span>RESERVATION SYSTEM</span>
                </Link>
            </div>
            <div className="navbar-lower">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/rooms" className="nav-link">Rooms</Link>
                <Link to="/facilities" className="nav-link">Facilities</Link>
                <Link to="/booking" className="booking">Book Now</Link>
            </div> 
        </nav>
    );
}

