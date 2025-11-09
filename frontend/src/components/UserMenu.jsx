// frontend/src/components/UserMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // 🔹 ปิด dropdown เมื่อคลิกข้างนอก หรือกด Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const toggleMenu = () => setOpen((v) => !v);

  return (
    <div className="usermenu" ref={ref}>
      <button
        className="usermenu-btn nav-link"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Hi, <strong>{user?.username}</strong>
        <svg
          className={`caret ${open ? "open" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 8l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="usermenu-menu" role="menu">
          <Link to="/account" className="usermenu-item">
            Account
          </Link>
          <Link to="/BookingConfirmation" className="usermenu-item">
            My Bookings
          </Link>
          {user?.role === "ADMIN" && (
            <Link to="/admin" className="usermenu-item">
              Admin
            </Link>
          )}
          <button onClick={onLogout} className="usermenu-item danger">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}