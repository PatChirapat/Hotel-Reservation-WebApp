import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../ui/Booking.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import axios from "axios";


function Booking() {
    const location = useLocation();
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

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

    const apiBase = import.meta.env.VITE_API_URL;

    // Booking details to send to backend
    //booking confirm function
    const handleConfirm = async () => {
  try {
    // ตัวอย่างข้อมูลที่ส่งไป backend
    const bookingData = {
      member_id: 12, // เปลี่ยนตามระบบ login ของคุณ
      phone_entered: "0636975829", // หรือรับจาก user input
      checkin_date: checkin,
      checkout_date: checkout,
      guest_count: totalGuests,
      subtotal_amount: totalPrice,
      discount_amount: 0,
      total_amount: totalPrice,
    };

    // เรียกใช้ API (POST)
    const res = await axios.post(`${apiBase}/Booking/addBooking.php`, bookingData, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.data.success) {
      alert("✅ Booking created successfully! Booking ID: " + res.data.booking_id);
    } else {
      alert("❌ Error: " + res.data.message);
    }
    } catch (err) {
    console.error("Error:", err);
    alert("⚠️ Failed to connect to backend. Please check your PHP path or server.");
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

            <Link to = "/BookingConfirmation">
            <button
                className="confirm-btn"
                disabled={totalGuests > totalCapacity}
                onClick={handleConfirm}
            >
                Confirm Booking
            </button>
            </Link>
            </div>
        </div>
        <Footer />
        </div>
    );
    }

export default Booking;
