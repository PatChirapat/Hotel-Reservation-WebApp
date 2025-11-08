<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include_once __DIR__ . '/../config/db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['booking_id']) || !isset($data['field']) || !isset($data['new_value'])) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

$booking_id = $data['booking_id'];
$field = $data['field'];
$new_value = $data['new_value'];

$allowed = ['room_type_id', 'checkin_date', 'checkout_date', 'guest_count', 'booking_status'];
if (!in_array($field, $allowed)) {
    echo json_encode(["success" => false, "message" => "Invalid field"]);
    exit;
}

$sql = "UPDATE booking SET $field = ? WHERE booking_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $new_value, $booking_id);
$stmt->execute();
$stmt->close();

$sql_get = "
    SELECT 
        b.checkin_date, 
        b.checkout_date, 
        b.room_type_id,
        rt.base_price
    FROM booking b
    JOIN room_type rt ON b.room_type_id = rt.room_type_id
    WHERE b.booking_id = ?
";
$stmt2 = $conn->prepare($sql_get);
$stmt2->bind_param("i", $booking_id);
$stmt2->execute();
$result = $stmt2->get_result();
$data_now = $result->fetch_assoc();
$stmt2->close();

if ($data_now) {
    $checkin = new DateTime($data_now['checkin_date']);
    $checkout = new DateTime($data_now['checkout_date']);
    $interval = $checkin->diff($checkout);
    $nights = max($interval->days, 1);

    $base_price = floatval($data_now['base_price']);
    $total_amount = $base_price * $nights;

    $update_total = "UPDATE booking SET total_amount = ? WHERE booking_id = ?";
    $stmt3 = $conn->prepare($update_total);
    $stmt3->bind_param("di", $total_amount, $booking_id);
    $stmt3->execute();
    $stmt3->close();
}

echo json_encode(["success" => true, "message" => "Booking updated successfully"]);
$conn->close();
?>
