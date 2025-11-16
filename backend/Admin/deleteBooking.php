<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);

ini_set("display_errors", 1);

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../api/utils/authorize.php';
require_once __DIR__ . '/../api/utils/auth.php';

$data = json_decode(file_get_contents("php://input"), true);

$requestUserId = intval($data['request_user_id'] ?? 0);
$bookingId     = intval($data['booking_id'] ?? 0);

requireAdmin($conn, $requestUserId);

// check exists
$q = $conn->prepare("SELECT booking_id FROM booking WHERE booking_id=?");
$q->bind_param("i", $bookingId);
$q->execute();
if (!$q->get_result()->fetch_assoc()) {
    echo json_encode(["success" => false, "message" => "Booking not found"]);
    exit;
}
$q->close();

// delete nights
$delN = $conn->prepare("DELETE FROM booking_night WHERE booking_id=?");
$delN->bind_param("i", $bookingId);
$delN->execute();
$delN->close();

// delete booking
$del = $conn->prepare("DELETE FROM booking WHERE booking_id=?");
$del->bind_param("i", $bookingId);
$del->execute();
$del->close();

logActivity(
    $conn,
    $requestUserId,
    "ADMIN_DELETE_BOOKING",
    "Admin {$requestUserId}: deleted booking {$bookingId}"
);

echo json_encode([
    "success" => true,
    "message" => "Booking deleted",
    "booking_id" => $bookingId
]);
