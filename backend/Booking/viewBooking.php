<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// ✅ แก้ path ให้ถูกต้อง (ชี้ไปยัง backend/config/db_connect.php)
include_once(__DIR__ . "/../config/db_connect.php");

$data = json_decode(file_get_contents("php://input"), true);
$ids = $data['booking_ids'] ?? [];

// ✅ ถ้ามี id เดียว (ไม่ใช่ array) ให้แปลงเป็น array
if (!is_array($ids)) {
    $ids = [$ids];
}

if (empty($ids)) {
    echo json_encode(["success" => false, "message" => "No booking IDs provided"]);
    exit;
}

$id_placeholders = implode(',', array_fill(0, count($ids), '?'));
$types = str_repeat('i', count($ids));

$sql = "SELECT 
            b.booking_id,
            b.member_id,
            b.room_type_id,
            rt.name AS room_type_name,
            b.phone_entered,
            b.checkin_date,
            b.checkout_date,
            b.guest_count,
            b.booking_status,
            b.subtotal_amount,
            b.discount_amount,
            b.total_amount,
            b.created_at
        FROM booking b
        JOIN room_type rt ON b.room_type_id = rt.room_type_id
        WHERE b.booking_id IN ($id_placeholders)";

$stmt = $conn->prepare($sql);

// ✅ ป้องกัน error ถ้า prepare() ล้มเหลว
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Failed to prepare SQL: " . $conn->error]);
    exit;
}

// ✅ bind parameter แบบ dynamic (ใช้ reference)
$a_params = [];
$a_params[] = & $types;
for ($i = 0; $i < count($ids); $i++) {
    $a_params[] = & $ids[$i];
}
call_user_func_array([$stmt, 'bind_param'], $a_params);

$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode([
    "success" => true,
    "bookings" => $bookings
]);

$stmt->close();
$conn->close();
?>
