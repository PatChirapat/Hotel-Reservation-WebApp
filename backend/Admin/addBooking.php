<?php

header("Content-Type: application/json; charset=utf-8");
error_reporting(0);

require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);
ini_set("display_errors", 1);

require_once __DIR__ . '/../config/db_connect_admin.php';
require_once __DIR__ . '/../api/utils/authorize.php';
require_once __DIR__ . '/../api/utils/auth.php';

$data = json_decode(file_get_contents("php://input"), true);

$requestUserId   = intval($data['request_user_id'] ?? 0);
$bookingMemberId = intval($data['member_id'] ?? 0);

requireAdmin($conn, $requestUserId);

$roomTypeId   = intval($data['room_type_id'] ?? 0);
$checkin      = $data['checkin_date'] ?? null;
$checkout     = $data['checkout_date'] ?? null;
$guestCount   = intval($data['guest_count'] ?? 1);
$phoneEntered = $data['phone_entered'] ?? "";
$totalAmount  = floatval($data['total_amount'] ?? 0); // ตอนนี้ไม่คำนวณก็ได้

if (!$bookingMemberId || !$roomTypeId || !$checkin || !$checkout) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$sql = "INSERT INTO booking 
        (member_id, room_type_id, phone_entered, checkin_date, checkout_date, guest_count,
        subtotal_amount, discount_amount, total_amount, booking_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)";

$bookingStatus = $data['booking_status'] ?? 'Pending';

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "iisssidss",
    $bookingMemberId,
    $roomTypeId,
    $phoneEntered,
    $checkin,
    $checkout,
    $guestCount,
    $totalAmount,
    $totalAmount,
    $bookingStatus
);
$stmt->execute();
$bookingId = $stmt->insert_id;
$stmt->close();

logActivity(
    $conn,
    $requestUserId,
    "ADMIN_ADD_BOOKING",
    "Admin {$requestUserId}: created booking {$bookingId} for member{$bookingMemberId}"
);

echo json_encode([
    "success" => true,
    "message" => "Booking added",
    "booking_id" => $bookingId
]);
