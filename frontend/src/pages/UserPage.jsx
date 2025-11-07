// frontend/src/pages/UserPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../ui/UserPage.css";

export default function UserPage() {
  const navigate = useNavigate();

  // tabs: profile | bookings | payments
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // profile
  const [profile, setProfile] = useState({
    member_id: null,
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    country: "",
    profile_image_url: "", // ถ้าไม่มีจะแสดง /images/user.png
    tier: "SILVER",
    join_date: "",
  });

  // datasets
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  // formatters
  const THB = (n) =>
    Number(n || 0).toLocaleString("th-TH", { style: "currency", currency: "THB" });

  const tierPretty = useMemo(() => {
    const t = { SILVER: "Silver", GOLD: "Gold", PLATINUM: "Platinum" };
    return t[profile.tier] || "Silver";
  }, [profile.tier]);
  const tierClass = tierPretty.toLowerCase();

  const totalSpent = payments
    .filter((p) => p.payment_status === "Success")
    .reduce((s, x) => s + Number(x.amount || 0), 0);

  const nightsTotal = useMemo(() => {
    const toDate = (d) => new Date(d + "T00:00:00");
    return bookings.reduce((sum, b) => {
      if (!b.checkin_date || !b.checkout_date) return sum;
      const diff =
        (toDate(b.checkout_date) - toDate(b.checkin_date)) / (1000 * 60 * 60 * 24);
      return sum + Math.max(0, diff);
    }, 0);
  }, [bookings]);

  // load all
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [rp, rb, rpay] = await Promise.all([
          fetch("/api/user/profile.php"),
          fetch("/api/user/bookings.php"),
          fetch("/api/user/payments.php"),
        ]);
        if (!rp.ok || !rb.ok || !rpay.ok) throw new Error("fetch_failed");

        const dp = await rp.json();
        const db = await rb.json();
        const dpay = await rpay.json();
        if (!alive) return;

        setProfile({
          member_id: dp.member_id ?? null,
          first_name: dp.first_name ?? "",
          last_name: dp.last_name ?? "",
          username: dp.username ?? "",
          email: dp.email ?? "",
          phone: dp.phone ?? "",
          country: dp.country ?? "",
          profile_image_url: dp.profile_image_url ?? "",
          tier: dp.tier ?? "SILVER",
          join_date: dp.join_date ?? "",
        });

        setBookings(Array.isArray(db) ? db : []);
        setPayments(Array.isArray(dpay) ? dpay : []);
      } catch {
        setError("Unable to load user data");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // save profile
  const onSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const body = {
        first_name: profile.first_name?.trim(),
        last_name: profile.last_name?.trim(),
        email: profile.email?.trim(),
        phone: profile.phone?.trim(),
        country: profile.country?.trim(),
      };
      const res = await fetch("/api/user/update_profile.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      alert("Profile Updated!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // change photo (preview ทันที; ต่อ backend ได้ภายหลัง)
  const onUploadPhoto = async (file) => {
    if (!file) return;

    // Preview ทันที (ไม่ต้องรีเฟรช)
    const previewURL = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, profile_image_url: previewURL }));

    // ถ้าจะอัปโหลดจริง ให้ปลดคอมเมนต์:
    // const form = new FormData();
    // form.append("photo", file);
    // const res = await fetch("/api/user/upload_photo.php", { method: "POST", body: form });
    // const data = await res.json();
    // if (res.ok) {
    //   setProfile((prev) => ({ ...prev, profile_image_url: data.profile_image_url }));
    // } else {
    //   alert(data?.error || "Failed to upload photo");
    // }
  };

  if (loading) return <div className="userpage-loading">Loading...</div>;

  return (
    <div className="userpage">
      <Navbar />

      <main className="user-container">
        {/* Header */}
        <header className="user-header">
          <div className="header-line">
            <div>
              <h1>My Account</h1>
              <p className="muted">Manage your profile, bookings and payments.</p>
            </div>
            <span className={`tier-badge ${tierClass}`}>{tierPretty}</span>
          </div>

          <div className="stats-row">
            <div className="stat">
              <div className="stat-title">Total Spent</div>
              <div className="stat-value">{THB(totalSpent)}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Bookings</div>
              <div className="stat-value">{bookings.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Nights</div>
              <div className="stat-value">{nightsTotal}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Member Since</div>
              <div className="stat-value">{profile.join_date || "—"}</div>
            </div>
          </div>
        </header>

        {error && <div className="user-error">{error}</div>}

        {/* Tabs */}
        <div className="user-tabs">
          <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
            Profile
          </button>
          <button className={`tab ${tab === "bookings" ? "active" : ""}`} onClick={() => setTab("bookings")}>
            Booking History
          </button>
          <button className={`tab ${tab === "payments" ? "active" : ""}`} onClick={() => setTab("payments")}>
            Payment History
          </button>
          <div className="spacer" />
          <button className="to-home gold-btn" onClick={() => navigate("/")}>Back to Home</button>
        </div>

        {/* PROFILE */}
        {tab === "profile" && (
          <section className="panel">
            <h2 className="gold">Profile Information</h2>

            {/* Profile photo (square, center) + change button */}
            <div className="profile-photo-box">
              <img
                src={
                  profile.profile_image_url && profile.profile_image_url.trim() !== ""
                    ? profile.profile_image_url
                    : "/images/user.png"
                }
                alt="Profile"
                className="profile-photo"
              />
              <label className="change-photo-text">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => onUploadPhoto(e.target.files?.[0])}
                />
              </label>
            </div>

            {/* Form */}
            <form className="form-grid" onSubmit={onSaveProfile}>
              <div className="field">
                <label>First Name</label>
                <input
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Last Name</label>
                <input
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Username</label>
                <input value={profile.username || ""} readOnly />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Phone</label>
                <input
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Country</label>
                <input
                  value={profile.country || ""}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                />
              </div>

              <div className="actions">
                <button className="primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* BOOKINGS */}
        {tab === "bookings" && (
          <section className="panel">
            <h2 className="gold">Booking History</h2>
            {bookings.length === 0 ? (
              <p className="muted">No bookings found.</p>
            ) : (
              <div className="table">
                <div className="thead">
                  <div>ID</div>
                  <div>Room</div>
                  <div>Check-in</div>
                  <div>Check-out</div>
                  <div>Total</div>
                  <div>Status</div>
                </div>
                {bookings.map((b) => (
                  <div className="trow" key={b.booking_id}>
                    <div>{b.booking_id}</div>
                    <div>{b.room || b.rooms || "—"}</div>
                    <div>{b.checkin_date}</div>
                    <div>{b.checkout_date}</div>
                    <div>{THB(b.total_amount)}</div>
                    <div>{b.booking_status}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* PAYMENTS */}
        {tab === "payments" && (
          <section className="panel">
            <h2 className="gold">Payment History</h2>
            {payments.length === 0 ? (
              <p className="muted">No payments found.</p>
            ) : (
              <div className="table">
                <div className="thead">
                  <div>ID</div>
                  <div>Booking</div>
                  <div>Method</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Paid At</div>
                </div>
                {payments.map((p) => (
                  <div className="trow" key={p.payment_id}>
                    <div>{p.payment_id}</div>
                    <div>{p.booking_id}</div>
                    <div>{p.method}</div>
                    <div>{THB(p.amount)}</div>
                    <div>{p.payment_status}</div>
                    <div>{p.paid_at}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}