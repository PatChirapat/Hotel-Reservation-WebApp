// Home.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../ui/Home.css";

import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import BookingBar from '../components/BookingBar';
import About from '../components/About';
import Roomlist from '../components/Roomlist';
import FacilityComp from '../components/FacilityComp';
import Footer from '../components/Footer';
import Reviews from '../components/Reviews';


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
      <div id="home"></div>

      <Carousel />
      <BookingBar />

      <section id="about">
        <About />
      </section>

      <section id="rooms">
        <Roomlist />
      </section>

      <section id="facilities">
        <FacilityComp />
      </section>

      <Reviews />

      <Footer />
    </div>
  );
}

export default Home;
