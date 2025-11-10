import React, { useState, useEffect } from "react";
import { Link, useLocation,useNavigate } from "react-router-dom";
import "../ui/Booking.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import axios from "axios";
import { apiUrl } from "../utils/api";

function Booking() {
    const location = useLocation();
    const today = new Date().toISOString().split("T")[0];
    const navigate = useNavigate();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const roomTypeMap = {
    classic: 1,
    premier: 2,
    executive: 3,
    diplomatic: 4,
    royal: 5,
    };

    // input from Bookingbar.jsx
    const {
        checkin: initCheckin = today,
        checkout: initCheckout = tomorrow,
        rooms: initRooms = 1,
        adults: initAdults = 1,
        children: initChildren = 0,
    } = location.state || {};

    const [checkin, setCheckin] = useState(initCheckin);
    const [checkout, setCheckout] = useState(initCheckout);
    const [adults, setAdults] = useState(initAdults);
    const [children, setChildren] = useState(initChildren);
    const totalGuests = adults + children;

    // from Room.jsx
    const room_details = {
        classic: {
        name: "Classic Room",
        desc: "A cozy retreat featuring a plush queen bed, modern decor, and warm lighting.",
        image: "images/rooms/proj_room_classic1.png",
        size: "70 sqm",
        occupancy: 2,
        price: 3200,
        },
        premier: {
        name: "Premier Room",
        desc: "Spacious and elegant with a king-sized bed and city view.",
        image: "images/rooms/proj_room_premier1.jpg",
        size: "80 sqm",
        occupancy: 3,
        price: 4200,
        },
        executive: {
        name: "Executive Suite",
        desc: "Private bedroom with a large tub and rain shower, plus lounge access.",
        image: "images/rooms/proj_room_exec1.jpg",
        size: "100 sqm",
        occupancy: 3,
        price: 5600,
        },
        diplomatic: {
        name: "Diplomatic Suite",
        desc: "10-place dining room, pantry, and exclusive lounge access.",
        image: "images/rooms/proj_room_diplomatic1.jpg",
        size: "150 sqm",
        occupancy: 3,
        price: 7800,
        },
        royal: {
        name: "Royal Suite",
        desc: "Ultimate luxury with dining area, private bar, and marble bathroom.",
        image: "images/rooms/proj_room_royal1.jpg",
        size: "250 sqm",
        occupancy: 3,
        price: 9900,
        },
    };

    // select room state
    const [selectedRooms, setSelectedRooms] = useState({});

    // toggle room selected
    const toggleRoom = (key) => {
        setSelectedRooms((prev) => {
        if (prev[key]) {
            const copy = { ...prev };
            delete copy[key];
            return copy;
        } else {
            return { ...prev, [key]: 1 }; // เริ่มจาก 1 ห้อง
        }
        });
    };

    // room count
    const updateRoomCount = (key, value) => {
        setSelectedRooms((prev) => ({
        ...prev,
        [key]: Math.max(1, Number(value)),
        }));
    };

    // guest count
    const totalCapacity = Object.entries(selectedRooms).reduce(
        (sum, [key, count]) => sum + room_details[key].occupancy * count,
        0
    );

    // night count
    const nights = Math.max(
        (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24),
        1
    );

    // sum price
    const totalPrice = Object.entries(selectedRooms).reduce(
        (sum, [key, count]) => sum + room_details[key].price * count,
        0
    ) * nights;

    // warning
    const [warning, setWarning] = useState("");

    useEffect(() => {
        if (totalGuests > totalCapacity && Object.keys(selectedRooms).length > 0) {
        setWarning("Please select more rooms to match the number of guests.");
        } else {
        setWarning("");
        }
    }, [totalGuests, totalCapacity, selectedRooms]);

    // Booking details to send to backend

    //booking confirm function
    const handleConfirm = async () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
        alert("⚠️ Please log in before making a booking.");
        navigate("/Signin");
        return;
        }

        if (Object.keys(selectedRooms).length === 0) {
        alert("⚠️ Please select at least one room before confirming.");
        return;
        }

        // 🟢 สร้าง array ของ bookings ทั้งหมด
        const bookings = [];
        for (const [roomKey, count] of Object.entries(selectedRooms)) {
        const room_type_id = roomTypeMap[roomKey];
        for (let i = 0; i < count; i++) {
            bookings.push({
            member_id: user.member_id,
            room_type_id,
            phone_entered: user.phone,
            checkin_date: checkin,
            checkout_date: checkout,
            guest_count: totalGuests,
            subtotal_amount: room_details[roomKey].price * nights,
            discount_amount: 0,
            total_amount: room_details[roomKey].price * nights,
            });
        }
        }

        // 🟩 เชื่อมไปที่ addBooking.php (ไฟล์เดียว รองรับหลายห้องแล้ว)
        const res = await axios.post(
        apiUrl("Booking/addBooking.php"),
        { bookings }, // ✅ ส่ง array bookings
        { headers: { "Content-Type": "application/json" } }
        );

    if (res.data.success) {
    console.log("📦 Backend Response:", res.data);

    // 🟢 ตรวจให้แน่ใจว่า booking_ids เป็น array เสมอ
    let booking_ids = [];

    // ✅ ถ้า backend ส่ง booking_ids มา (หลายห้อง)
    if (Array.isArray(res.data.booking_ids)) {
        booking_ids = res.data.booking_ids;
    }
    // ✅ ถ้า backend ส่ง booking_id ตัวเดียว (จองห้องเดียว)
    else if (res.data.booking_id) {
        booking_ids = [res.data.booking_id];
    }

    console.log("➡️ Booking IDs prepared to send:", booking_ids);

    // ⚠️ ถ้าไม่มี booking_id ใดเลย
    if (booking_ids.length === 0) {
        alert("⚠️ Booking created but no booking IDs returned from backend!");
        return;
    }

    alert("✅ All bookings created successfully!");
    navigate("/BookingConfirmation", {
        state: {booking_ids},
    });
    } else {
    alert("❌ Error: " + res.data.message);
    }

    } catch (err) {
        console.error("Error:", err);
        alert("⚠️ Failed to connect to backend. Please check server path.");
    }
};

    return (
        <div className="booking-page">
        <Navbar />
        <div className="booking-content">
            <h1>Booking Details</h1>
            <p className="booking-desc">Please review and select your stay details below.</p>

            {/* Date & Guest Section */}
            <div className="booking-form-section">
            <div className="form-row">
                <div className="form-group">
                <label>Check-In</label>
                <input
                    type="date"
                    value={checkin}
                    min={today}
                    onChange={(e) => setCheckin(e.target.value)}
                />
                </div>
                <div className="form-group">
                <label>Check-Out</label>
                <input
                    type="date"
                    value={checkout}
                    min={checkin}
                    onChange={(e) => setCheckout(e.target.value)}
                />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                <label>Adults</label>
                <input
                    type="number"
                    value={adults}
                    min="1"
                    onChange={(e) => setAdults(Number(e.target.value))}
                />
                </div>
                <div className="form-group">
                <label>Children</label>
                <input
                    type="number"
                    value={children}
                    min="0"
                    onChange={(e) => setChildren(Number(e.target.value))}
                />
                </div>
            </div>
            </div>

            {/* Room Selection */}
            <h2 className="room-select-title">Select Your Rooms</h2>
            <div className="room-select-list">
            {Object.keys(room_details).map((key) => {
                const room = room_details[key];
                const isSelected = selectedRooms[key];
                return (
                <div key={key} className={`room-option ${isSelected ? "selected" : ""}`}>
                    <img src={room.image} alt={room.name} className="room-option-img" />
                    <div className="room-option-info">
                    <h3>{room.name}</h3>
                    <p>{room.desc}</p>
                    <p><strong>Size:</strong> {room.size}</p>
                    <p><strong>Occupancy:</strong> {room.occupancy} guests</p>
                    <p><strong>Price:</strong> THB {room.price.toLocaleString()} / Night</p>
                    
                    {isSelected && (
                        <div className="room-count">
                        <label>Number of rooms:</label>
                        <input
                            type="number"
                            value={selectedRooms[key]}
                            min="1"
                            onChange={(e) => updateRoomCount(key, e.target.value)}
                        />
                        </div>
                    )}

                    <button
                        className={`select-room-btn ${isSelected ? "active" : ""}`}
                        onClick={() => toggleRoom(key)}
                    >
                        {isSelected ? "Remove" : "Select Room"}
                    </button>
                    </div>
                </div>
                );
            })}
            </div>

            {/* Summary */}
            <div className="selected-summary">
            <h2>Booking Summary</h2>
            <p>Total Guests: {totalGuests}</p>
            <p>Total Capacity: {totalCapacity}</p>

            {Object.entries(selectedRooms).length === 0 ? (
                <p>No room selected yet.</p>
            ) : (
                Object.entries(selectedRooms).map(([key, count]) => (
                <p key={key}>
                    • {count}X {room_details[key].name} — THB{" "}
                    {(room_details[key].price * count).toLocaleString()} / Night
                </p>
                ))
            )}

            <p>Nights: {nights}</p>
            <p>Total Price: THB {totalPrice.toLocaleString()}</p>
            {warning && <p className="warning-text">{warning}</p>}
            
            {/* /* Confirm Button */ }

            
            <button
                className="confirm-btn"
                disabled={totalGuests > totalCapacity}
                onClick={handleConfirm}
            >
                Confirm Booking
            </button>
            </div>
        </div>
        <Footer />
        </div>
    );
    }

export default Booking;
