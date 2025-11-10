import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Room from "./pages/Room";
import Facility from "./pages/Facility";
import Signin from "./pages/Signin";
import Admin from "./pages/Admin";
import AdminUser from "./pages/AdminUser";
import AdminBooking from "./pages/AdminBooking";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import UserPage from "./pages/UserPage";
import AdminRoute from "./components/AdminRoute";
import WriteReview from "./pages/WriteReview";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
        <Route path="/about" element={<div>About Page</div>} />
        <Route path="/facilities" element={<Facility />} />
        <Route path="/contact" element={<div>Contact Page</div>} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUser /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBooking /></AdminRoute>} />
        <Route path="/BookingConfirmation" element={<BookingConfirmation/>}/>
        <Route path="/reviews/new" element={<WriteReview />} />
        <Route path="/account" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  );
}
