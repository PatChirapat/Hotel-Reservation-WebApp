// Home.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../ui/Home.css";

import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import BookingBar from '../components/BookingBar';
import Roomlist from '../components/Roomlist';
import FacilityComp from '../components/FacilityComp';
import Footer from '../components/Footer';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  // เมื่อถูกนำทางมาพร้อม state.targetId ให้เลื่อนหา id นั้น
  useEffect(() => {
    const targetId = location.state?.targetId;
    if (targetId) {
      const t = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        // ล้าง state กันเลื่อนซ้ำเมื่อ back/forward
        navigate(".", { replace: true, state: null });
      }, 0);
      return () => clearTimeout(t);
    }
  }, [location.state, navigate]);

  return (
    <div className="home-container">
      <Navbar />

      {/* หมุดให้เมนู "Home" เลื่อนมาบนสุด */}
      <div id="home" />

      {/* ถ้ามี About อยู่ในหน้านี้ สามารถเลื่อนได้ด้วยการวางหมุดไว้ก่อนคอมโพเนนต์/บล็อกที่ต้องการ */}
      <div id="about" />

      <Carousel />
      <BookingBar />

      {/* เมนู Rooms & Suites จะเลื่อนมาที่นี่ */}
      <section id="rooms">
        <Roomlist />
      </section>

      {/* เมนู Facilities จะเลื่อนมาที่นี่ */}
      <section id="facilities">
        <FacilityComp />
      </section>

      <Footer />
    </div>
  );
}

export default Home;
