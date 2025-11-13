// frontend/src/components/Reviews.jsx (หรือ path เดิมของบิบิ)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../utils/api";
import "../ui/Reviews.css";

export default function Reviews({ limit = 6 }) {
  const [items, setItems] = useState([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(apiUrl("reviewuser/getReviews.php"), {
          params: { limit, offset: 0 },
        });

        if (!alive) return;

        const rows = Array.isArray(res.data?.rows) ? res.data.rows : [];
        setItems(rows);
        setCount(Number(res.data?.total ?? rows.length));

        const avgValue =
          res.data?.avg ??
          (rows.length
            ? rows.reduce(
                (sum, row) => sum + Number(row.rating || 0),
                0
              ) / rows.length
            : 0);

        setAvg(Number.isFinite(avgValue) ? Number(avgValue) : 0);
      } catch (err) {
        if (alive) setError("Unable to load reviews.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [limit]);

  const avgDisplay = Number.isFinite(avg) ? avg : 0;

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-header">
        <h2>Guest Reviews</h2>

        <div className="reviews-stats">
          <HeaderStars value={avgDisplay} />
          <span className="reviews-avg">{avgDisplay.toFixed(2)}</span>
          <span className="reviews-count">({count} reviews)</span>
        </div>
      </div>

      {error && <div className="reviews-error">{error}</div>}

      {loading ? (
        <div className="reviews-loading">Loading reviews…</div>
      ) : items.length === 0 ? (
        <p className="reviews-empty">Be the first to write a review.</p>
      ) : (
        <div className="reviews-grid">
          {items.map((rv) => (
            <ReviewCard key={rv.review_id} review={rv} />
          ))}
        </div>
      )}
    </section>
  );
}

// ⭐ ดาวเฉลี่ยด้านบน (ใช้ class ชุดใหม่ ไม่ชนของการ์ด)
function HeaderStars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <span
      className="reviews-stars"
      aria-label={`Average rating ${value.toFixed(2)} of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full)
          return (
            <span key={i} className="reviews-star reviews-star-full">
              ★
            </span>
          );
        if (i === full && half)
          return (
            <span key={i} className="reviews-star reviews-star-half">
              ★
            </span>
          );
        return (
          <span key={i} className="reviews-star">
            ☆
          </span>
        );
      })}
    </span>
  );
}

// ⭐ การ์ดรีวิวแต่ละคน
function ReviewCard({ review }) {
  const name =
    review?.member_name ||
    (review?.member?.first_name && review?.member?.last_name
      ? `${review.member.first_name} ${review.member.last_name}`
      : review?.member?.first_name ||
        review?.member?.last_name ||
        `Guest #${review?.member_id}`);

  const tier = (review?.member?.tier || review?.tier || "SILVER").toUpperCase();
  const room = review?.room_type_name || review?.room_name || null;
  const createdRaw = review?.created_at || review?.createdAt;
  const created = createdRaw ? new Date(createdRaw) : new Date();
  const ratingValue = Number(review?.rating || 0);

  return (
    <article className="review-card">
      <div className="review-top">
        <div className="review-avatar" aria-hidden>
          {name?.[0]?.toUpperCase() || "G"}
        </div>

        <div className="review-who">
          <div className="review-name">{name}</div>
          <div className={`review-tier review-tier-${tier.toLowerCase()}`}>
            {tier}
          </div>
        </div>

        {/* ⭐ ดาวดวงเดียว + ตัวเลข */}
        <div className="review-rating-box">
          <span className="review-rating-star">★</span>
          <span className="review-rating-number">
            {ratingValue.toFixed(1)}
          </span>
          <span className="review-rating-of">/5</span>
        </div>
      </div>

      <div className="review-body">
        {room && <div className="review-room">Stayed in: {room}</div>}
        <p className="review-text">{review?.text}</p>
      </div>

      <div className="review-foot">
        <time className="review-when">{created.toLocaleString()}</time>
        {review?.booking_id && (
          <span className="review-bid">Booking #{review.booking_id}</span>
        )}
      </div>
    </article>
  );
}
