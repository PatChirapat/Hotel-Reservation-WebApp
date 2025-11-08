import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../ui/BookingConfirmation.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import axios from "axios";

function BookingConfirmation() {
  const location = useLocation();
  console.log("📨 BookingConfirmation received state:", location.state);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 รับ booking_ids จาก Booking.jsx
  const booking_ids = location.state?.booking_ids || [];
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {

    console.log("📨 Received booking_ids:", booking_ids);
    console.log("📤 Sending booking_ids to backend:", booking_ids);
    
    const fetchBookings = async () => {
      try {
        if (!booking_ids || booking_ids.length === 0) {
          alert("❌ Missing booking IDs (please book first)");
          return;
        }

        // ✅ ดึงข้อมูลทั้งหมดจาก backend (ส่ง array booking_ids)
        const res = await axios.post(
          `${apiBase}/Booking/viewBooking.php`,
          { booking_ids },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("📥 Bookings fetched:", res.data);

        if (res.data.success) {
          setBookings(res.data.bookings);
        } else {
          alert("⚠️ " + res.data.message);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        alert("❌ Failed to fetch booking data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [booking_ids]);

  // 🟩 อัปเดต booking เดี่ยว
  const handleUpdate = async (booking) => {
    try {
      const response = await axios.post(
        `${apiBase}/Booking/updateBooking.php`,
        booking,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        alert(`✅ Booking #${booking.booking_id} updated successfully!`);
      } else {
        alert("⚠️ Update failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("❌ Error connecting to backend.");
    }
  };

  // 🟥 ลบ booking เดี่ยว
  const handleDelete = async (booking_id) => {
    if (!window.confirm(`Are you sure you want to delete booking #${booking_id}?`)) return;

    try {
      const response = await axios.post(
        `${apiBase}/Booking/deleteBooking.php`,
        { booking_id },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        alert(`🗑️ Booking #${booking_id} deleted successfully!`);
        setBookings((prev) => prev.filter((b) => b.booking_id !== booking_id));
      } else {
        alert("⚠️ Failed to delete booking.");
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert("❌ Error connecting to backend.");
    }
  };

  if (loading) return <p>Loading booking data...</p>;
  if (!bookings || bookings.length === 0) return <p>No booking found.</p>;

  const EditIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );

  const DeleteIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );

  return (
    <div className="booking-confirmation-page">
      <Navbar />
      <div className="booking-confirmation-content">
        <div className="booking-header">
          <h1>Booking Confirmation</h1>
          <p>Review and manage your booking details.</p>
        </div>

        <div className="booking-confirmation-body">
          <table className="booking-confirmation-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Room Type</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.booking_id}>
                  <td>{b.booking_id}</td>
                  <td>{b.room_type_name}</td>
                  <td>{b.checkin_date}</td>
                  <td>{b.checkout_date}</td>
                  <td>{b.guest_count}</td>
                  <td>{b.booking_status}</td>
                  <td>{b.subtotal_amount}</td>
                  <td>{b.discount_amount}</td>
                  <td>{b.total_amount}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => handleUpdate(b)}>{EditIcon}</button>
                    <button className="delete-btn" onClick={() => handleDelete(b.booking_id)}>{DeleteIcon}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="booking-confirmation-button">
            <button
              className="save-btn"
              onClick={() => bookings.forEach((b) => handleUpdate(b))}
            >
              Update All
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BookingConfirmation;
