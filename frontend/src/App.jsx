import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";


export default function App() {
  return (
    <BrowserRouter>
      <Home />
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/about" element={<div>About Page</div>} />
        <Route path="/rooms" element={<div>Rooms Page</div>} />
        <Route path="/facilities" element={<div>Facilities Page</div>} />
        <Route path="/contact" element={<div>Contact Page</div>} />
        <Route path="/booking" element={<div>Booking Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}
