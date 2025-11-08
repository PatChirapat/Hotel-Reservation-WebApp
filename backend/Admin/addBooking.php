<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include_once __DIR__ . '/../config/db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['member_id']) ||
    !isset($data['room_type_id']) ||
    !isset($data['checkin_date']) ||
    !isset($data['checkout_date']) ||
    !isset($data['guest_count']) ||
    !isset($data['booking_status'])
) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

$member_id = intval($data['member_id']);
$room_type_id = intval($data['room_type_id']);
$checkin_date = $data['checkin_date'];
$checkout_date = $data['checkout_date'];
$guest_count = intval($data['guest_count']);
$booking_status = $data['booking_status'];

$sql_info = "
    SELECT rt.base_price, m.phone
    FROM room_type rt
    JOIN member m
    ON m.member_id = ?
    WHERE rt.room_type_id = ?
";
$stmt = $conn->prepare($sql_info);
$stmt->bind_param("ii", $member_id, $room_type_id);
$stmt->execute();
$res = $stmt->get_result();
$info = $res->fetch_assoc();
$stmt->close();

if (!$info) {
    echo json_encode(["success" => false, "message" => "Invalid member or room type"]);
    exit;
}

$base_price = floatval($info['base_price']);
$phone_entered = $info['phone'];

$in = new DateTime($checkin_date);
$out = new DateTime($checkout_date);
$days = $in->diff($out)->days;
if ($days <= 0) $days = 1;

$total_amount = $base_price * $days;

$sql_insert = "
    INSERT INTO booking (
        member_id, 
        room_type_id, 
        checkin_date, 
        checkout_date, 
        guest_count, 
        booking_status, 
        phone_entered, 
        total_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql_insert);
$stmt->bind_param(
    "iississd",
    $member_id,
    $room_type_id,
    $checkin_date,
    $checkout_date,
    $guest_count,
    $booking_status,
    $phone_entered,
    $total_amount
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Booking added successfully"]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to add booking",
        "error" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
