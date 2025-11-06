import React from "react";

import "../ui/AdminBooking.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function AdminBooking(){
    return (
        <div className="adminbooking">
            <Navbar />
            <h1>Admin Booking Management Page</h1>
            <Footer />
        </div>
    );
}

export default AdminBooking;