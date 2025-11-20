// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../ui/Navbar.css";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- Auth state ---
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);

        // ⭐ Normalize ROLE ให้เป็น lowercase เสมอ
        if (parsed.role) {
          parsed.role = parsed.role.toLowerCase();
        }

        setUser(parsed);
      }
    } catch {}

    // Sync user ระหว่างแท็บ
    const onStorage = (e) => {
      if (e.key === "user") {
        const newVal = e.newValue ? JSON.parse(e.newValue) : null;

        if (newVal?.role) {
          newVal.role = newVal.role.toLowerCase(); // ⭐ normalize
        }

        setUser(newVal);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // --- Logout ---
  const logout = () => {
    const ok = window.confirm("Do you want to Sign Out?");
    if (!ok) return;
    localStorage.removeItem("user");
    setUser(null);
    navigate("/signin");
  };

  // --- Scroll within same page ---
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const go = (id) => {
    if (location.pathname === "/") {
      scrollToId(id);
    } else {
      navigate("/", { state: { targetId: id } });
    }
  };

  // --- Logo click ---
  const handleLogoClick = () => {
    if (location.pathname === "/") {
      scrollToId("home");
    } else {
      navigate("/", { state: { targetId: "home" } });
    }
  };

  // --- Responsive menu ---
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      {/* Left Logo */}
      <div className="navbar-left">
        <button
          type="button"
          onClick={handleLogoClick}
          className="navbar-logo"
          aria-label="Go to Home"
        >
          <span>HOTEL ROOM</span>
          <span>RESERVATION SYSTEM</span>
        </button>
      </div>

      {/* Hamburger */}
      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span><span></span><span></span>
      </button>

      {/* Right Menu */}
      <div className={`navbar-right ${menuOpen ? "active" : ""}`}>
        <button type="button" className="nav-link" onClick={() => { go("home"); closeMenu(); }}>
          Home
        </button>
        <button type="button" className="nav-link" onClick={() => { go("about"); closeMenu(); }}>
          About
        </button>
        <button type="button" className="nav-link" onClick={() => { go("rooms"); closeMenu(); }}>
          Rooms &amp; Suites
        </button>
        <button type="button" className="nav-link" onClick={() => { go("facilities"); closeMenu(); }}>
          Facilities
        </button>
        <button type="button" className="nav-link" onClick={() => { go("reviews"); closeMenu(); }}>
          Reviews
        </button>

        {user ? (
          <>
            {/* Admin */}
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="booking"
                onClick={closeMenu}
              >
                Admin
              </Link>
            )}

            {/* Developer */}
            {user.role === "developer" && (
              <Link
                to="/dev"
                className="booking"
                onClick={closeMenu}
              >
                Developer
              </Link>
            )}

            {/* Normal User */}
            {user.role === "user" && (
              <Link
                to="/booking"
                className="booking"
                onClick={closeMenu}
              >
                Book Now
              </Link>
            )}

            <UserMenu
              user={user}
              role={user.role}
              onLogout={logout}
            />
          </>
        ) : (
          <Link
            to="/signin"
            className="nav-link flex items-center gap-1"
            onClick={closeMenu}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
