import React, { useEffect } from "react";
import "../ui/About.css";

export default function About() {
  useEffect(() => {
    const els = document.querySelectorAll(".about .reveal");
    if (!els.length) return;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);  // โชว์ครั้งเดียว
          }
        });
      },
      { threshold: 0.12 } // เห็น ~12% ก็เริ่มโชว์
    );

    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="about" className="about">
      <div className="about__wrap">
        <div className="about__eyebrow reveal" style={{ "--d": "60ms" }}>ABOUT OUR HOTEL</div>
        <h2 className="about__title reveal" style={{ "--d": "160ms" }}>
          Where Quiet Luxury Meets a Warm Welcome
        </h2>
        <p className="about__desc reveal" style={{ "--d": "260ms" }}>
          Designed for travelers who value calm, comfort, and understated elegance,
          our city-side retreat offers a serene rhythm away from the rush. 
          Every space is curated to feel soft, warm, and effortlessly refined.
        </p>
        <p className="about__desc reveal" style={{ "--d": "360ms" }}>
          Our approach is simple: thoughtful details, gentle experiences, and a sense
          of ease that lets you breathe. Whether you’re unwinding or working with
          clarity, we welcome you with warm, attentive service and genuine care.
        </p>
        <ul className="about__points reveal" style={{ "--d": "460ms" }}>
          <li>Light-filled rooms with natural textures</li>
          <li>Personal, attentive, and discreet service</li>
          <li>A calm environment crafted for true rest</li>
        </ul>
        <div className="about__line reveal" style={{ "--d": "560ms" }} />
        <p className="about__tagline reveal" style={{ "--d": "660ms" }}>
          A place for unhurried mornings, gentle evenings, and days that feel beautifully quiet.
        </p>
      </div>
    </section>
  );
}