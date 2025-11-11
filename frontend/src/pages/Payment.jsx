import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../ui/Payment.css";
import { apiUrl } from "../utils/api";

export default function Payment() {
  const { state } = useLocation();
  const booking = state?.booking;
  const bookingId = state?.booking_id;
  const navigate = useNavigate();

  const [method, setMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.role === "ADMIN") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (!bookingId) {
      navigate("/BookingConfirmation", { replace: true });
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    if (method !== "QR") {
      setQrVisible(false);
    }
  }, [method]);

  const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

  const markPaymentSuccess = async () => {
    if (!bookingId) {
      alert("Missing booking information. Please return to your bookings.");
      return false;
    }

    try {
      const response = await axios.post(
        apiUrl("Booking/updateBooking.php"),
        {
          booking_id: bookingId,
          payment_status: "SUCCESS",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data?.success) {
        return true;
      }

      alert(response.data?.message || "Failed to update payment status.");
      return false;
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Unable to update payment status. Please try again.");
      return false;
    }
  };

  const handlePay = async () => {
    if (!method) {
      alert("Please select a payment method.");
      return;
    }

    if (processing) {
      return;
    }

    if (method === "QR") {
      setQrVisible(true);
      setProcessing(true);
      try {
        await delay(2000);
        const updated = await markPaymentSuccess();
        if (updated) {
          alert("Payment successful via QR!");
          navigate("/BookingConfirmation");
        }
      } finally {
        setProcessing(false);
      }
      return;
    }

    if (method === "Credit" || method === "Debit") {
      setProcessing(true);
      try {
        await delay(2000);
        const updated = await markPaymentSuccess();
        if (updated) {
          alert("Card payment successful!");
          navigate("/BookingConfirmation");
        }
      } finally {
        setProcessing(false);
      }
      return;
    }

    if (method === "Cash") {
      if (isAdmin) {
        setProcessing(true);
        try {
          const updated = await markPaymentSuccess();
          if (updated) {
            alert("Admin marked payment as received.");
            navigate("/BookingConfirmation");
          }
        } finally {
          setProcessing(false);
        }
      } else {
        alert("Only admin can mark cash as paid.");
      }
    }
  };

  return (
    <div className="payment-page">
      <Navbar />
      <main className="payment-container">
        <h1>Payment for Booking #{bookingId ?? ""}</h1>
        {booking?.room_type_name && (
          <p className="booking-summary">
            {booking.room_type_name} · {booking.checkin_date} - {booking.checkout_date} ·{" "}
            {booking.guest_count} guest{Number(booking.guest_count) === 1 ? "" : "s"}
          </p>
        )}
        <p>Select your preferred payment method below:</p>

        <div className="payment-options">
          <label
            className={`payment-option ${method === "Credit" ? "active" : ""}`}
          >
            <input
              type="radio"
              name="method"
              value="Credit"
              checked={method === "Credit"}
              onChange={(event) => setMethod(event.target.value)}
            />
            <span>Credit Card</span>
          </label>
          <label
            className={`payment-option ${method === "Debit" ? "active" : ""}`}
          >
            <input
              type="radio"
              name="method"
              value="Debit"
              checked={method === "Debit"}
              onChange={(event) => setMethod(event.target.value)}
            />
            <span>Debit Card</span>
          </label>
          <label
            className={`payment-option ${method === "Cash" ? "active" : ""}`}
          >
            <input
              type="radio"
              name="method"
              value="Cash"
              checked={method === "Cash"}
              onChange={(event) => setMethod(event.target.value)}
            />
            <span>Cash</span>
          </label>
          <label className={`payment-option ${method === "QR" ? "active" : ""}`}>
            <input
              type="radio"
              name="method"
              value="QR"
              checked={method === "QR"}
              onChange={(event) => setMethod(event.target.value)}
            />
            <span>QR Code</span>
          </label>
        </div>

        {method === "QR" && (
          <div className="qr-section">
            <p>Scan the QR code to complete your payment:</p>
            <img src="/images/demo/demo-qr.svg" alt="QR Code" className="qr-image" />
            {processing && <p className="loading-text">Processing...</p>}
            {!processing && qrVisible && (
              <p className="success-text">Payment successful via QR!</p>
            )}
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
              Please pay in cash at the reception desk.
              {!isAdmin && <span className="note"> (Only admin can mark as paid)</span>}
            </p>
            {isAdmin && (
              <button
                type="button"
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
            type="button"
            className="pay-btn"
            onClick={handlePay}
            disabled={processing}
          >
            {processing ? "Processing..." : "Pay Now"}
          </button>
          <button
            type="button"
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
