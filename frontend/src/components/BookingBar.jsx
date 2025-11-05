import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../ui/BookingBar.css";

function BookingBar() {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const [checkin, setCheckin] = useState(today);
    const [checkout, setCheckout] = useState(tomorrow);
    const [showDropdown, setShowDropdown] = useState(false);
    const [rooms, setRooms] = useState(1);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    return (
        <div className="booking-bar">
        {/* CHECK IN */}
        <div className="booking-field">
            <label>CHECK IN</label>
            <input
            type="date"
            min={today}
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            />
        </div>

        {/* CHECK OUT */}
        <div className="booking-field">
            <label>CHECK OUT</label>
            <input
            type="date"
            min={checkin}
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            />
        </div>

        {/* GUEST DROPDOWN */}
        <div className="booking-field guest-field">
            <label>GUESTS</label>
            <div className="guest-display" onClick={toggleDropdown}>
            {rooms} room / {adults + children} guest
            </div>

            {showDropdown && (
            <div className="guest-dropdown">
                <div className="guest-row">
                <span>ROOMS:</span>
                <input
                    type="number"
                    min="1"
                    max="100"
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                />
                </div>

                <div className="guest-row">
                <span>ADULTS:</span>
                <input
                    type="number"
                    min="1"
                    max="100"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                />
                </div>

                <div className="guest-row">
                <span>CHILDREN:</span>
                <input
                    type="number"
                    min="0"
                    max="100"
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                />
                </div>
            </div>
            )}
        </div>

        <Link
            to="/booking"
            state={{
            checkin,
            checkout,
            rooms,
            adults,
            children,
            }}
            className="book-btn"
        >
            BOOK NOW
        </Link>
        </div>
    );
    }

export default BookingBar;
