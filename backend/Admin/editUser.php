<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../config/db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

// ตรวจว่าข้อมูลครบมั้ย
if (!isset($data['member_id'], $data['field'], $data['value'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields."
    ]);
    exit;
}

$member_id = intval($data['member_id']);
$field = $data['field'];
$value = $data['value'];

// col ที่แก้ได้(อิงตามที่ view ได้)
$allowed_fields = ['username', 'first_name', 'last_name', 'phone', 'email', 'tier'];
if (!in_array($field, $allowed_fields)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid field."
    ]);
    exit;
}

// กัน sql injection
$value_safe = $conn->real_escape_string($value);
$sql = "UPDATE member SET $field = '$value_safe' WHERE member_id = $member_id";
$result = $conn->query($sql);

if ($result) {
    echo json_encode([
        "success" => true,
        "message" => "User updated successfully."
    ]);
} 
else {
    echo json_encode([
        "success" => false,
        "message" => "Query failed: " . $conn->error
    ]);
}

$conn->close();
?>
