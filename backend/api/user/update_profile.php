<?php
/**
 * update_profile_simple.php
 * ใช้สำหรับอัปเดตข้อมูลโปรไฟล์ของสมาชิก (ไม่มีรูปโปรไฟล์)
 * รองรับการเรียกจาก React ผ่าน JSON body
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../../config/db_connect.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON body."]);
    exit;
}

if (empty($data["member_id"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "member_id is required."]);
    exit;
}

$member_id = (int)$data["member_id"];
$allowed_fields = ["first_name", "last_name", "username", "email", "phone"];
$updates = [];
$params = [];
$types = "";

// ✅ ตรวจสอบและจัดเก็บเฉพาะฟิลด์ที่อนุญาต
foreach ($allowed_fields as $field) {
    if (isset($data[$field])) {
        $value = trim($data[$field]);
        $updates[] = "$field = ?";
        $params[] = $value;
        $types .= "s";
    }
}

// ❌ ไม่มีฟิลด์ให้อัปเดต
if (empty($updates)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No fields to update."]);
    exit;
}

// ✅ เตรียมคำสั่ง UPDATE
$sql = "UPDATE member SET " . implode(", ", $updates) . " WHERE member_id = ?";
$params[] = $member_id;
$types .= "i";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
    exit;
}

// ✅ bind parameter อย่างปลอดภัย
$stmt->bind_param($types, ...$params);

try {
    if (!$stmt->execute()) {
        throw new Exception("Query failed: " . $stmt->error);
    }

    // ✅ ดึงข้อมูลที่อัปเดตกลับมาส่งให้ frontend
    $res = $conn->prepare("SELECT member_id, first_name, last_name, username, email, phone, tier, join_date FROM member WHERE member_id = ? LIMIT 1");
    $res->bind_param("i", $member_id);
    $res->execute();
    $result = $res->get_result();
    $row = $result->fetch_assoc();

    echo json_encode([
        "success" => true,
        "message" => "Profile updated successfully.",
        "profile" => $row
    ]);

    $res->close();
    $stmt->close();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>