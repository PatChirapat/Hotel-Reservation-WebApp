<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

include_once __DIR__ . '/../config/db_connect.php';

$sql = "
    SELECT 
        b.booking_id,
        b.checkin_date AS checkin,
        b.checkout_date AS checkout,
        b.guest_count AS guest,
        b.booking_status AS status,
        b.subtotal_amount AS subtotal,
        b.discount_amount AS discount,
        b.total_amount AS total,
        m.username,
        m.first_name,
        m.last_name,
        m.phone,
        rt.room_type_id,
        rt.name AS name,
        rt.base_price
    FROM booking b
    JOIN member m ON b.member_id = m.member_id
    JOIN room_type rt ON b.room_type_id = rt.room_type_id 
    ORDER BY b.created_at ASC";


$result = $conn->query($sql);
$bookings = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
    echo json_encode($bookings, JSON_UNESCAPED_UNICODE);
} 
else {
    echo json_encode([]);
}

$conn->close();
?>
