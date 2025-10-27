import React, { useState } from 'react';
import '../ui/Room.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Room() {
    const room_list = {
        classic: [
            'images/rooms/proj_room_classic1.png',
            'images/rooms/proj_room_classic2.jpg',
            'images/rooms/proj_room_classic3.jpg'
        ],
        premier: [
            'images/rooms/proj_room_premier1.jpg',
            'images/rooms/proj_room_premier2.jpg',
            'images/rooms/proj_room_premier3.jpg'
        ],
        executive: [
            'images/rooms/proj_room_exec1.jpg',
            'images/rooms/proj_room_exec2.jpg',
            'images/rooms/proj_room_exec3.jpg'
        ],
        diplomatic: [
            'images/rooms/proj_room_diplomatic1.jpg',
            'images/rooms/proj_room_diplomatic2.jpg',
            'images/rooms/proj_room_diplomatic3.jpg',
            'images/rooms/proj_room_diplomatic4.jpg',
            'images/rooms/proj_room_diplomatic5.jpg',
            'images/rooms/proj_room_diplomatic6.jpg'
        ],
        royal: [
            'images/rooms/proj_room_royal1.jpg',
            'images/rooms/proj_room_royal2.jpg',
            'images/rooms/proj_room_royal3.jpg',
            'images/rooms/proj_room_royal4.jpg',
            'images/rooms/proj_room_royal5.jpg',
            'images/rooms/proj_room_royal6.jpg'
        ]
    };

    const room_details = {
        classic: {
            name: 'Classic Room',
            desc: 'A cozy retreat featuring a plush queen bed, modern decor, and warm lighting. Perfect for leisure or business travelers seeking comfort and convenience.',
            size: '70 sqm'
        },
        premier: {
            name: 'Premier Room',
            desc: 'Spacious and elegant with a king-sized bed, minibar, work desk, and city view. Designed for those who appreciate luxury and tranquility.',
            size: '80 sqm'
        },
        executive: {
            name: 'Executive Suite',
            desc: 'The Executive Suite includes a private king bedroom with a bathroom, a large tub, and a rain shower. A spacious living area with comfortable sofas and an adjacent guest bathroom. Access into the club lounge and benefits are included.',
            size: '100 sqm'
        },
        diplomatic: {
            name: 'Diplomatic Suite',
            desc: 'Containing an elegant 10-place dining room that doubles as a conference room suitable for VIP meetings and gatherings, Diplomatic Suite also has its own pantry equipped for the preparation and serving of in-room meals.',
            size: '150 sqm'
        },
        royal: {
            name: 'Royal Suite',
            desc: 'The ultimate level of luxury including club benefits. Grand master bedroom, dining area, private bar, and marble bathroom. Experience the finest comfort and elegance.',
            size: '250 sqm'
        }
    };

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
            <div className="room">
                <h1>Explore Our Hotel Rooms and Suites in Bangkok</h1>
                <h2>Luxury Accommodation in the City Centre</h2>
                <p>
                    Overlooking vibrant Bangkok city, our newly renovated rooms and suites offer
                    light-filled accommodation featuring pastel-hued silk embroidered bedheads
                    and custom-made furniture throughout. Wooden parquet floors and textured carpets
                    offer both hygiene and comfort, whilst bathrooms feature deep soaking tubs and
                    separate rain showers for ultimate relaxation. Handmade artwork showcases Thai
                    welcoming traditions of floating flowers that is featured across accommodation design.
                </p>
                <div className="room-list">
                    {Object.keys(room_list).map((key, i) => {
                        const details = room_details[key];
                        const images = room_list[key];
                        const imgIndex = currentImage[key];
                        const isEven = i % 2 === 0;
                        return (
                            <div key={key} className={`room-section ${isEven ? 'left-image' : 'right-image'}`}> 
                                <div className="room-image-container">
                                    <img
                                        src={images[imgIndex]}
                                        alt={details.name}
                                        className="room-image"
                                    />
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
                                    <p><strong>Size:</strong> {details.size}</p>
                                    <a href="#" className="read-more">Read More</a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        <Footer />
        </div>
    );
}

export default Room;
