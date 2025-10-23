import React, { useState } from "react";
import "../ui/BookingBar.css";

function BookingBar() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [rooms, setRooms] = useState(1);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    return (
        <div className="booking-bar">
        <div className="booking-field">
            <label>ARRIVAL</label>
            <input type="date" defaultValue="2025-10-23" />
        </div>

        <div className="booking-field">
            <label>DEPARTURE</label>
            <input type="date" defaultValue="2025-10-24" />
        </div>

        {/* GUESTS DROPDOWN */}
        <div className="booking-field guest-field">
            <label>GUESTS</label>
            <div className="guest-display" onClick={toggleDropdown}>
            {rooms} room / {adults + children} guest
            </div>

            {showDropdown && (
            <div className="guest-dropdown">
                <div className="guest-row">
                <span>ROOMS:</span>
                <select
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                >
                    {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num}>{num}</option>
                    ))}
                </select>
                </div>

                <div className="guest-row">
                <span>ADULTS:</span>
                <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                >
                    {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num}>{num}</option>
                    ))}
                </select>
                </div>

                <div className="guest-row">
                <span>CHILDREN:</span>
                <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                >
                    {[0, 1, 2, 3, 4].map((num) => (
                    <option key={num}>{num}</option>
                    ))}
                </select>
                </div>
            </div>
            )}
        </div>

        <button className="book-btn">BOOK NOW</button>
        </div>
    );
}

export default BookingBar;
