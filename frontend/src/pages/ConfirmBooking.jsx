import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "../ui/ConfirmBooking.css";

export default function ConfirmBooking() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const cardRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const autoPDFOnceRef = useRef(false);

  // USER
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  // BOOKING (fallback values)
  const booking = state?.booking || {
    booking_id: 123456,
    member_id: user?.member_id ?? 12,
    phone_entered: user?.phone ?? "0812345678",
    checkin_date: "2025-12-24",
    checkout_date: "2025-12-26",
    guest_count: 2,
    subtotal_amount: 4000,
    discount_amount: 0,
    total_amount: 4000,
    created_at: new Date().toISOString(),
  };

  const room = state?.room || {
    name: "Deluxe",
    room_number: "101",
    capacity: 2,
  };

  const payment = state?.payment || {
    payment_id: 5555,
    booking_id: booking.booking_id,
    amount: booking.total_amount,
    method: "QR",
    provider_txn_ref: "TXN-2025-1120-ABCDEF",
    payment_status: "Success",
    paid_at: new Date().toISOString(),
  };

  // HELPERS
  const fmt = (n) =>
    Number(n ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const nights = (() => {
    const ci = new Date(booking.checkin_date);
    const co = new Date(booking.checkout_date);
    return Math.max(1, (co - ci) / (1000 * 60 * 60 * 24));
  })();

  const fullName =
    user?.fullName ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : null) ||
    "Guest";

  // SAVE PNG
  const saveAsImage = async () => {
    setSaveError("");
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `booking_${booking.booking_id}.png`;
      link.click();
    } catch {
      setSaveError("Cannot save image. Please try again.");
    }
    setSaving(false);
  };

  // SAVE PDF (ทนกว่า: รอฟอนต์, จำกัดสเกล, รองรับหลายหน้า, fallback เป็น print)
  const saveAsPDF = async (mode = "save") => {
    setSaveError("");
    setSaving(true);
    try {
      // รอให้ฟอนต์พร้อม และหน่วงนิดให้ภาพ/เอฟเฟกต์โหลดครบ
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 100));

      const el = cardRef.current;
      if (!el) throw new Error("Card element not found");

      const safeScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1.5));

      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        scale: safeScale,
        removeContainer: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");

      const pageW = pdf.internal.pageSize.getWidth();   // ~210mm
      const pageH = pdf.internal.pageSize.getHeight();  // ~297mm
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      if (imgH <= pageH) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgW, imgH);
      } else {
        let position = 0;
        let heightLeft = imgH;

        pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
        heightLeft -= pageH;

        while (heightLeft > 0) {
          pdf.addPage();
          position = heightLeft - imgH;
          pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
          heightLeft -= pageH;
        }
      }

      if (mode === "save") {
        pdf.save(`booking_${booking.booking_id}.pdf`);
      } else {
        const url = pdf.output("bloburl");
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save PDF. Trying Print-to-PDF instead.");
      window.print(); // fallback เสมอเพื่อให้ผู้ใช้เซฟ PDF ได้
    } finally {
      setSaving(false);
    }
  };

  const handleSavePDF = async () => {
    try {
      await saveAsPDF("save");
    } catch {
      window.print();
    }
  };

  const handleViewPDF = async () => {
    try {
      await saveAsPDF("view");
    } catch {
      window.print();
    }
  };

  // Auto-generate PDF once after confirmation page renders
  useEffect(() => {
    if (autoPDFOnceRef.current) return;
    autoPDFOnceRef.current = true;
    // Avoid auto-generating PDF to prevent popup/download blocking.
  }, []);

  return (
    <div className="confirm-page">
      <Navbar />

      <main className="confirm-container">
        <div className="confirm-card" ref={cardRef}>
          <div className="confirm-header">
            <div className="badge-success">Payment Success</div>
            <h1>Booking Confirmed</h1>
            <p className="muted">
              Thank you, {fullName}. Your reservation is confirmed.
            </p>
          </div>

          <div className="grid-two">
            {/* LEFT */}
            <section className="panel">
              <h2 className="gold">Stay Details</h2>
              <div className="rows">
                <div className="row"><span>Booking ID</span> <strong>{booking.booking_id}</strong></div>
                <div className="row"><span>Name</span> <strong>{fullName}</strong></div>
                <div className="row"><span>Phone</span> <strong>{booking.phone_entered}</strong></div>
                <div className="row"><span>Check-in</span> <strong>{fmtDate(booking.checkin_date)}</strong></div>
                <div className="row"><span>Check-out</span> <strong>{fmtDate(booking.checkout_date)}</strong></div>
                <div className="row"><span>Nights</span> <strong>{nights}</strong></div>
                <div className="row"><span>Guests</span> <strong>{booking.guest_count}</strong></div>
              </div>
            </section>

            {/* RIGHT */}
            <section className="panel">
              <h2 className="gold">Room & Payment</h2>
              <div className="rows">
                <div className="row"><span>Room</span> <strong>{room.name} — No.{room.room_number}</strong></div>
                <div className="row"><span>Capacity</span> <strong>{room.capacity} guests</strong></div>
                <div className="row"><span>Subtotal</span> <strong>{fmt(booking.subtotal_amount)}</strong></div>
                <div className="row"><span>Discount</span> <strong>-{fmt(booking.discount_amount)}</strong></div>
                <div className="row total"><span>Total</span> <strong>{fmt(booking.total_amount)}</strong></div>
                <div className="row"><span>Method</span> <strong>{payment.method}</strong></div>
                <div className="row"><span>Ref</span> <strong>{payment.provider_txn_ref}</strong></div>
                <div className="row">
                  <span>Status</span>
                  <strong className={payment.payment_status === "Success" ? "ok" : "warn"}>
                    {payment.payment_status}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          <div className="footer-note">
            Confirmation recorded on {fmtDate(booking.created_at)}.
          </div>
        </div>

        {saveError && <div className="error">{saveError}</div>}

        <div className="actions">
          <button className="btn btn-gold" onClick={() => navigate("/")}>
            Back to Home
          </button>

          {/* View / Save PDF */}
          <button className="btn" onClick={handleViewPDF} disabled={saving}>
            {saving ? "Generating…" : "View PDF"}
          </button>
          <button className="btn" onClick={handleSavePDF} disabled={saving}>
            {saving ? "Saving…" : "Save as PDF"}
          </button>

          <button className="btn btn-dark" onClick={saveAsImage} disabled={saving}>
            {saving ? "Saving…" : "Save as PNG"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}