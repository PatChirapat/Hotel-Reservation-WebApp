// frontend/src/pages/Payment.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../ui/Payment.css";

export default function Payment() {
  const { state } = useLocation();
  const booking = state?.booking;
  const booking_id = state?.booking_id;
  const navigate = useNavigate();

  const [method, setMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.role === "ADMIN") setIsAdmin(true);
  }, []);

  const handlePay = () => {
    if (!method) {
      alert("Please select a payment method.");
      return;
    }
    if (method === "QR") {
      setQrVisible(true);
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        alert("Payment successful via QR!");
        navigate("/BookingConfirmation");
      }, 2000);
    } else if (method === "Credit" || method === "Debit") {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        alert("Card payment successful!");
        navigate("/BookingConfirmation");
      }, 2000);
    } else if (method === "Cash") {
      if (isAdmin) {
        alert("Admin marked payment as received.");
        navigate("/BookingConfirmation");
      } else {
        alert("Only admin can mark cash as paid.");
      }
    }
  };

  return (
    <div className="payment-page">
      <Navbar />
      <main className="payment-container">
        <h1>Payment for Booking #{booking_id}</h1>
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