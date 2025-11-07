<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../config/db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['member_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing member_id."
    ]);
    exit;
}

$member_id = intval($data['member_id']);

$sql = "DELETE FROM member WHERE member_id = $member_id";
$result = $conn->query($sql);

if ($result) {
    echo json_encode([
        "success" => true,
        "message" => "User deleted successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete user: " . $conn->error
    ]);
}

$conn->close();
?>
