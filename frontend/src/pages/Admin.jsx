import React from "react";
import "../ui/Admin.css";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function Admin(){
    const admin_links = [
        { key: "adminUser", name: "User Management", description: "Manage user accounts" },
        { key: "adminRoom", name: "Room Management", description: "Add, update, or remove rooms from the system." },
        { key: "adminBooking", name: "Booking Management", description: "View and manage all bookings made by users." },
    ];

    return (
        <div className="admin">
            <Navbar />
            <div className="admin-content">
                <div className="admin-header">
                    <h1>Dashboard</h1>
                </div>
                <div className="admin-body">
                    <div className="admin-user-management">
                        <div className="admin-user-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor" 
                            className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" 
                                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 
                                4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 
                                19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 
                                6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 
                                2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                        </div>
                        <div className="admin-user-txt">
                            <h1>{admin_links[0].name}</h1>
                            <p>{admin_links[0].description}</p>
                        </div>
                        <button className="admin-link-btn">
                            <Link to="/admin/users" className="admin-link">Manage Users</Link>
                        </button>
                    </div>


                    <div className="admin-room-management">
                        <div className="admin-room-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor" 
                            className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" 
                                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 
                                3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                            </svg>
                        </div>
                        <div className="admin-room-txt">
                            <h1>{admin_links[1].name}</h1>
                            <p>{admin_links[1].description}</p>
                        </div>
                        <button className="admin-link-btn">
                            <Link to="/admin/rooms" className="admin-link">Manage Rooms</Link>
                        </button>
                    </div>


                    <div className="admin-booking-management">
                        <div className="admin-booking-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor" 
                            className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" 
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 
                                7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 
                                0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                        </div>
                        <div className="admin-booking-txt">
                            <h1>{admin_links[2].name}</h1>
                            <p>{admin_links[2].description}</p>
                        </div>
                        <button className="admin-link-btn">
                            <Link to="/admin/bookings" className="admin-link">Manage Bookings</Link>
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Admin;