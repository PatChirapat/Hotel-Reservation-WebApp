import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../ui/BookingConfirmation.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import axios from "axios";
import { apiUrl, getApiBase } from "../utils/api";

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const memberId = currentUser?.member_id || null;
  console.log("📨 BookingConfirmation received state:", location.state);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 คำนวณจำนวนคืน (night count)
  const calculateNights = (checkin, checkout) => {
    const inDate = new Date(checkin);
    const outDate = new Date(checkout);
    const diffTime = outDate - inDate;
    const nights = Math.max(1, diffTime / (1000 * 60 * 60 * 24));
    return nights;
  };

  // 🔹 คำนวณ subtotal/total ใหม่
  const recalculatePrice = (booking) => {
    const nights = calculateNights(booking.checkin_date, booking.checkout_date);
    const roomPrice = roomPrices[booking.room_type_id] || 0;
    const subtotal = roomPrice * nights;
    const total = subtotal - (booking.discount_amount || 0);
    return { subtotal, total };
  };


  // 🟦 สำหรับ modal edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editField, setEditField] = useState("");
  const [newValue, setNewValue] = useState("");

    // 💰 Room price mapping
  const roomPrices = {
    1: 3200, // Classic
    2: 4200, // Premier
    3: 5600, // Executive
    4: 7800, // Diplomatic
    5: 9900, // Royal
  };



  // 🟢 รับ booking_ids จาก Booking.jsx
  const booking_ids = location.state?.booking_ids || [];
  const apiBase = getApiBase();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Build payload: prefer booking_ids from navigation state; otherwise use signed-in memberId
        let payload = null;
        if (Array.isArray(booking_ids) && booking_ids.length > 0) {
          payload = { booking_ids };
        } else if (memberId) {
          payload = { member_id: memberId };
        } else {
          alert("Please sign in first");
          setLoading(false);
          return;
        }

        console.log("📤 Fetching bookings with payload:", payload);
        const res = await axios.post(
          apiUrl("Booking/viewBooking.php"),
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("📥 Bookings fetched:", res.data);
        if (res.data?.success) {
          setBookings(Array.isArray(res.data.bookings) ? res.data.bookings : []);
        } else {
          alert(res.data?.message || "Failed to load bookings");
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        alert("❌ Failed to fetch booking data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, memberId, JSON.stringify(booking_ids)]);

  // 🟩 อัปเดต booking เดี่ยว
  const handleUpdate = async (booking) => {
    try {
      const response = await axios.post(
        apiUrl("Booking/updateBooking.php"),
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
        apiUrl("Booking/deleteBooking.php"),
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

  const handleWriteReview = (booking) => {
    if (!memberId) {
      alert("Please sign in before writing a review.");
      navigate("/signin");
      return;
    }
    if (!booking?.booking_id) {
      alert("Booking information is missing.");
      return;
    }

    navigate("/reviews/new", {
      state: {
        booking_id: booking.booking_id,
        room_type_id: booking.room_type_id,
        room_type_name: booking.room_type_name,
      },
    });
  };

  const handleGoToPayment = (booking) => {
    if (!booking?.booking_id) return;
    if (!memberId) {
      alert("Please sign in to manage payments.");
      navigate("/signin");
      return;
    }

    navigate("/payment", {
      state: {
        booking_id: booking.booking_id,
        booking,
      },
    });
  };

  const handleViewPdf = (booking) => {
    if (!booking?.booking_id) return;

    navigate("/ConfirmBooking", {
      state: {
        booking_id: booking.booking_id,
        booking,
      },
    });
  };

    if (loading) return <p>Loading booking data...</p>;

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
    //Edit each Room
    const handleEditClick = (booking) => {
      setSelectedBooking(booking);
      setEditField("");
      setNewValue("");
      setShowEditModal(true);
    };

    const handleFieldChange = (e) => {
      const field = e.target.value;
      setEditField(field);
      setNewValue(selectedBooking ? selectedBooking[field] || "" : "");
    };

    const handleEditSubmit = async (e) => {
      e.preventDefault();

      if (!editField) {
        alert("⚠️ Please select a field to edit.");
        return;
      }

      try {
        // 🟢 สร้าง booking object ใหม่ที่อัปเดตแล้ว
        let updatedBooking = {
          ...selectedBooking,
          [editField]: newValue,
        };

        // ถ้าเปลี่ยน field ที่เกี่ยวกับราคา → recalculates
        if (
          editField === "room_type_id" ||
          editField === "checkin_date" ||
          editField === "checkout_date"
        ) {
          const { subtotal, total } = recalculatePrice(updatedBooking);
          updatedBooking = {
            ...updatedBooking,
            subtotal_amount: subtotal,
            total_amount: total,
          };
        }

        // 🔹 ส่งข้อมูลอัปเดตไป backend
        const res = await axios.post(apiUrl("Booking/updateBooking.php"), updatedBooking);

        if (res.data.success) {
          alert(`✅ Booking #${selectedBooking.booking_id} updated successfully!`);

          setShowEditModal(false);

          // 🔹 อัปเดต state ทันที (ให้ราคาปรับ dynamic)
          setBookings((prev) =>
            prev.map((b) =>
              b.booking_id === selectedBooking.booking_id ? updatedBooking : b
            )
          );
        } else {
          alert("❌ Update failed: " + res.data.message);
        }
      } catch (err) {
        console.error("Error updating booking:", err);
        alert("❌ Error connecting to backend.");
      }
    };


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
                <th>Payment Status</th>
                <th>Pay</th>
                <th>Summary</th>
                <th>Review</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => {
                  const paymentStatusRaw = String(
                    b.payment_status || b.booking_status || ""
                  ).trim();
                  const paymentStatus = paymentStatusRaw.toUpperCase();
                  const statusClass = paymentStatus
                    ? paymentStatus.replace(/\s+/g, "-").toLowerCase()
                    : "pending";
                  const canViewPdf = paymentStatus === "CONFIRMED";

                  return (
                    <tr key={b.booking_id}>
                      <td>{b.booking_id}</td>
                      <td>{b.room_type_name}</td>
                      <td>{b.checkin_date}</td>
                      <td>{b.checkout_date}</td>
                      <td>{b.guest_count}</td>
                      <td>{b.booking_status}</td>
                      <td>{Number(b.subtotal_amount).toLocaleString()}</td>
                      <td>{Number(b.discount_amount).toLocaleString()}</td>
                      <td>
                        <strong>{Number(b.total_amount).toLocaleString()}</strong>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>
                          {paymentStatus || "PENDING"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="payment-btn"
                          onClick={() => handleGoToPayment(b)}
                        >
                          {canViewPdf ? "Manage" : "Pay Now"}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="pdf-btn"
                          onClick={() => handleViewPdf(b)}
                          disabled={!canViewPdf}
                          title={
                            canViewPdf
                              ? "View booking PDF"
                              : "Available once payment is confirmed"
                          }
                        >
                          View PDF
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="review-btn"
                          onClick={() => handleWriteReview(b)}
                        >
                          Write Review
                        </button>
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => handleEditClick(b)}
                        >
                          {EditIcon}
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDelete(b.booking_id)}
                        >
                          {DeleteIcon}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                // 🔹 ถ้าลบหมดแล้ว ให้ขึ้นข้อความสวย ๆ แทน แต่ยังอยู่ในหน้าเดิม
                  <tr>
                    <td colSpan="14" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                      🗑️ All bookings have been deleted.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>

          <div className="booking-confirmation-button">
            {/* UpdateAll */}
            <button
              className="save-btn"
              onClick={() => bookings.forEach((b) => handleUpdate(b))}
            >
              Update All
            </button>
          </div>
        </div>
      </div>
        {/* modal */}
        {showEditModal && selectedBooking && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Booking #{selectedBooking.booking_id}</h2>
              <form onSubmit={handleEditSubmit} className="add-user-form">
                <label>Select field to edit</label>
                <select value={editField} onChange={handleFieldChange} required>
                  <option value="">-- Select field --</option>
                  <option value="room_type_id">Room Type</option>
                  <option value="checkin_date">Check-In Date</option>
                  <option value="checkout_date">Check-Out Date</option>
                  <option value="guest_count">Guests</option>
                </select>

                {editField && (
                  <>
                    <label>Old Value</label>
                    <input
                      type="text"
                      value={selectedBooking[editField] || ""}
                      readOnly
                    />

                    <label>New Value</label>

                    {editField === "room_type_id" ? (
                      <select
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        required
                      >
                        <option value="1">Classic</option>
                        <option value="2">Premier</option>
                        <option value="3">Executive</option>
                        <option value="4">Diplomatic</option>
                        <option value="5">Royal</option>
                      </select>
                    ) : editField.includes("date") ? (
                      <input
                        type="date"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        required
                      />
                    ) : (
                      <input
                        type="number"
                        min="1"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        required
                      />
                    )}
                  </>
                )}

                <div className="modal-buttons">
                  <button type="submit" className="save-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
            
      <Footer />
    </div>
  );
}

export default BookingConfirmation;
