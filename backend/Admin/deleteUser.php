<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header("Content-Type: application/json; charset=utf-8");
error_reporting(0);

require_once __DIR__ . '/../config/db_connect_admin.php';
require_once __DIR__ . '/../api/utils/authorize.php';
require_once __DIR__ . '/../api/utils/auth.php';

$data = json_decode(file_get_contents("php://input"), true);

$request_user_id = intval($data['request_user_id'] ?? 0);
$targetUserId    = intval($data['member_id'] ?? 0);

requireAdmin($conn, $request_user_id);

# ตรวจว่ามี booking ที่ยังค้างอยู่ไหม
$stmt = $conn->prepare("SELECT booking_id FROM booking WHERE member_id=?");
$stmt->bind_param("i", $targetUserId);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Cannot delete this user because they have existing bookings."
    ]);
    exit;
}
$stmt->close();

$sql = "DELETE FROM member WHERE member_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $targetUserId);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);
    exit;
}
$stmt->close();

logActivity(
    $conn, 
    $request_user_id, 
    "ADMIN_DELETE_USER", 
    "Admin{$request_user_id}: Deleted user $targetUserId");

echo json_encode([
    "success" => true,
    "message" => "User deleted",
    "member_id" => $targetUserId
]);
