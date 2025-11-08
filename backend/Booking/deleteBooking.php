<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// ✅ เชื่อมต่อฐานข้อมูล
include_once(__DIR__ . "/../config/db_connect.php");

// ✅ รับข้อมูลจาก frontend
$data = json_decode(file_get_contents("php://input"), true);
$booking_id = $data["booking_id"] ?? null;

if (!$booking_id) {
    echo json_encode([
        "success" => false,
        "message" => "No booking_id provided."
    ]);
    exit;
}

// ✅ เตรียมคำสั่ง SQL ลบข้อมูล
$sql = "DELETE FROM booking WHERE booking_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $booking_id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Booking ID #$booking_id deleted successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete booking: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
