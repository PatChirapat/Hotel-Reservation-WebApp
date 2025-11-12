import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../ui/Payment.css";
import axios from "axios";
import { apiUrl } from "../utils/api"; // ในโปรเจกต์ของเธอมี util นี้อยู่แล้ว

export default function Payment() {
  const { state } = useLocation();
  const booking = state?.booking;              // ถ้ามี
  const booking_id = state?.booking_id || booking?.booking_id; // รองรับสองแบบ
  const navigate = useNavigate();

  const [method, setMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.role === "ADMIN") setIsAdmin(true);
  }, []);

  const callConfirmAPI = async (m) => {
    // ยิงไป backend/payment/confirm.php
    const payload = { method: m };
    if (booking_id) payload.booking_id = booking_id;
    // (ถ้ามีหลาย id ก็ส่ง booking_ids: [ ... ])

    const res = await axios.post(
      apiUrl("payment/confirm.php"),
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  };

  const handlePay = async () => {
    if (!method) {
      alert("Please select a payment method.");
      return;
    }
    if (!booking_id) {
      alert("Missing booking_id");
      return;
    }

    try {
      setProcessing(true);

      if (method === "QR") {
        setQrVisible(true);
      }

      // เรียก backend จริง
      const data = await callConfirmAPI(method);
      if (!data?.success) {
        throw new Error(data?.message || "Payment failed");
      }

      // เตรียม state สำหรับหน้า ConfirmBooking
      const paid = Array.isArray(data.payments) ? data.payments.find(p => p.booking_id === booking_id) : null;
      const bk = Array.isArray(data.bookings) ? data.bookings.find(b => +b.booking_id === +booking_id) : booking;

      const confirmState = {
        booking: bk || {
          booking_id,
          phone_entered: "",
          checkin_date: new Date().toISOString(),
          checkout_date: new Date(Date.now()+86400000).toISOString(),
          guest_count: 2,
          subtotal_amount: 0,
          discount_amount: 0,
          total_amount: paid?.amount ?? 0,
          created_at: new Date().toISOString(),
        },
        room: { name: "Room", room_number: "—", capacity: 2 },
        payment: paid || {
          payment_id: 0,
          booking_id,
          amount: bk?.total_amount ?? 0,
          method,
          provider_txn_ref: "SIM-LOCAL",
          payment_status: "Success",
          paid_at: new Date().toISOString(),
        }
      };

      alert("Payment successful!");
      navigate("/BookingConfirmation", { state: confirmState });
    } catch (err) {
      console.error(err);
      alert(err.message || "Payment error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <Navbar />
      <main className="payment-container">
        <h1>Payment for Booking #{booking_id ?? "—"}</h1>
        <p>Select your preferred payment method below:</p>

        <div className="payment-options">
          <label>
            <input
              type="radio"
              name="method"
              value="Credit"
              checked={method === "Credit"}
              onChange={(e) => setMethod(e.target.value)}
            />
            Credit Card
          </label>
          <label>
            <input
              type="radio"
              name="method"
              value="Debit"
              checked={method === "Debit"}
              onChange={(e) => setMethod(e.target.value)}
            />
            Debit Card
          </label>
          <label>
            <input
              type="radio"
              name="method"
              value="Cash"
              checked={method === "Cash"}
              onChange={(e) => setMethod(e.target.value)}
            />
            Cash
          </label>
          <label>
            <input
              type="radio"
              name="method"
              value="QR"
              checked={method === "QR"}
              onChange={(e) => setMethod(e.target.value)}
            />
            QR Code
          </label>
        </div>

        {method === "QR" && (
          <div className="qr-section">
            <p>Scan the QR code to complete your payment:</p>
            <img
              src="/images/demo/demo-qr.png"
              alt="QR Code"
              className="qr-image"
            />
            {processing && <p className="loading-text">Processing...</p>}
          </div>
        )}

        {(method === "Credit" || method === "Debit") && (
          <div className="card-section">
            <h3>Enter Card Details</h3>
            <input type="text" placeholder="Cardholder Name" />
            <input type="text" placeholder="Card Number" />
            <div className="card-row">
              <input type="text" placeholder="MM" />
              <input type="text" placeholder="YY" />
              <input type="text" placeholder="CVV" />
            </div>
          </div>
        )}

        {method === "Cash" && (
          <div className="cash-section">
            <p>
              Please pay in cash at the reception desk.{" "}
              {!isAdmin && (
                <span className="note">
                  (Only admin can mark as paid)
                </span>
              )}
            </p>
            {isAdmin && (
              <button
                className="admin-btn"
                onClick={handlePay}
                disabled={processing}
              >
                Mark as Received
              </button>
            )}
          </div>
        )}

        <div className="payment-actions">
          <button
            className="pay-btn"
            onClick={handlePay}
            disabled={processing}
          >
            {processing ? "Processing..." : "Pay Now"}
          </button>
          <button
            className="cancel-btn"
            onClick={() => navigate("/BookingConfirmation")}
          >
            Cancel
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}