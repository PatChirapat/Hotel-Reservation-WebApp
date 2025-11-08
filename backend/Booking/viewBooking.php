<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once("../db_connect.php");

$data = json_decode(file_get_contents("php://input"), true);
$ids = $data['booking_ids'] ?? [];

if (empty($ids)) {
    echo json_encode(["success" => false, "message" => "No booking IDs provided"]);
    exit;
}

$id_placeholders = implode(',', array_fill(0, count($ids), '?'));
$types = str_repeat('i', count($ids));

$sql = "SELECT b.*, rt.name AS room_type_name 
        FROM booking b 
        JOIN room_type rt ON b.room_type_id = rt.room_type_id
        WHERE b.booking_id IN ($id_placeholders)";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$ids);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode(["success" => true, "bookings" => $bookings]);
?>
