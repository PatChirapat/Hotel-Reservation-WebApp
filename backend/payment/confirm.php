<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/db_connect.php';

$body = json_decode(file_get_contents('php://input'), true) ?: [];

$method = $body['method'] ?? 'QR';
$validMethods = ['Credit','Debit','Cash','QR'];
if (!in_array($method, $validMethods, true)) {
  echo json_encode(["success"=>false,"message"=>"Invalid method"]); exit;
}

$booking_ids = [];
if (isset($body['booking_id'])) {
  $booking_ids[] = (int)$body['booking_id'];
}
if (isset($body['booking_ids']) && is_array($body['booking_ids'])) {
  foreach ($body['booking_ids'] as $bid) { $booking_ids[] = (int)$bid; }
}
$booking_ids = array_values(array_unique(array_filter($booking_ids)));

if (!$booking_ids) {
  echo json_encode(["success"=>false,"message"=>"Missing booking_id(s)"]); exit;
}

try {
  $conn->begin_transaction();

  // เตรียม statement
  $sel = $conn->prepare("SELECT booking_id, member_id, room_type_id, phone_entered, checkin_date, checkout_date, guest_count, subtotal_amount, discount_amount, total_amount, booking_status, created_at FROM booking WHERE booking_id=?");
  $ins = $conn->prepare("INSERT INTO payment (booking_id, amount, method, provider_txn_ref, payment_status, paid_at) VALUES (?, ?, ?, CONCAT('SIM-', UUID()), 'Success', NOW())");

  // หา room_id ที่ว่างสำหรับ room_type + ช่วงวันที่ของ booking นี้
  $findRoom = $conn->prepare("
    SELECT r.room_id
    FROM room r
    WHERE r.room_type_id = ?
      AND r.status = 'Available'
      AND r.room_id NOT IN (
        SELECT bn.room_id
        FROM booking_night bn
        JOIN booking b2 ON b2.booking_id = bn.booking_id
        WHERE b2.booking_status IN ('Pending', 'Confirmed')
          AND bn.stay_date >= ?
          AND bn.stay_date <  ?
      )
    LIMIT 1
  ");
  if (!$findRoom) { throw new Exception($conn->error); }

  $payments = [];
  $bookings = [];

  foreach ($booking_ids as $bid) {
    // ดึง booking
    $sel->bind_param('i', $bid);
    if (!$sel->execute()) { throw new Exception($sel->error); }
    $res = $sel->get_result();
    $b = $res->fetch_assoc();
    if (!$b) { throw new Exception("Booking not found: ".$bid); }

    $amount = (float)$b['total_amount'];
    $roomTypeId = (int)$b['room_type_id'];
    $checkinDate = $b['checkin_date'];
    $checkoutDate = $b['checkout_date'];

    // Try to update an existing Pending payment first
    $upd = $conn->prepare("UPDATE payment SET amount=?, method=?, provider_txn_ref=CONCAT('SIM-', UUID()), payment_status='Success', paid_at=NOW() WHERE booking_id=? AND payment_status='Pending'");
    if (!$upd) { throw new Exception($conn->error); }
    $upd->bind_param('dsi', $amount, $method, $bid);
    if (!$upd->execute()) { throw new Exception($upd->error); }

    if ($upd->affected_rows === 0) {
      // No pending row existed -> insert a new Success record
      $ins->bind_param('ids', $bid, $amount, $method);
      if (!$ins->execute()) { throw new Exception($ins->error); }
    }
    $upd->close();

    // หา room_id ที่ว่างสำหรับ booking นี้
    $findRoom->bind_param('iss', $roomTypeId, $checkinDate, $checkoutDate);
    if (!$findRoom->execute()) {
      throw new Exception($findRoom->error);
    }
    $findRoom->bind_result($roomId);
    if (!$findRoom->fetch()) {
      $findRoom->free_result();
      throw new Exception("No available room for booking_id ".$bid);
    }
    $findRoom->free_result();

    // สร้าง booking_night ผ่าน Stored Procedure
    $proc = $conn->prepare("CALL GenerateBookingNightsForBooking(?, ?)");
    if (!$proc) { throw new Exception($conn->error); }
    $proc->bind_param('ii', $bid, $roomId);
    if (!$proc->execute()) {
      $err = $proc->error;
      $proc->close();
      throw new Exception("Failed to generate booking nights: ".$err);
    }
    $proc->close();

    // เคลียร์ result set เพิ่มเติมจาก CALL (กัน commands out of sync)
    while ($conn->more_results() && $conn->next_result()) {
      $extra = $conn->use_result();
      if ($extra instanceof mysqli_result) {
        $extra->free();
      }
    }

    $payments[] = [
      "booking_id" => $bid,
      "amount" => $amount,
      "method" => $method,
      "provider_txn_ref" => "SIM-".uniqid(), // client display ref (server uses UUID above)
      "payment_status" => "Success",
      "paid_at" => date('c'),
    ];
    $bookings[] = $b;
  }

  // อัปเดตสถานะ booking
  $ph = implode(',', array_fill(0, count($booking_ids), '?'));
  $types = str_repeat('i', count($booking_ids));
  $sql = "UPDATE booking SET booking_status='Confirmed' WHERE booking_id IN ($ph)";
  $up = $conn->prepare($sql);
  $up->bind_param($types, ...$booking_ids);
  if (!$up->execute()) { throw new Exception($up->error); }

  if (isset($findRoom) && $findRoom instanceof mysqli_stmt) {
    $findRoom->close();
  }

  $conn->commit();

  echo json_encode([
    "success" => true,
    "message" => "Payment confirmed",
    "booking_ids" => $booking_ids,
    "payments" => $payments,
    "bookings" => $bookings, // เผื่อหน้า ConfirmBooking อยากใช้ข้อมูลจริง
  ]);
} catch (Throwable $e) {
  $conn->rollback();
  http_response_code(500);
  echo json_encode(["success"=>false,"message"=>"Payment failed","detail"=>$e->getMessage()]);
}
$conn->close();