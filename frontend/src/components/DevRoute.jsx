// frontend/src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function DevRoute({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));

    // ถ้าไม่มี user หรือ role ไม่ใช่ dev → redirect ไปหน้า home
    if (!user || user.role !== "DEVELOPER") {
        alert("Access denied: Developer only.");
        return <Navigate to="/" replace />;
    }

    return children;
}