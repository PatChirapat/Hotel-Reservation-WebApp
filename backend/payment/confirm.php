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
  $sel = $conn->prepare("SELECT booking_id, member_id, phone_entered, checkin_date, checkout_date, guest_count, subtotal_amount, discount_amount, total_amount, booking_status, created_at FROM booking WHERE booking_id=?");
  $ins = $conn->prepare("INSERT INTO payment (booking_id, amount, method, provider_txn_ref, payment_status, paid_at) VALUES (?, ?, ?, CONCAT('SIM-', UUID()), 'Success', NOW())");

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
    $ins->bind_param('ids', $bid, $amount, $method);
    if (!$ins->execute()) { throw new Exception($ins->error); }

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