import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Room from "./pages/Room";
import Facility from "./pages/Facility";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
        <Route path="/about" element={<div>About Page</div>} />
        <Route path="/facilities" element={<Facility />} />
        <Route path="/contact" element={<div>Contact Page</div>} />
        <Route path="/booking" element={<div>Booking Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}
