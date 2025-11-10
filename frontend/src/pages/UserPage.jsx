import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../ui/UserPage.css";

export default function UserPage() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState({
      member_id: null,
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      tier: "SILVER",
      join_date: "",
    });
    const [originalProfile, setOriginalProfile] = useState(null);

    const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const api = (p) => `${apiBase}${p}`;

    const tierPretty = useMemo(
      () =>
        (
          {
            SILVER: "Silver",
            GOLD: "Gold",
            PLATINUM: "Platinum",
          }[profile.tier] || "Silver"
        ),
      [profile.tier]
    );
    const tierClass = tierPretty.toLowerCase();

    useEffect(() => {
      let alive = true;
      (async () => {
        try {
          setLoading(true);
          if (!currentUser || !currentUser.member_id) {
            setError("Please sign in first");
            setLoading(false);
            navigate("/signin");
            return;
          }
          const body = JSON.stringify({ member_id: currentUser.member_id });
          const res = await fetch(api("/api/user/profile.php"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          if (!alive) return;
          const data = res.ok ? await res.json() : null;
          const p = data && !data.error ? data : currentUser;

          setProfile(p);
          setOriginalProfile({
            first_name: p.first_name || "",
            last_name: p.last_name || "",
            username: p.username || "",
            email: p.email || "",
            phone: p.phone || "",
          });
        } catch {
          setError("Unable to load user data");
        } finally {
          setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, []);

    // ✅ กด Save แล้วค่อยอัปเดต DB
    const onSaveProfile = async (e) => {
      e.preventDefault();
      if (!isEditing) return;

      try {
        setSaving(true);
        const body = {
          member_id: profile.member_id,
          first_name: profile.first_name?.trim(),
          last_name: profile.last_name?.trim(),
          username: profile.username?.trim(),
          email: profile.email?.trim(),
          phone: profile.phone?.trim(),
        };

        const res = await fetch(api("/api/user/update_profile.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON: ${text.slice(0, 100)}`);
        }

        if (!res.ok || !data.success)
          throw new Error(data.message || "Update failed");

        if (data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
          localStorage.setItem(
            "user",
            JSON.stringify({ ...(currentUser || {}), ...data.profile })
          );
          setOriginalProfile(data.profile);
        }

        alert("Profile Updated!");
        setIsEditing(false);
      } catch (err) {
        alert(err.message || "Network error");
      } finally {
        setSaving(false);
      }
    };

    if (loading) return <div className="userpage-loading">Loading...</div>;

    return (
      <div className="userpage">
        <Navbar />
        <main className="user-container">
          <header className="user-header">
            <h1>My Account</h1>
            <p className="muted">Manage your profile, bookings and payments.</p>
          </header>

          {error && <div className="user-error">{error}</div>}

          <section className="panel">
            <div className="panel-header">
              <h2 className="gold">Profile Information</h2>
              <span className={`tier-badge ${tierClass}`}>{tierPretty}</span>
            </div>

            <form className="form-grid" onSubmit={onSaveProfile}>
              {["first_name", "last_name", "username", "email", "phone"].map((key) => (
                <div className="field" key={key}>
                  <label>
                    {key.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                  <input
                    value={profile[key] || ""}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, [key]: e.target.value })
                    }
                  />
                </div>
              ))}

              {isEditing && (
                <div className="actions">
                  <button
                    type="submit"
                    className="primary"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      if (originalProfile)
                        setProfile({ ...profile, ...originalProfile });
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>

            {/* ปุ่ม Edit ต้องอยู่นอก form */}
            {!isEditing && (
              <div className="actions">
                <button
                  type="button"
                  className="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            )}

          </section>
        </main>
        <Footer />
      </div>
    );
}