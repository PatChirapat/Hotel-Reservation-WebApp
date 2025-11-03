import React, { useState } from "react";
import { Link, useLocation } from 'react-router-dom';

import "../ui/Navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo">
                    <span>HOTEL ROOM</span>
                    <span>RESERVATION SYSTEM</span>
                </Link>
            </div>
            <div className="navbar-right">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/Room" className="nav-link">Rooms & Suites</Link>
                <Link to="/facilities" className="nav-link">Facilities</Link>
                <Link to="/booking" className="booking">Book Now</Link>
                <Link to="/signin" className="nav-link flex items-center gap-1">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-5 h-5"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" 
                        />
                    </svg>
                    </Link>
            </div> 
        </nav>
    );
}
