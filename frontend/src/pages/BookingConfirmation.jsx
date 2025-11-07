import React, { useState } from "react";
import "../ui/BookingConfirmation.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import axios from "axios";

function BookingConfirmation() {
  const [bookingData, setBookingData] = useState({
    booking_id: 1, // example — replace dynamically later
    checkin_date: "2025-11-10",
    checkout_date: "2025-11-12",
    guest_count: 2,
    booking_status: "Confirmed",
    subtotal_amount: 3000,
    discount_amount: 200,
    total_amount: 200,
  });

  const apiBase = "http://localhost:8888/Hotel-Reservation-WebApp/backend"; // ✅ แก้ path ให้ตรงกับของคุณ

  const handleUpdate = async () => {
    try {
      const response = await axios.post(`${apiBase}/Booking/updateBooking.php`,
        bookingData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        alert("✅ Booking updated successfully!");
      } else {
        alert("⚠️ Update failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("❌ Error connecting to backend.");
    }
  };

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
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{bookingData.booking_id}</td>
                <td>{bookingData.checkin_date}</td>
                <td>{bookingData.checkout_date}</td>
                <td>{bookingData.guest_count}</td>
                <td>{bookingData.booking_status}</td>
                <td>{bookingData.subtotal_amount}</td>
                <td>{bookingData.discount_amount}</td>
                <td>{bookingData.total_amount}</td>
              </tr>
            </tbody>
          </table>

          <div className="booking-confirmation-button">
            <button className="Up-button" onClick={handleUpdate}>
              Update
            </button>
            <button className="Del-button">Delete</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BookingConfirmation;
