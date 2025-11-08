<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

include_once __DIR__ . '/../config/db_connect.php';

$sql = "SELECT room_type_id, name FROM room_type ORDER BY room_type_id ASC";
$result = $conn->query($sql);

$room_types = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $room_types[] = $row;
    }
    echo json_encode($room_types, JSON_UNESCAPED_UNICODE);
} 
else {
    echo json_encode([]);
}

$conn->close();
?>
