<?php
require_once __DIR__ . '/../config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../api/utils/authorize.php';
require_once __DIR__ . '/../api/utils/auth.php';

$data = json_decode(file_get_contents("php://input"), true);

$booking_id = intval($data["booking_id"] ?? 0);
$member_id  = intval($data["member_id"] ?? 0);

requireUser($conn, $member_id);

// ---- CHECK OWNER ----
$stmt = $conn->prepare("SELECT member_id FROM booking WHERE booking_id=?");
$stmt->bind_param("i", $booking_id);
$stmt->execute();
$owner = $stmt->get_result()->fetch_assoc()['member_id'] ?? null;
$stmt->close();

requireOwner($owner, $member_id);

$stmt = $conn->prepare("DELETE FROM booking WHERE booking_id=?");
$stmt->bind_param("i", $booking_id);
$stmt->execute();
$stmt->close();

logActivity(
    $conn,
    $member_id,
    "USER_DELETE_BOOKING",
    "User{$member_id}: deleted booking {$booking_id}"
);

echo json_encode(["success"=>true, "message"=>"Booking deleted"]);
