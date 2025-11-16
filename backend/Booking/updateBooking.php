<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../api/utils/authorize.php';
require_once __DIR__ . '/../api/utils/auth.php';

$data = json_decode(file_get_contents("php://input"), true);

// --------------------
// Basic input
// --------------------
$booking_id = intval($data["booking_id"] ?? 0);
$member_id  = intval($data["member_id"] ?? 0);

if ($booking_id <= 0 || $member_id <= 0) {
    echo json_encode(["success" => false, "message" => "Missing booking_id or member_id"]);
    exit;
}

// ต้องเป็น user ที่ login จริง
requireUser($conn, $member_id);

// --------------------
// เช็ค owner ก่อน
// --------------------
$stmt = $conn->prepare("SELECT member_id FROM booking WHERE booking_id=?");
$stmt->bind_param("i", $booking_id);
$stmt->execute();
$owner = $stmt->get_result()->fetch_assoc()['member_id'] ?? null;
$stmt->close();

requireOwner($owner, $member_id);

// --------------------
// 1) เคส Cancel Booking (ปุ่ม Delete ในหน้า BookingConfirmation)
// --------------------
if (isset($data['action']) && $data['action'] === 'cancelAndMarkSuccess') {

    // เปลี่ยนสถานะ booking เป็น Cancelled
    $stmt = $conn->prepare("UPDATE booking SET booking_status='Cancelled' WHERE booking_id=?");
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    $stmt->close();

    logActivity(
        $conn,
        $member_id,
        "USER_CANCEL_BOOKING",
        "User{$member_id}: cancelled booking {$booking_id}"
    );

    echo json_encode([
        "success" => true,
        "message" => "Booking cancelled",
        "booking_id" => $booking_id
    ]);
    exit;
}

// --------------------
// 2) Default: Dynamic update fields (ใช้กับ Edit / Update All)
// --------------------
$allowed = [
    "room_type_id",
    "checkin_date",
    "checkout_date",
    "guest_count",
    "subtotal_amount",
    "discount_amount",
    "total_amount"
];

$setParts = [];
$values = [];
$types = "";

// วนทุก field ที่อนุญาต ถ้ามีใน $data ก็เอามาอัปเดต
foreach ($allowed as $field) {
    if (isset($data[$field])) {
        $setParts[] = "$field=?";
        $values[] = $data[$field];
        $types .= "s";
    }
}

if (empty($setParts)) {
    echo json_encode(["success" => false, "message" => "No valid fields"]);
    exit;
}

$sql = "UPDATE booking SET " . implode(",", $setParts) . " WHERE booking_id=?";
$stmt = $conn->prepare($sql);

// เพิ่ม type และค่า booking_id ต่อท้าย
$types .= "i";
$values[] = $booking_id;

$stmt->bind_param($types, ...$values);
$stmt->execute();
$stmt->close();

// log ว่า user แก้ booking
logActivity(
    $conn,
    $member_id,
    "USER_EDIT_BOOKING",
    "User{$member_id}: edited booking {$booking_id}"
);

echo json_encode(["success" => true, "message" => "Booking updated"]);
