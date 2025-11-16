<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../api/utils/authorize.php';
require_once __DIR__ . '/../api/utils/auth.php';

$data = json_decode(file_get_contents("php://input"), true);

// ------------------------------
// MULTI BOOKING MODE
// ------------------------------
if (isset($data["bookings"]) && is_array($data["bookings"])) {

    $ids = [];

    $stmt = $conn->prepare("
        INSERT INTO booking (
            member_id, room_type_id, phone_entered,
            checkin_date, checkout_date, guest_count,
            booking_status, subtotal_amount, discount_amount, total_amount
        )
        VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)
    ");

    foreach ($data["bookings"] as $b) {

        if (!isset($b["member_id"])) {
            echo json_encode(["success"=>false,"message"=>"Missing member_id"]);
            exit;
        }

        requireUser($conn, $b["member_id"]);

        $stmt->bind_param(
            "iisssdddd",
            $b["member_id"],
            $b["room_type_id"],
            $b["phone_entered"],
            $b["checkin_date"],
            $b["checkout_date"],
            $b["guest_count"],
            $b["subtotal_amount"],
            $b["discount_amount"],
            $b["total_amount"]
        );

        $stmt->execute();
        $newId = $conn->insert_id;
        $ids[] = $newId;

        // 🔥 Log user add booking
        logActivity(
            $conn,
            $b["member_id"],
            "USER_ADD_BOOKING",
            "User{$b["member_id"]}: created booking {$newId}"
        );
    }

    echo json_encode([
        "success" => true,
        "message" => "Multiple bookings added",
        "booking_ids" => $ids
    ]);
    exit;
}

// ------------------------------
// SINGLE BOOKING MODE
// ------------------------------
$member_id = intval($data["member_id"] ?? 0);
requireUser($conn, $member_id);

$stmt = $conn->prepare("
    INSERT INTO booking (
        member_id, room_type_id, phone_entered,
        checkin_date, checkout_date, guest_count,
        booking_status, subtotal_amount, discount_amount, total_amount
    )
    VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)
");

$stmt->bind_param(
    "iisssdddd",
    $member_id,
    $data["room_type_id"],
    $data["phone_entered"],
    $data["checkin_date"],
    $data["checkout_date"],
    $data["guest_count"],
    $data["subtotal_amount"],
    $data["discount_amount"],
    $data["total_amount"]
);

$stmt->execute();
$newId = $stmt->insert_id;

logActivity(
    $conn,
    $member_id,
    "USER_ADD_BOOKING",
    "User{$member_id}: created booking $newId"
);

echo json_encode(["success"=>true, "booking_id"=>$newId]);
