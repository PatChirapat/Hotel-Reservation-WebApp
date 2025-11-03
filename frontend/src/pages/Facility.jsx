import React from 'react';
import "../ui/Facility.css";

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Facility() {

    const facility_list = {
        dining1: [
            "images/facility/proj_facility_dining1.jpg",
            "images/facility/proj_facility_dining2.jpg",
            "images/facility/proj_facility_dining3.jpg",
    ],
        dining2: [
            "images/facility/proj_facility_dining4.jpg",
            "images/facility/proj_facility_dining5.jpg",
            "images/facility/proj_facility_dining6.jpg",
        ],
        lounge: [
            "images/facility/proj_facility_lounge1.jpg",
            "images/facility/proj_facility_lounge2.jpg",
            "images/facility/proj_facility_lounge3.jpg",
        ],
        bar: [
            "images/facility/proj_facility_bar1.jpg",
            "images/facility/proj_facility_bar2.jpg",
            "images/facility/proj_facility_bar3.jpg",
        ],  
        fitness: [
            "images/facility/proj_facility_fitness.jpeg",
        ],
        spa: [
            "images/facility/proj_facility_spa1.jpg",
            "images/facility/proj_facility_spa2.jpg",
            "images/facility/proj_facility_spa3.jpg",
        ],
        pool: [
            "images/facility/proj_facility_swimming.jpeg",
        ],
    };

    const facility_details = {
        dining1: {
            name: "Cantonese Cuisine",
            description: "Indulge in authentic Cantonese flavors at our elegant Cantonese Cuisine restaurant, where traditional recipes are brought to life with fresh ingredients and expert culinary techniques, creating a memorable dining experience."
        },
        dining2: {
            name: "French Bistro",
            description: "Savor the taste of France at our French Bistro, our charming restaurant offering a delightful menu of classic French dishes, paired with an extensive wine selection in a cozy and inviting atmosphere."
        },
        lounge: {
            name: "The Lounge",
            description: "Relax and unwind at The Lounge, our stylish space offering a selection of premium teas, coffees, and light refreshments, perfect for casual meetings or a quiet moment away from the hustle and bustle."
        },
        bar: {
            name: "BKK Soulcial Club",
            description: "Experience the vibrant nightlife of Bangkok at BKK Soulcial Club, our rooftop bar offering panoramic city views, signature cocktails, and a lively atmosphere perfect for socializing and unwinding."
        },
        fitness: {
            name: "Fitness Centre",
            description: "Stay active during your stay at our state-of-the-art Fitness Centre, equipped with the latest cardio and strength training equipment, personal training services, and wellness programs to help you maintain your fitness routine."
        },
        spa: {
            name: "Spa",
            description: "Rejuvenate your body and mind at our luxurious Spa, featuring a range of treatments inspired by traditional Thai wellness practices, designed to provide ultimate relaxation and revitalization."
        },
        pool: {
            name: "Swimming Pool",
            description: "Take a refreshing dip in our rooftop Swimming Pool, offering stunning views of the Bangkok skyline, comfortable loungers, and a serene atmosphere for relaxation and leisure."
        },
    };

    const [currentImages, setCurrentImages] = React.useState({
        bar: 0,
        dining1: 0,
        dining2: 0,
        fitness: 0,
        lounge: 0,
        spa: 0,
        pool: 0,
    });

    const handleImageChange = (room, index) => {
        setCurrentImages(prev => ({ ...prev, [room]: index }));
    };

    return (
        <div >
            <Navbar />  
            <div className="facility">
                <h1>Explore Our Facilities & Wellness Spaces</h1>
                <h2>Where Modern Design Meets Timeless Comfort</h2>
                <p>Immerse yourself in sophisticated spaces that reflect the spirit of Bangkok City — enjoy a relaxing spa experience,<br />
                    stay active in the fitness centre, or take in city views from our poolside bar and lounge. <br />
                    Each detail is crafted to elevate your urban escape with understated elegance.
                </p>
                <div className="facility-list">
                    {Object.keys(facility_list).map((facilityKey,i) => {
                        const detail = facility_details[facilityKey];
                        const images = facility_list[facilityKey];
                        const imgIndex = currentImages[facilityKey];
                        return (
                            <div 
                            className="facility-item" 
                            id={detail.name.replace(/\s+/g, '').toLowerCase()}
                            key={facilityKey}
                            >
                                <div className="facility-image-container">
                                    <img src={images[imgIndex]} alt={detail.name} className="facility-image" />
                                    <div className="image-dots">
                                        {images.map((_, index) => (
                                            <span
                                                key={index}
                                                className={imgIndex === index ? "active" : ""}
                                                onClick={() => handleImageChange(facilityKey, index)}
                                            ></span>
                                        ))}
                                    </div>
                                </div>
                                <div className="facility-info">
                                    <h3>{detail.name}</h3>
                                    <p>{detail.description}</p>
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

export default Facility;