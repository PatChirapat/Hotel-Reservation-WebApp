<?php
// backend/Room/findAvailableTypes.php

require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    $data = [];
}

$checkin  = $data['checkin_date']  ?? null;
$checkout = $data['checkout_date'] ?? null;
$guests   = $data['guest_count']   ?? null;

// Basic validation
if (!$checkin || !$checkout || !$guests) {
    echo json_encode([
        "success" => false,
        "message" => "Missing checkin_date, checkout_date, or guest_count"
    ], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$guests = (int)$guests;

try {
    // CALL FindAvailableRoomTypes(?, ?, ?)
    $stmt = $conn->prepare("CALL FindAvailableRoomTypes(?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("ssi", $checkin, $checkout, $guests);

    if (!$stmt->execute()) {
        $err = $stmt->error;
        $stmt->close();
        throw new Exception("Execute failed: " . $err);
    }

    $result = $stmt->get_result();
    $types = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $types[] = $row;
        }
        $result->free();
    }
    $stmt->close();

    // เคลียร์ result set ค้างจาก CALL (กัน error commands out of sync)
    while ($conn->more_results() && $conn->next_result()) {
        $extra = $conn->use_result();
        if ($extra instanceof mysqli_result) {
            $extra->free();
        }
    }

    echo json_encode([
        "success" => true,
        "room_types" => $types
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to load available room types",
        "detail"  => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    $conn->close();
}