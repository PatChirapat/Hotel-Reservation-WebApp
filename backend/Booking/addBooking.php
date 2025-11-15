<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db_connect.php';

// รับข้อมูลจาก frontend (JSON)
$data = json_decode(file_get_contents("php://input"), true);

/* 
==========================================
🟩 เพิ่มส่วนใหม่: รองรับหลายห้อง
ถ้า frontend ส่งข้อมูลเป็น { "bookings": [ {...}, {...} ] }
จะใช้โค้ดนี้แทนส่วนเดิม
==========================================
*/
if (isset($data["bookings"]) && is_array($data["bookings"])) {

    $stmt = $conn->prepare("
        INSERT INTO booking (
            member_id, 
            room_type_id,
            phone_entered, 
            checkin_date, 
            checkout_date, 
            guest_count, 
            booking_status, 
            subtotal_amount, 
            discount_amount, 
            total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)
    ");

    $booking_ids = [];

    foreach ($data["bookings"] as $b) {
        // ตรวจสอบว่าข้อมูลครบไหม
        if (
            !isset($b["phone_entered"]) ||
            !isset($b["room_type_id"]) ||
            !isset($b["checkin_date"]) ||
            !isset($b["checkout_date"]) ||
            !isset($b["guest_count"]) ||
            !isset($b["subtotal_amount"]) ||
            !isset($b["discount_amount"]) ||
            !isset($b["total_amount"])
        ) {
            continue; // ข้ามถ้าไม่ครบ
        }

        $member_id = isset($b["member_id"]) ? $b["member_id"] : null;

        $stmt->bind_param(
            "iisssdddd",
            $member_id,
            $b["room_type_id"],
            $b["phone_entered"],
            $b["checkin_date"],
            $b["checkout_date"],
            $b["guest_count"],
            $b["subtotal_amount"],
            $b["discount_amount"],
            $b["total_amount"]
        );

        if ($stmt->execute()) {
            $booking_ids[] = $conn->insert_id;
        }
    }

    // ส่งกลับถ้ามีการเพิ่มสำเร็จ
    if (count($booking_ids) > 0) {
        echo json_encode([
            "success" => true,
            "message" => "✅ Multiple bookings added successfully",
            "booking_ids" => $booking_ids
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "❌ No bookings added (check input data)"
        ]);
    }

    $stmt->close();
    $conn->close();
    exit;
}
/* 🟩 จบส่วนใหม่ — ถ้าไม่ได้ส่ง bookings แบบหลายรายการ จะทำงานส่วนเดิมต่อไป */




// 🟦 ส่วนเดิม (จองเดียว) — คงไว้เหมือนต้นฉบับของคุณ
if (
    !isset($data["phone_entered"]) ||
    !isset($data["room_type_id"]) ||
    !isset($data["checkin_date"]) ||
    !isset($data["checkout_date"]) ||
    !isset($data["guest_count"]) ||
    !isset($data["subtotal_amount"]) ||
    !isset($data["discount_amount"]) ||
    !isset($data["total_amount"])
) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// เตรียมคำสั่ง SQL
$stmt = $conn->prepare("
    INSERT INTO booking (
        member_id, 
        room_type_id,
        phone_entered, 
        checkin_date, 
        checkout_date, 
        guest_count, 
        booking_status, 
        subtotal_amount, 
        discount_amount, 
        total_amount
    ) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)
");

$member_id = isset($data["member_id"]) ? $data["member_id"] : null;

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

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Booking added successfully",
        "booking_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $stmt->error
    ]);
}


$stmt->close();
$conn->close();
?>