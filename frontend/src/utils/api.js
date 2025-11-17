// ===============================================
// CONFIG — Point frontend to MAMP backend
// ===============================================

// กำหนด backend ของ MAMP แบบคงที่
const BACKEND_BASE = "http://localhost/CSS326/Project/Hotel-Reservation-WebApp/backend";

/**
 * คืนค่า BASE URL ให้ระบบอื่นยังใช้งานได้
 */
export const getApiBase = () => {
  // ถ้าอยากใช้ ENV (production) ก็ใช้ VITE_API_URL ก่อน
  const envValue = import.meta?.env?.VITE_API_URL;

  if (envValue && typeof envValue === "string" && envValue.trim().length > 0) {
    return envValue.trim().replace(/\/+$/, "");
  }

  // ถ้าไม่มี ENV → ใช้ MAMP BASE แทน
  return BACKEND_BASE;
};

/**
 * สร้าง URL สำหรับเรียก backend
 */
export const apiUrl = (path = "") => {
  const base = getApiBase();
  return `${base}/${String(path).replace(/^\/+/, "")}`;
};

// export เผื่อ component อื่นใช้
export const API_BASE = BACKEND_BASE;
