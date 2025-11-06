import React from "react";
import "../ui/Footer.css";

export default function Footer() {
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
                <li><a href="#" className="footer-link">Home</a></li>
                <li><a href="#" className="footer-link">Rooms & Suites</a></li>
                <li><a href="#" className="footer-link">Book Now</a></li>
                <li><a href="#" className="footer-link">Facilities</a></li>
                <li><a href="#" className="footer-link">Reviews</a></li>
                <li><a href="#" className="footer-link">Contact Us</a></li>
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
