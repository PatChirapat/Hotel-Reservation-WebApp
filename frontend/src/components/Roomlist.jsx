import React from "react";
import "../ui/Roomlist.css";

const rooms = [
        {
            id: 1,
            name: "Deluxe Room",
            description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            image: "/images/rooms/proj_room_temp.jpeg",
        },
        {
            id: 2,
            name: "Suite Room",
            description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            image: "/images/rooms/proj_room_temp.jpeg",
        },
        {
            id: 3,
            name: "Standard Room",
            description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            image: "/images/rooms/proj_room_temp.jpeg",
        },
    ];

function Roomlist() {
    return (
        <section className="roomlist-section">
            <h1 className="roomlist-title">Our Rooms</h1>
            <div className="roomlist">
                {rooms.map((room) => (
                    <div key={room.id} className="room-card">
                        <div className="room-image-container">
                            <img src={room.image} alt={room.name} className="room-image" />
                        </div>
                        <div className="room-details">
                            <h2 className="room-name">{room.name}</h2>
                            <p className="room-description">{room.description}</p>
                            <button className="room-button">View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Roomlist;
