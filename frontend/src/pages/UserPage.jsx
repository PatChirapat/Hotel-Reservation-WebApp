import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../ui/UserPage.css";
import { apiUrl } from "../utils/api";

export default function UserPage() {
  const navigate = useNavigate();

  // โหมดดู/แก้ไข (ค่าเริ่มต้น = ดูอย่างเดียว)
  const [isEditing, setIsEditing] = useState(false);

  // โหลด/บันทึก/ข้อความผิดพลาด
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  // โปรไฟล์/บุ๊คกิง/จ่ายเงิน
  const [profile, setProfile]   = useState({
    member_id: null, first_name:"", last_name:"", username:"",
    email:"", phone:"", profile_image_url:"", tier:"SILVER", join_date:""
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const isDirty = originalProfile ? JSON.stringify({
    first_name: profile.first_name,
    last_name:  profile.last_name,
    username:   profile.username,
    email:      profile.email,
    phone:      profile.phone,
    profile_image_url: profile.profile_image_url
  }) !== JSON.stringify({
    first_name: originalProfile.first_name,
    last_name:  originalProfile.last_name,
    username:   originalProfile.username,
    email:      originalProfile.email,
    phone:      originalProfile.phone,
    profile_image_url: originalProfile.profile_image_url
  }) : false;
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  // base URL ไป backend
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const api = (p) => apiUrl(p);

  const tierPretty = useMemo(() => ({SILVER:"Silver", GOLD:"Gold", PLATINUM:"Platinum"}[profile.tier] || "Silver"), [profile.tier]);
  const tierClass  = tierPretty.toLowerCase();
  const THB = (n) => Number(n||0).toLocaleString("th-TH",{style:"currency",currency:"THB"});

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
        const common = { method:"POST", headers:{ "Content-Type":"application/json" }, body };

        const rp = await fetch(api("/api/user/profile.php"), common);
        if (!alive) return;

        const dp = rp.ok ? await rp.json() : null;

        const p = dp && !dp.error ? dp : {
          member_id: currentUser.member_id, username: currentUser.username||"",
          first_name: currentUser.first_name||"", last_name: currentUser.last_name||"",
          email: currentUser.email||"", phone: currentUser.phone||"",
          profile_image_url: currentUser.profile_image_url||"", tier: currentUser.tier||"SILVER",
          join_date: currentUser.join_date||""
        };

        setProfile(p);
        setOriginalProfile({
          first_name: p.first_name || "",
          last_name:  p.last_name  || "",
          email:      p.email      || "",
          phone:      p.phone      || "",
          profile_image_url: p.profile_image_url || ""
        });

        setBookings([]);
        setPayments([]);
      } catch {
        setError("Unable to load user data");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // บันทึกโปรไฟล์
  const onSaveProfile = async (e) => {
    e.preventDefault();

    // ignore submit if not editing
    if (!isEditing) return;

    // simple email validation
    const emailOk = !profile.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
    if (!emailOk) { alert("Please enter a valid email."); return; }

    try {
      setSaving(true);
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const body = {
        member_id: user?.member_id,
        first_name: profile.first_name?.trim(),
        last_name:  profile.last_name?.trim(),
        username:   profile.username?.trim(),
        email:      profile.email?.trim(),
        phone:      profile.phone?.trim(),
        profile_image_url: profile.profile_image_url?.trim() || ""
      };
      const res  = await fetch(api("/api/user/update_profile.php"), {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");

      if (data.profile) {
        setProfile((prev)=>({ ...prev, ...data.profile }));
        localStorage.setItem("user", JSON.stringify({ ...(user||{}), ...data.profile }));
        setOriginalProfile({
          first_name: data.profile.first_name || "",
          last_name:  data.profile.last_name  || "",
          username:   data.profile.username   || "",
          email:      data.profile.email      || "",
          phone:      data.profile.phone      || "",
          profile_image_url: data.profile.profile_image_url || ""
        });
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
          <div className="header-line">
            <div className="title-side">
              <h1>My Account</h1>
              <p className="muted">Manage your profile, bookings and payments.</p>
            </div>
            <span className={`tier-badge ${tierClass}`}>{tierPretty}</span>
            {/* <span className={`mode-badge ${isEditing ? 'editing' : 'viewing'}`}>{isEditing ? 'Editing' : 'Viewing'}</span> */}
          </div>
        </header>

        {error && <div className="user-error">{error}</div>}

        <div className="user-tabs">
          <button className="tab active">Profile</button>
          <div className="spacer" />
          <button className="to-home gold-btn" onClick={()=>navigate("/")}>Back to Home</button>
        </div>

        <section className="panel">
          <h2 className="gold">Profile Information</h2>

          <div className="profile-photo-box">
            <img
              src={profile.profile_image_url?.trim()? profile.profile_image_url : "/images/user.png"}
              alt="Profile" className="profile-photo"
            />
          </div>

          <form className="form-grid" onSubmit={onSaveProfile}>
            <div className="field">
              <label>First Name</label>
              <input value={profile.first_name} readOnly={!isEditing}
                     onChange={(e)=>setProfile({...profile, first_name:e.target.value})}/>
            </div>
            <div className="field">
              <label>Last Name</label>
              <input value={profile.last_name} readOnly={!isEditing}
                     onChange={(e)=>setProfile({...profile, last_name:e.target.value})}/>
            </div>
            <div className="field">
              <label>Username</label>
              <input
                value={profile.username || ""}
                readOnly={!isEditing}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={profile.email||""} readOnly={!isEditing}
                     onChange={(e)=>setProfile({...profile, email:e.target.value})}/>
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={profile.phone||""} readOnly={!isEditing}
                     onChange={(e)=>setProfile({...profile, phone:e.target.value})}/>
            </div>

            <div className="actions">
              {isEditing ? (
                <>
                  <button className="primary" type="submit" disabled={saving || !isDirty}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => {
                    if (originalProfile) {
                      setProfile((prev)=>({
                        ...prev,
                        first_name: originalProfile.first_name,
                        last_name:  originalProfile.last_name,
                        email:      originalProfile.email,
                        phone:      originalProfile.phone,
                        profile_image_url: originalProfile.profile_image_url
                      }));
                    }
                    setIsEditing(false);
                  }}>
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" className="primary" onClick={()=>setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}