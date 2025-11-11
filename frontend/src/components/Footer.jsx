import React from "react";
import "../ui/Footer.css";
import { Link, useNavigate } from "react-router-dom";

export default function Footer() {
    const navigate = useNavigate();

    // --- Scroll within the same page ---
    const scrollToId = (id) => {
        const el = document.getElementById(id);
        if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // --- Go to a section (or navigate home first if not on /) ---
    const go = (id) => {
        // นอก home
        if (id === "booking" || id === "room" || id === "facilities") {
            navigate(`/${id}`);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } 
        else {
            if (location.pathname === "/") {
            scrollToId(id);
            } else {
            navigate("/", { state: { targetId: id } });
            }
        }
    };

    return (
        <footer className="footer">
        <div className="footer-container">

            {/* Contact Information */}
            <div className="footer-section">
            <h3 className="footer-title">Contact Information</h3>
            <p className="footer-text hotel-name">Hotel Room Reservation System</p>
            <p className="footer-text">99 Moo 18, Km. 41 on Paholyothin Highway Khlong Luang, Pathum Thani 12120, Thailand</p>
            <p className="footer-text">Tel: +66 2 123 4567</p>
            <p className="footer-text">Email: info@hotelroomreservationsystem.com</p>
            <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
            >
                Get Directions
            </a>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-list">
                <li>
                    <div className="footer-link" onClick={() => go("home")}>
                        Home
                    </div>
                </li>
                <li>
                    <div className="footer-link" onClick={() => go("booking")}>
                        Book Now
                    </div>
                </li>
                <li>
                    <div className="footer-link" onClick={() => go("room")}>
                        Rooms & Suites
                    </div>
                </li>
                <li>
                    <div className="footer-link" onClick={() => go("facilities")}>
                        Facilities
                    </div>
                </li>
                <li>
                    <div className="footer-link" onClick={() => go("reviews")}>
                        Reviews
                    </div>
                </li>
            </ul>
            </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
            © 2025 Hotel Room Reservation System. All rights reserved.
        </div>
        </footer>
    );
}
