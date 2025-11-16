<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header("Content-Type: application/json; charset=utf-8");
error_reporting(0);

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../api/utils/authorize.php';
require_once __DIR__ . '/../api/utils/auth.php';

$data = json_decode(file_get_contents("php://input"), true);

$request_user_id = intval($data['request_user_id'] ?? 0);
$targetUserId    = intval($data['member_id'] ?? 0);
$field           = $data['field'] ?? "";
$newValue        = $data['new_value'] ?? "";

requireAdmin($conn, $request_user_id);

$allowed = ['first_name','last_name','phone','email','username','tier','role'];
if (!in_array($field, $allowed)) {
    echo json_encode(["success" => false, "message" => "Invalid field"]);
    exit;
}

# special rule: role lowercase
if ($field === "role") {
    $newValue = strtolower($newValue);
}

$sql = "UPDATE member SET $field=? WHERE member_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $newValue, $targetUserId);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => $stmt->error]);
    exit;
}
$stmt->close();

logActivity($conn, $request_user_id, "ADMIN_EDIT_USER", "Edited user $targetUserId");

echo json_encode([
    "success" => true,
    "message" => "User updated",
    "member_id" => $targetUserId
]);
