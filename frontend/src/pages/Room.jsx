import React, { useState } from 'react';
import '../ui/Room.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Room() {
    const room_list = {
        classic: [
            "images/rooms/proj_room_classic1.png",
            "images/rooms/proj_room_classic2.jpg",
            "images/rooms/proj_room_classic3.jpg"
        ],
        premier: [
            "images/rooms/proj_room_premier1.jpg",
            "images/rooms/proj_room_premier2.jpg",
            "images/rooms/proj_room_premier3.jpg"
        ],
        executive: [
            "images/rooms/proj_room_exec1.jpg",
            "images/rooms/proj_room_exec2.jpg",
            "images/rooms/proj_room_exec3.jpg"
        ],
        diplomatic: [
            "images/rooms/proj_room_diplomatic1.jpg",
            "images/rooms/proj_room_diplomatic2.jpg",
            "images/rooms/proj_room_diplomatic3.jpg",
            "images/rooms/proj_room_diplomatic4.jpg",
            "images/rooms/proj_room_diplomatic5.jpg",
            "images/rooms/proj_room_diplomatic6.jpg"
        ],
        royal: [
            "images/rooms/proj_room_royal1.jpg",
            "images/rooms/proj_room_royal2.jpg",
            "images/rooms/proj_room_royal3.jpg",
            "images/rooms/proj_room_royal4.jpg",
            "images/rooms/proj_room_royal5.jpg",
            "images/rooms/proj_room_royal6.jpg"
        ]
    };

    const room_details = {
        classic: {
            name: 'Classic Room',
            desc: 'A cozy retreat featuring a plush queen bed, modern decor, and warm lighting. Perfect for leisure or business travelers seeking comfort and convenience.',
            beds: '1 King Bed or 2 Single Beds',
            view: 'Panoramic City View',
            size: '70 sqm',
            occupancy: 'Maximum 2 Adults',
        },
        premier: {
            name: 'Premier Room',
            desc: 'Spacious and elegant with a king-sized bed, minibar, work desk, and city view. Designed for those who appreciate luxury and tranquility.',
            beds: '1 King Bed',
            view: 'Panoramic City View',
            size: '80 sqm',
            occupancy: 'Maximum 3 Adults',
        },
        executive: {
            name: 'Executive Suite',
            desc: 'The Executive Suite includes a private king bedroom with a bathroom, a large tub, and a rain shower. A spacious living area with comfortable sofas and an adjacent guest bathroom. Access into the club lounge and benefits are included.',
            beds: '1 King Bed',
            view: 'Panoramic City View',
            size: '100 sqm',
            occupancy: 'Maximum 3 Adults',
        },
        diplomatic: {
            name: 'Diplomatic Suite',
            desc: 'Containing an elegant 10-place dining room that doubles as a conference room suitable for VIP meetings and gatherings, Diplomatic Suite also has its own pantry equipped for the preparation and serving of in-room meals.',
            beds: '1 King Bed',
            view: 'Panoramic City View',
            size: '150 sqm',
            occupancy: 'Maximum 3 Adults',
        },
        royal: {
            name: 'Royal Suite',
            desc: 'The ultimate level of luxury including club benefits. Grand master bedroom, dining area, private bar, and marble bathroom. Experience the finest comfort and elegance.',
            beds: '1 King Bed',
            view: 'Panoramic City View',
            size: '250 sqm',
            occupancy: 'Maximum 3 Adults',
        }
    };

    const room_amenities = {
        "Comfort & Connectivity": [
            "Wifi",
            "Air Conditioning",
            "Flat Screen TV",
            "Mini Fridge",
            "Work Desk",
        ],
        "Convenience & Lifestyle": [
            "Coffee/Tea Maker",
            "Minibar",
            "Room Service",
            "In-room Safe",
        ],
        "Essentials & Extras": [
            "Hair Dryer",
            "Iron",
            "Free Parking",
        ]
    };

    const lounge_access = {
        classic: false,
        premier: false,
        executive: true,
        diplomatic: true,
        royal: true
    };

    const lounge_benefits = [
        "On Level 37",
        "Open daily from 06.00 to 23.00 hours",
        "Private check-in and check-out service available at lounge",
        "Two items of complimentary pressing service per stay (dry cleaning, laundry and express service are excluded)",
        "Complimentary in-room breakfast on departure day if leaving before 06.00 hours",
        "Complimentary use of the Club meeting room for one hour per night of stay; additional hours at a nominal charge. Reservation is recommended",
        "Complimentary local landline telephone calls (excluding calls to mobile phones)",
        "Personalised concierge and business services",
        "iPad available for use in lounge",
        "All-day premium teas, coffees and juices (06.00 to 23.00 hours)",
        "American buffet breakfast and à la carte selections (06.00 to 11.00 hours)",
        "High tea with snacks (14.30 to 16.30 hours)",
        "Happy hour canapés and cocktails (17.30 to 19.30 hours)"
    ];

    // Read More popup
    const [selectedRoom, setSelectedRoom] = useState(null);
    const openPopup = (key) => setSelectedRoom(key);
    const closePopup = () => setSelectedRoom(null);

    // Image slide 
    const [currentImage, setCurrentImage] = useState({
        classic: 0,
        premier: 0,
        executive: 0,
        diplomatic: 0,
        royal: 0
    });
    const handleImageChange = (room, index) => {
        setCurrentImage(prev => ({ ...prev, [room]: index }));
    };

    return (
        <div>
            <Navbar />
            <div className={`room ${selectedRoom ? 'blurred' : ''}`}>
                <h1>Explore Our Hotel Rooms and Suites in Bangkok</h1>
                <h2>Luxury Accommodation in the City Centre</h2>
                <p>
                    Overlooking vibrant Bangkok city, our newly renovated rooms and suites offer
                    light-filled accommodation featuring pastel-hued silk embroidered bedheads
                    and custom-made furniture throughout.
                </p>

                <div className="room-list">
                    {Object.keys(room_list).map((key, i) => {
                        const details = room_details[key];
                        const images = room_list[key];
                        const imgIndex = currentImage[key];
                        const isEven = i % 2 === 0;
                        return (
                            <div key={key} id={key} className={`room-section ${isEven ? 'left-image' : 'right-image'}`}>
                                <div className="room-image-container">
                                    <img src={images[imgIndex]} alt={details.name} className="room-image" />
                                    <div className="image-dots">
                                        {images.map((_, index) => (
                                            <span
                                                key={index}
                                                className={`dot ${imgIndex === index ? 'active' : ''}`}
                                                onClick={() => handleImageChange(key, index)}
                                            ></span>
                                        ))}
                                    </div>
                                </div>

                                <div className="room-info">
                                    <h3>{details.name}</h3>
                                    <p>{details.desc}</p>
                                    <p><strong>Beds:</strong> {details.beds}</p>
                                    <p><strong>View:</strong> {details.view}</p>
                                    <p><strong>Room Size:</strong> {details.size}</p>
                                    <p><strong>Occupancy:</strong> {details.occupancy}</p>
                                    <button className="read-more" onClick={() => openPopup(key)}>
                                        Read More
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Popup */}
            {selectedRoom && (
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closePopup}>X</button>
                        <h2>{room_details[selectedRoom].name}</h2>
                        <div className="popup-container">
                            <div className="popup-column amenities">
                                <h3>Amenities</h3>
                                {Object.keys(room_amenities).map((category) => (
                                    <div key={category} className="amenity-category">
                                        <h4>{category}</h4>
                                        <ul>
                                            {room_amenities[category].map((amenity) => (
                                                <li key={amenity}>{amenity}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            {lounge_access[selectedRoom] && (
                                <div className="popup-column lounge-access">
                                    <h3>Club Lounge Benefits</h3>
                                    <ul>
                                        {lounge_benefits.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

export default Room;
