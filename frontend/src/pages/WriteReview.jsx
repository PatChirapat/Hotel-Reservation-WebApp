import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../ui/WriteReview.css";
import { apiUrl } from "../utils/api";

export default function WriteReview() {
  const navigate = useNavigate();
  const location = useLocation();

  const { booking_id = null, room_type_id = null, room_type_name = "" } =
    location.state || {};

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const member_id = currentUser?.member_id || null;

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const missingBooking = !booking_id;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!member_id) {
      alert("Please log in before writing a review");
      navigate("/signin");
      return;
    }
    if (!booking_id) {
      setErr("No booking information available to link this review");
      return;
    }
    if (!(rating >= 1 && rating <= 5)) {
      setErr("Please give a rating from 1 to 5 stars");
      return;
    }
    if (!text || text.trim().length < 5) {
      setErr("Please write a review of at least 5 characters");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        member_id,
        booking_id,
        room_type_id,
        rating: Number(rating),
        text: text.trim(),
      };

      const res = await fetch(apiUrl("reviewuser/createReview.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Save failed");
      }

      alert("Thank you very much for your review");
      navigate("/", { replace: true, state: { targetId: "reviews" } });
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || "Unable to save the review");
    } finally {
      setSubmitting(false);
    }
  };

  const Star = ({ i }) => (
    <button
      type="button"
      className={`rate-btn ${rating >= i ? "on" : ""}`}
      onClick={() => setRating(i)}
      aria-label={`${i} star`}
    >
      ★
    </button>
  );

  return (
    <div className="write-review-container">
      <h2>Write a Review</h2>
      <p className="muted">
        Booking #{booking_id || "?"} {room_type_name ? `· ${room_type_name}` : ""}
      </p>

      {missingBooking && (
        <div className="reviews-error">
          We couldn't find booking details. Please return to your booking confirmation page to start a review.
        </div>
      )}

      <form className="write-form" onSubmit={handleSubmit}>
        <div className="form-line">
          <label>Rating</label>
          <div className="rate-picker">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} i={i} />
            ))}
            <span className="rate-num">{rating || 0}/5</span>
          </div>
        </div>

        <div className="form-line">
          <label>Your Review</label>
          <textarea
            rows={5}
            placeholder="Share your stay experience..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {err && <div className="reviews-error">{err}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-gold" disabled={submitting || missingBooking}>
            {submitting ? "Saving…" : "Submit Review"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/", { state: { targetId: "reviews" } })}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
