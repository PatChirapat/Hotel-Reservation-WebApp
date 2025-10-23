import React from "react";
import "../ui/FacilityComp.css";

const facilities = [
    { name: "Fitness", img: "/images/facility/proj_facility_fitness.jpeg" },
    // { name: "Lounge", img: "/images/facility/proj_facility_lounge.jpeg" },
    { name: "Spa", img: "/images/facility/proj_facility_spa.jpeg" },
    { name: "Swimming Pool", img: "/images/facility/proj_facility_swimming.jpeg" },
];

function FacilityComp() {
    return (
        <div className="facility-section">
            <h2 className="facility-title">Facilities</h2>
            <div className="facility-comp">
                {facilities.map((facility, index) => (
                    <div key={index} className="facility-card">
                        <img src={facility.img} alt={facility.name} />
                        <div className="facility-overlay">
                            <h3>{facility.name}</h3>
                            <button className="learn-more">Learn more</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FacilityComp;
