import React, { useMemo } from "react";
import "../ui/Reviews.css";

const defaultReviews = [
  {
    id: 1,
    name: "Nicha T.",
    country: "Thailand",
    date: "2025-10-12",
    rating: 5,
    text:
      "ห้องพักสะอาด กลิ่นผ้าปูดีมาก บริการรวดเร็ว ประทับใจแถบจองห้องใช้ง่ายสุดๆ!"
  },
  {
    id: 2,
    name: "Kenji A.",
    country: "Japan",
    date: "2025-09-03",
    rating: 4,
    text:
      "Location ดี เดินทางสะดวก อาหารเช้าหลากหลาย อยากให้สระว่ายน้ำเปิดถึงดึกกว่านี้อีกนิด"
  },
  {
    id: 3,
    name: "Marie C.",
    country: "France",
    date: "2025-08-21",
    rating: 5,
    text:
      "Design สวยมาก ละเอียดทุกจุด Club lounge ดีงาม เครื่องดื่มคัดคุณภาพ"
  }
];

function Stars({ value }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < value);
  return (
    <div className="stars" aria-label={`Rating ${value} out of 5`}>
      {stars.map((on, i) => (
        <svg
          key={i}
          className={`star ${on ? "on" : ""}`}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.787 1.402 8.167L12 18.896l-7.336 3.867 1.402-8.167L.132 9.209l8.2-1.193L12 .587z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews({ items = defaultReviews, ctaTo = "/signin" }) {
  const avg = useMemo(() => {
    if (!items.length) return 0;
    return (
      Math.round(
        (items.reduce((s, r) => s + (r.rating || 0), 0) / items.length) * 10
      ) / 10
    );
  }, [items]);

  return (
    <section id="reviews" className="reviews-section">
      <div className="reviews-header">
        <h2 className="reviews-title">Guest Reviews & Testimonials</h2>
        <div className="reviews-summary">
          <Stars value={Math.round(avg)} />
          <span className="reviews-avg">{avg}/5</span>
          <span className="reviews-count">({items.length} reviews)</span>
        </div>
      </div>

      <div className="reviews-grid">
        {items.map((r) => (
          <article key={r.id} className="review-card">
            <div className="review-top">
              <div className="reviewer">
                <div className="avatar" aria-hidden="true">
                  {r.name?.[0] ?? "G"}
                </div>
                <div>
                  <div className="name">{r.name}</div>
                  <div className="meta">
                    {r.country} • {new Date(r.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Stars value={r.rating} />
            </div>
            <p className="review-text">{r.text}</p>
          </article>
        ))}
      </div>

      <div className="reviews-cta">
        <a className="reviews-button" href={ctaTo}>
          Write a Review
        </a>
      </div>
    </section>
  );
}
