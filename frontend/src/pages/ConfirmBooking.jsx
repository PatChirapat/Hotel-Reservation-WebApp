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

  // BOOKING / ROOM / PAYMENT (real data only from navigation state)
  const booking = state?.booking ?? null;
  const room = state?.room ?? null;
  const payment = state?.payment ?? null;

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
    if (!booking) return 0;
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

  // Derive safe room label and capacity from real data
  const roomLabel = (() => {
    if (!room && !booking) return "Room";
    const baseName =
      room?.name ||
      booking?.room_type_name ||
      "Room";
    const num =
      room?.room_number ||
      booking?.room_number ||
      "";
    return num ? `${baseName} — No.${num}` : baseName;
  })();

  // Room type name to use for capacity lookup
  const roomTypeName =
    room?.name ||
    booking?.room_type_name ||
    null;

  // Capacity mapping based on room_type table (Classic=2, others=3)
  const capacityByRoomType = {
    Classic: 2,
    Premier: 3,
    Executive: 3,
    Diplomatic: 3,
    Royal: 3,
  };

  const roomCapacity =
    room?.capacity ??
    booking?.capacity ??
    (roomTypeName ? capacityByRoomType[roomTypeName] ?? null : null);

  const bookingStatus = booking?.booking_status || "Pending";

  // Prefer payment information coming from the booking row (DB),
  // then fall back to explicit payment state, and finally to safe defaults.
  const paymentStatus =
    booking?.payment_status ||
    payment?.payment_status ||
    "Pending";

  const paymentMethod =
    booking?.payment_method ||
    payment?.method ||
    "-";

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
      const idForFile = booking?.booking_id ?? "unknown";
      link.download = `booking_${idForFile}.png`;
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

      const idForFile = booking?.booking_id ?? "unknown";
      if (mode === "save") {
        pdf.save(`booking_${idForFile}.pdf`);
      } else {
        const url = pdf.output("bloburl");
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error(err);
      // Disable PDF error message completely
      setSaveError("");
      window.print();
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

  // After confirmation page renders, mark PDF init once (no auto-generate to avoid popup blocking)
  useEffect(() => {
    if (autoPDFOnceRef.current) return;
    autoPDFOnceRef.current = true;
  }, []);

  return (
    <div className="confirm-page">
      <Navbar />

      <main className="confirm-container">
        <div className="confirm-card" ref={cardRef}>
          <div className="confirm-header">
            <div className="badge-success">
              {bookingStatus === "Cancelled"
                ? "Booking Cancelled"
                : paymentStatus === "Success"
                ? "Payment Success"
                : "Payment Pending"}
            </div>
            <h1>
              {bookingStatus === "Confirmed"
                ? "Booking Confirmed"
                : bookingStatus === "Cancelled"
                ? "Booking Cancelled"
                : "Booking Summary"}
            </h1>
            <p className="muted">
              Thank you, {fullName}. Your reservation status is{" "}
              {bookingStatus.toLowerCase()}.
            </p>
          </div>

          <div className="grid-two">
            {/* LEFT */}
            <section className="panel">
              <h2 className="gold">Stay Details</h2>
              <div className="rows">
                <div className="row"><span>Booking ID</span> <strong>{booking?.booking_id ?? "-"}</strong></div>
                <div className="row"><span>Name</span> <strong>{fullName}</strong></div>
                <div className="row"><span>Phone</span> <strong>{booking?.phone_entered ?? "-"}</strong></div>
                <div className="row"><span>Check-in</span> <strong>{booking?.checkin_date ? fmtDate(booking.checkin_date) : "-"}</strong></div>
                <div className="row"><span>Check-out</span> <strong>{booking?.checkout_date ? fmtDate(booking.checkout_date) : "-"}</strong></div>
                <div className="row"><span>Nights</span> <strong>{nights}</strong></div>
                <div className="row"><span>Guests</span> <strong>{booking?.guest_count ?? "-"}</strong></div>
              </div>
            </section>

            {/* RIGHT */}
            <section className="panel">
              <h2 className="gold">Room & Payment</h2>
              <div className="rows">
                <div className="row"><span>Room</span> <strong>{roomLabel}</strong></div>
                <div className="row"><span>Capacity</span> <strong>{roomCapacity != null ? `${roomCapacity} guests` : "-"}</strong></div>
                <div className="row"><span>Subtotal</span> <strong>{fmt(booking.subtotal_amount)}</strong></div>
                <div className="row"><span>Discount</span> <strong>-{fmt(booking.discount_amount)}</strong></div>
                <div className="row total"><span>Total</span> <strong>{fmt(booking.total_amount)}</strong></div>
                <div className="row"><span>Method</span> <strong>{paymentMethod}</strong></div>
                <div className="row">
                  <span>Status</span>
                  <strong className={paymentStatus === "Success" ? "ok" : "warn"}>
                    {paymentStatus}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          <div className="footer-note">
            Confirmation recorded on{" "}
            {booking?.created_at ? fmtDate(booking.created_at) : "-"}.
          </div>
        </div>

        <div className="actions">

          {/* View / Save PDF */}
          <button className="btn" onClick={handleViewPDF} disabled={saving}>
            {saving ? "Generating…" : "View PDF"}
          </button>
          <button className="btn" onClick={handleSavePDF} disabled={saving}>
            {saving ? "Saving…" : "Save as PDF"}
          </button>

        </div>
      </main>

      <Footer />
    </div>
  );
}