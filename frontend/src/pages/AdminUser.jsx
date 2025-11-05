import React from "react";

import "../ui/AdminUser.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function AdminUser(){
    return (
        <div className="adminuser">
            <Navbar />
            <div className="adminuser-content">
                <h1>Admin User Management Page</h1>
            </div>
            <Footer />
        </div>
    );
}

export default AdminUser;