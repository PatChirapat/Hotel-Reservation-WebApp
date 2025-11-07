import React from "react";
import { useLocation } from "react-router-dom";
import "../ui/BookingConfirmation.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import axios from "axios";

function BookingConfirmation() {
    return (
        <div className="booking-confirmation-page">
                <Navbar />
                <div className="booking-confirmation-content">
                    <h1>Booking Confirmation</h1>
                    <p className="booking-desc">Select Your Confirmation.</p>
                    <div className="booking-confirmation-body">
                        <table className="booking-confirmation-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Tier</th>
                                    <th>Join Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            {/* <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.member_id}>
                                        <td>{user.member_id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.first_name}</td>
                                        <td>{user.last_name}</td>
                                        <td>{user.phone}</td>
                                        <td>{user.email}</td>
                                        <td>{user.tier}</td>
                                        <td>{user.join_date}</td>
                                        <td className="actions">
                                            <button className="edit-btn" onClick={() => handleEditClick(user)}>{EditIcon}</button>
                                            <button className="delete-btn">{DeleteIcon}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody> */}
                        </table>
                    </div>
                </div>
                
                <Footer />

        </div>
    );
}

 




export default BookingConfirmation;
