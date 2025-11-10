import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../utils/api";
import "../ui/AdminBooking.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function AdminBooking() {
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

    const AddIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );

    // view
    const [bookings, setBookings] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState("");

    // edit
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [editField, setEditField] = useState("");
    const [newValue, setNewValue] = useState("");

    // add
    const [showAddModal, setShowAddModal] = useState(false);
    const [members, setMembers] = useState([]);
    const [newBooking, setNewBooking] = useState({
        member_id: "",
        room_type_id: "",
        checkin_date: "",
        checkout_date: "",
        guest_count: "",
        booking_status: "Pending",
    });

    // delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);

    const fetchMembers = async () => {
        try {
            const res = await axios.get(apiUrl("Admin/viewUser.php"));
            setMembers(res.data);
        } catch (err) {
            console.error("Error fetching members:", err);
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        console.log("Sending payload:", newBooking);
        try {
            const res = await axios.post(apiUrl("Admin/addBooking.php"), newBooking);
            console.log("Response:", res.data);
            if (res.data.success) {
                setToastMessage("Booking added successfully!");
                fetchBooking();
            } else {
                setToastMessage("Failed to add booking.");
            }
        } catch (err) {
            console.error(err);
            setToastMessage("Error adding booking.");
        } finally {
            setShowAddModal(false);
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    const fetchBooking = async () => {
        try {
            const res = await axios.get(apiUrl("Admin/viewBooking.php"));
            setBookings(res.data);
            setFilteredBookings(res.data);
        } catch (err) {
            console.error("Error fetching Booking:", err);
            setError("Failed to fetch Bookings");
        } 
        finally {
            setLoading(false);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const res = await axios.get(apiUrl("Admin/viewRoomType.php"));
            setRoomTypes(res.data);
        } 
        catch (err) {
            console.error("Error fetching room types:", err);
        }
    };

    const getNights = (checkin, checkout) => {
        const inDate = new Date(checkin);
        const outDate = new Date(checkout);
        const diffTime = outDate - inDate;
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights : 0;
    };

    const getTotalPrice = (basePrice, checkin, checkout) => {
        const nights = getNights(checkin, checkout);
        return basePrice * nights;
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        setFilteredBookings(
        bookings.filter((b) =>
            b.username.toLowerCase().includes(value) ||
            b.first_name.toLowerCase().includes(value) ||
            b.last_name.toLowerCase().includes(value) ||
            b.name.toLowerCase().includes(value) ||
            b.status.toLowerCase().includes(value)
        )
        );
    };

    const handleEditClick = (booking) => {
        setSelectedBooking(booking);
        setEditField("");
        setNewValue("");
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editField) return;

        try {const payload = {
            booking_id: selectedBooking.booking_id,
            field: editField,
            new_value: newValue,
            };

            const res = await axios.post(apiUrl("Admin/editBooking.php"), payload);
            if (res.data.success) {
                setToastMessage("Booking updated successfully!");
                fetchBooking();
            } 
            else {
                setToastMessage("Failed to update booking.");
            }
        } 
        catch (err) {
            console.error(err);
            setToastMessage("Error updating booking.");
        } finally {
            setShowEditModal(false);
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    const handleDeleteClick = (booking) => {
        setBookingToDelete(booking);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await axios.post(apiUrl("Admin/deleteBooking.php"), {
                booking_id: bookingToDelete.booking_id,
            });

            if (res.data.success) {
                setToastMessage(`Deleted booking of ${bookingToDelete.username} successfully!`);
                fetchBooking();
            } 
            else {
                setToastMessage("Failed to delete booking.");
            }
        } 
        catch (err) {
            console.error(err);
            setToastMessage("Error deleting booking.");
        } 
        finally {
            setShowDeleteModal(false);
            setTimeout(() => setToastMessage(""), 3000);
        }
    };


    useEffect(() => {
        fetchBooking();
        fetchRoomTypes();
        fetchMembers();
    }, []);

    return (
        <div className="admin-booking">
        <Navbar />

        {loading && (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading bookings...</p>
            </div>
        )}

        {toastMessage && <div className="toast-message">{toastMessage}</div>}

        <div className="admin-booking-content">
            <div className="admin-booking-header">
                <h1>Hotel Booking Dashboard</h1>
                <p>Keep track of your hotel's bookings with simple and powerful management tools.</p>
            </div>

            <div className="admin-booking-controls">
                <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
                <button className="add-btn" onClick={() => setShowAddModal(true)}>{AddIcon} ADD BOOKING</button>
            </div>

            {error && <p className="error-message">{error}</p>}

            <table className="booking-table">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Room Type</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Nights</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                </tr>
            </thead>
                <tbody>
                    {filteredBookings.length > 0 ? (
                    filteredBookings.map((b) => {
                        const nights = getNights(b.checkin, b.checkout);
                        const totalPrice = getTotalPrice(b.base_price, b.checkin, b.checkout);
                        return (
                        <tr key={b.booking_id}>
                            <td>{b.first_name} {b.last_name}</td>
                            <td>{b.name}</td>
                            <td>{b.checkin}</td>
                            <td>{b.checkout}</td>
                            <td>{nights}</td>
                            <td>{b.guest}</td>
                            <td>{b.status}</td>
                            <td>{totalPrice}</td>
                            <td className="actions">
                                <button className="edit-btn" onClick={() => handleEditClick(b)}>{EditIcon}</button>
                                <button className="delete-btn" onClick={() => handleDeleteClick(b)}>{DeleteIcon}</button>
                            </td>
                        </tr>
                        );
                    })
                    ) : (
                    <tr><td colSpan="9">No bookings found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Add Pop-up */}
        {showAddModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add New Booking</h2>
                <form onSubmit={handleAddSubmit} className="edit-form">

                <label>Member</label>
                <select
                value={newBooking.member_id}
                onChange={(e) => setNewBooking({ ...newBooking, member_id: e.target.value })}
                required
                >
                <option value="">-- Select Member --</option>
                {members.map((m) => (
                    <option key={m.member_id} value={m.member_id}>
                    {m.member_id} - {m.first_name} {m.last_name}
                    </option>
                ))}
                </select>

                <label>Room Type</label>
                    <select
                    value={newBooking.room_type_id}
                    onChange={(e) => setNewBooking({ ...newBooking, room_type_id: e.target.value })}
                    required
                    >
                    <option value="">-- Select Room Type --</option>
                    {roomTypes.map((r) => (
                        <option key={r.room_type_id} value={r.room_type_id}>
                        {r.name}
                        </option>
                    ))}
                    </select>

                    <label>Check-In</label>
                    <input
                    type="date"
                    value={newBooking.checkin_date}
                    onChange={(e) => setNewBooking({ ...newBooking, checkin_date: e.target.value })}
                    required
                    />

                    <label>Check-Out</label>
                    <input
                    type="date"
                    value={newBooking.checkout_date}
                    onChange={(e) => setNewBooking({ ...newBooking, checkout_date: e.target.value })}
                    required
                    />

                    <label>Guest Count</label>
                    <input
                    type="number"
                    min="1"
                    value={newBooking.guest_count}
                    onChange={(e) => setNewBooking({ ...newBooking, guest_count: e.target.value })}
                    required
                    />

                    <label>Status</label>
                    <select
                    value={newBooking.booking_status}
                    onChange={(e) => setNewBooking({ ...newBooking, booking_status: e.target.value })}
                    required
                    >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                    </select>

                    <div className="modal-buttons">
                        <button type="submit" className="save-btn">Add</button>
                        <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
        )}

        {/* Edit Pop-up */}
        {showEditModal && selectedBooking && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Edit Booking (ID: {selectedBooking.booking_id})</h2>

                    <form onSubmit={handleEditSubmit} className="edit-form">
                    <label>Select field to edit</label>
                    <select value={editField} onChange={(e) => setEditField(e.target.value)} required>
                        <option value="">-- Select field --</option>
                        <option value="room_type_id">Room Type</option>
                        <option value="checkin_date">Check-In Date</option>
                        <option value="checkout_date">Check-Out Date</option>
                        <option value="guest_count">Guest Count</option>
                        <option value="booking_status">Booking Status</option>
                    </select>

                    {editField && (
                        <>
                        <label>Old Value</label>
                        <input
                            type="text"
                            value={
                            editField === "checkin_date" ? selectedBooking.checkin :
                            editField === "checkout_date" ? selectedBooking.checkout :
                            editField === "guest_count" ? selectedBooking.guest :
                            editField === "booking_status" ? selectedBooking.status :
                            editField === "room_type_id" ? selectedBooking.name :
                            ""
                            }
                            readOnly
                        />

                        <label>New Value</label>
                        {editField === "booking_status" ? (
                            <select value={newValue} onChange={(e) => setNewValue(e.target.value)} required>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                            </select>
                        ) : editField === "room_type_id" ? (
                            <select value={newValue} onChange={(e) => setNewValue(e.target.value)} required>
                            <option value="">-- Select Room Type --</option>
                            {roomTypes.map((r) => (
                                <option key={r.room_type_id} value={r.room_type_id}>
                                {r.name}
                                </option>
                            ))}
                            </select>
                        ) : (
                            <input
                            type={editField.includes("date") ? "date" : "text"}
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            required
                            />
                        )}
                        </>
                    )}

                    <div className="modal-buttons">
                        <button type="submit" className="save-btn">Save</button>
                        <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                    </div>
                    </form>
                </div>
            </div>
        )}

        {/* Delete Pop-up */}
        {showDeleteModal && bookingToDelete && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirm Deletion</h2>
                <p>
                    Are you sure you want to delete the booking of{" "}
                    <strong>{bookingToDelete.username}</strong>?
                </p>

                <div className="modal-buttons">
                    <button className="save-btn" onClick={handleDeleteConfirm}>
                        Confirm Delete
                    </button>
                    <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
        )}

        <Footer />
        </div>
    );
}

export default AdminBooking;
