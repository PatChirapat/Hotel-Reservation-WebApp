import React, { useState, useEffect } from "react";
import "../ui/FacilityComp.css";
import { HashLink } from "react-router-hash-link";


const facilities = [
    { name: "Cantonese Cuisine", img: "/images/facility/proj_facility_dining1.jpg" },
    { name: "French Bistro", img: "/images/facility/proj_facility_dining4.jpg" },
    { name: "The Lounge", img: "/images/facility/proj_facility_lounge1.jpg" },
    { name: "BKK Soulcial Club", img: "/images/facility/proj_facility_bar1.jpg" },
    { name: "Fitness", img: "/images/facility/proj_facility_fitness.jpeg" },
    { name: "Spa", img: "/images/facility/proj_facility_spa.jpeg" },
    { name: "Swimming Pool", img: "/images/facility/proj_facility_swimming.jpeg" },
];

function FacilityComp() {
    const [startIndex, setStartIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
            setStartIndex((prevIndex) => (prevIndex + 3) % facilities.length);
            setFade(true); 
        }, 500);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const visibleFacilities = [
        facilities[startIndex],
        facilities[(startIndex + 1) % facilities.length],
        facilities[(startIndex + 2) % facilities.length],
    ];

    return (
        <div className="facility-section">
        <h2 className="facility-title">Facilities</h2>
        <div className={`facility-comp ${fade ? "fade-in" : "fade-out"}`}>
            {visibleFacilities.map((facility, index) => (
            <div key={index} className="facility-card">
                <img src={facility.img} alt={facility.name} />
                <div className="facility-overlay">
                <h3>{facility.name}</h3>
                <button className="learn-more">
                    <HashLink smooth to={`/facilities#${facility.name.replace(/\s+/g, '').toLowerCase()}`}>
                        Learn More
                    </HashLink>
                </button>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
    }

export default FacilityComp;
