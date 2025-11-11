<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once(__DIR__ . "/../config/db_connect.php");

// Read JSON input
$body = json_decode(file_get_contents("php://input"), true);
if (!is_array($body)) {
    echo json_encode(["success" => false, "message" => "Invalid JSON body"]);
    exit;
}

// Get parameters
$booking_ids = isset($body['booking_ids']) && is_array($body['booking_ids']) ? $body['booking_ids'] : [];
$member_id   = isset($body['member_id']) ? (int)$body['member_id'] : 0;

if (empty($booking_ids) && $member_id <= 0) {
    echo json_encode(["success" => false, "message" => "No booking IDs or member ID provided"]);
    exit;
}

try {
    // If booking_ids provided → filter by them
    if (!empty($booking_ids)) {
        $ids = array_filter(array_map('intval', $booking_ids), fn($v) => $v > 0);
        if (empty($ids)) {
            echo json_encode(["success" => true, "bookings" => []]);
            exit;
        }

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
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
                    b.payment_status,
                    b.subtotal_amount,
                    b.discount_amount,
                    b.total_amount,
                    b.created_at
                FROM booking b
                JOIN room_type rt ON b.room_type_id = rt.room_type_id
                WHERE b.booking_id IN ($placeholders)
                ORDER BY b.checkin_date DESC";

        $stmt = $conn->prepare($sql);
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
        $stmt->bind_param($types, ...$ids);
    } else {
        // Otherwise, filter by member_id
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
                    b.payment_status,
                    b.subtotal_amount,
                    b.discount_amount,
                    b.total_amount,
                    b.created_at
                FROM booking b
                JOIN room_type rt ON b.room_type_id = rt.room_type_id
                WHERE b.member_id = ?
                ORDER BY b.checkin_date DESC";

        $stmt = $conn->prepare($sql);
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
        $stmt->bind_param('i', $member_id);
    }

    $stmt->execute();
    $res = $stmt->get_result();

    $bookings = [];
    while ($row = $res->fetch_assoc()) {
        $bookings[] = $row;
    }

    echo json_encode(["success" => true, "bookings" => $bookings], JSON_UNESCAPED_UNICODE);
    $stmt->close();
    $conn->close();

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error", "detail" => $e->getMessage()]);
}
?>
