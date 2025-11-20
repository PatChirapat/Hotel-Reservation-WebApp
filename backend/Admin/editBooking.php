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

$requestUserId = intval($data['request_user_id'] ?? 0);
requireAdmin($conn, $requestUserId);

$bookingId = intval($data['booking_id'] ?? 0);
$field     = $data['field'] ?? "";
$newValue  = $data['new_value'] ?? "";

$allowed = ['room_type_id', 'checkin_date', 'checkout_date', 'guest_count', 'booking_status'];
if (!in_array($field, $allowed, true)) {
    echo json_encode(["success" => false, "message" => "Invalid field"]);
    exit;
}

// update field
$sql = "UPDATE booking SET $field=? WHERE booking_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $newValue, $bookingId);
$stmt->execute();
$stmt->close();

// recal total
$sql2 = "SELECT b.checkin_date, b.checkout_date, rt.base_price
        FROM booking b JOIN room_type rt ON b.room_type_id=rt.room_type_id
        WHERE b.booking_id=?";
$stmt2 = $conn->prepare($sql2);
$stmt2->bind_param("i", $bookingId);
$stmt2->execute();
$row = $stmt2->get_result()->fetch_assoc();
$stmt2->close();

if ($row) {
    $checkin  = new DateTime($row['checkin_date']);
    $checkout = new DateTime($row['checkout_date']);
    $nights   = max($checkin->diff($checkout)->days, 1);
    $total    = floatval($row['base_price']) * $nights;

    $u = $conn->prepare("UPDATE booking SET total_amount=? WHERE booking_id=?");
    $u->bind_param("di", $total, $bookingId);
    $u->execute();
    $u->close();
}

logActivity(
    $conn,
    $requestUserId,
    "ADMIN_EDIT_BOOKING",
    "Admin {$requestUserId}: edited booking {$bookingId}({$field} -> {$newValue})"
);

echo json_encode([
    "success" => true,
    "message" => "Booking edited",
    "booking_id" => $bookingId
]);
