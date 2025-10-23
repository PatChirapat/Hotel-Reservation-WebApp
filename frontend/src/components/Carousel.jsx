import React, { useState, useEffect, useRef } from "react";
import "../ui/Carousel.css";

const images = [
    "/images/home/proj_home1.jpeg",
    "/images/home/proj_home2.jpeg",
    "/images/home/proj_home3.jpeg",
    "/images/home/proj_home4.jpeg"
];

// ภาพแรกไว้ท้าย ภาพท้ายไว้หน้า
const loopImages = [images[images.length - 1], ...images, images[0]];

function Carousel() {
    const [current, setCurrent] = useState(1); // index 1 = ภาพจริงภาพแรก
    const [transition, setTransition] = useState(true);
    const intervalRef = useRef(null);

    const nextSlide = () => setCurrent((prev) => prev + 1);
    const prevSlide = () => setCurrent((prev) => prev - 1);

    // auto slide
    useEffect(() => {
        intervalRef.current = setInterval(nextSlide, 3000);
        return () => clearInterval(intervalRef.current);
    }, []);

    // handle การเลื่อนไป-กลับแบบ seamless ด้วย onTransitionEnd
    const handleTransitionEnd = () => {
        if (current === loopImages.length - 1) {
        setTransition(false);
        setCurrent(1); // กลับไปภาพแรกจริงๆ
        } else if (current === 0) {
        setTransition(false);
        setCurrent(loopImages.length - 2); // กลับไปภาพสุดท้ายจริง
        }
    };

    // เมื่อ current เปลี่ยน 
    useEffect(() => {
        if (!transition) {
        requestAnimationFrame(() => setTransition(true));
        }
    }, [transition]);

    return (
        <div className="carousel">
        <button className="arrow left" onClick={prevSlide}>
            &lt;
        </button>

        <div
            className="carousel-inner"
            style={{
            transform: `translateX(-${current * 100}%)`,
            transition: transition ? "transform 2.4s ease-in-out" : "none"
            }}
            onTransitionEnd={handleTransitionEnd}
        >
            {loopImages.map((img, index) => (
            <div key={index} className="carousel-item">
                <img src={img} alt={`slide-${index}`} />
            </div>
            ))}
        </div>

        <button className="arrow right" onClick={nextSlide}>
            &gt;
        </button>
        </div>
    );
}

export default Carousel;