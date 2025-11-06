import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../ui/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const go = (id) => {
    // ถ้าอยู่หน้า Home ("/") ให้เลื่อนเลย
    if (location.pathname === "/") {
      scrollToId(id);
    } else {
      // ถ้าอยู่หน้าที่ไม่ใช่ "/" ให้นำทางไป "/" แล้วให้ Home จัดการเลื่อน
      navigate("/", { state: { targetId: id } });
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      scrollToId("home");
    } else {
      navigate("/", { state: { targetId: "home" } });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* เดิมใช้ Link ไป "/", เปลี่ยนเป็นปุ่มเพื่อเลื่อนขึ้นบนเมื่ออยู่หน้า Home */}
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

      <div className="navbar-right">
        {/* เมนูที่เลื่อนในหน้าเดียว */}
        <button type="button" className="nav-link" onClick={() => go("home")}>
          Home
        </button>
        <button type="button" className="nav-link" onClick={() => go("about")}>
          About
        </button>
        <button type="button" className="nav-link" onClick={() => go("rooms")}>
          Rooms &amp; Suites
        </button>
        <button
          type="button"
          className="nav-link"
          onClick={() => go("facilities")}
        >
          Facilities
        </button>

        <button type="button" className="nav-link" onClick={() => go("reviews")}>
          Reviews
        </button>


        {/* เมนูที่เป็นหน้าคนละ route ใช้ Link เหมือนเดิม */}
        <Link to="/booking" className="booking">
          Book Now
        </Link>



        <Link to="/signin" className="nav-link flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </Link>
      </div>
    </nav>
  );
}

