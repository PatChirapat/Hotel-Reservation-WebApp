// frontend/src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // ถ้าไม่มี user หรือ role ไม่ใช่ ADMIN → redirect ไปหน้า home
  if (!user || user.role !== "ADMIN") {
    alert("Access denied: Admins only.");
    return <Navigate to="/" replace />;
  }

  return children;
}