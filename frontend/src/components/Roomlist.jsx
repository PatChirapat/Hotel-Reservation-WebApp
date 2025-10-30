import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from "react-router-hash-link";
import "../ui/Roomlist.css";

const rooms = [
    {
        id: 1,
        key: "classic",
        name: "Classic Room",
        description:"The hotel's Classic Rooms are located on Level 10 to Level 15, offering a comfortable stay with essential amenities for both business and leisure travelers.",
        image: "/images/rooms/proj_room_classic1.png",
    },
    {
        id: 2,
        key: "premier",
        name: "Premier Room",
        description:"The hotel's Premier Rooms are situated on Level 16 to Level 20, featuring upgraded furnishings, enhanced amenities, and stunning city views.",
        image: "/images/rooms/proj_room_premier1.jpg",
    },
    {
        id: 3,
        key: "executive",
        name: "Executive Suite",
        description:"The hotel's Executive Suites are located on Level 31 to Level 35, providing an elevated experience with separate living and sleeping areas.",
        image: "/images/rooms/proj_room_exec1.jpg",
    },
    {
        id: 4,
        key: "diplomatic",
        name: "Diplomatic Suite",
        description:"The hotel's Diplomatic Suites are designed for high-profile guests, featuring a private dining area and luxurious amenities.",
        image: "/images/rooms/proj_room_diplomatic1.jpg",
    },
    {
        id: 5,
        key: "royal",
        name: "Royal Suite",
        description:"The hotel's Royal Suites are the epitome of luxury, located on the top floors with panoramic views, opulent furnishings, and exclusive services.",
        image: "/images/rooms/proj_room_royal1.jpg",
    },               
];

function Roomlist() {
    const [startIndex, setStartIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
            setStartIndex((prevIndex) => (prevIndex + 1) % rooms.length);
            setFade(true);
        }, 500);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const visibleRooms = [
        rooms[startIndex],
        rooms[(startIndex + 1) % rooms.length],
        rooms[(startIndex + 2) % rooms.length],
    ];

    return (
        <section className="roomlist-section">
        <h1 className="roomlist-title">Suites & Rooms</h1>

        <div className={`roomlist-grid ${fade ? "fade-in" : "fade-out"}`}>
            {visibleRooms.map((room) => (
            <div key={room.id} className="roomlist-card">
                <div className="roomlist-img-container">
                <img
                    src={room.image}
                    alt={room.name}
                    className="roomlist-img"
                />
                </div>
                <div className="roomlist-details">
                <h2 className="roomlist-name">{room.name}</h2>
                <p className="roomlist-desc">{room.description}</p>
                <button className="roomlist-btn">
                    <HashLink smooth to={`/Room#${room.key}`}>
                        View Details
                    </HashLink>
                </button>
                </div>
            </div>
            ))}
        </div>
        </section>
    );
}

export default Roomlist;
