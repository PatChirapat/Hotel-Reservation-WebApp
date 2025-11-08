<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include_once __DIR__ . '/../config/db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['booking_id'])) {
    echo json_encode(["success" => false, "message" => "Missing booking_id"]);
    exit;
}

$booking_id = intval($data['booking_id']);

$sql = "DELETE FROM booking WHERE booking_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $booking_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Booking deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete booking"]);
}

$stmt->close();
$conn->close();
?>
