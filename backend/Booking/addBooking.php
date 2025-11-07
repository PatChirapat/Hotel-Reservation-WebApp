<?php
header("Access-Control-Allow-Origin: *"); // อนุญาตให้ frontend เข้าถึง
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// เชื่อมต่อฐานข้อมูล
$servername = "localhost";
$username = "root";
$password = "root"; // สำหรับ MAMP ปกติจะเป็น root
$dbname = "hotel_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// รับข้อมูลจาก frontend (JSON)
$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data["phone_entered"]) ||
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
        phone_entered, 
        checkin_date, 
        checkout_date, 
        guest_count, 
        booking_status, 
        subtotal_amount, 
        discount_amount, 
        total_amount
    ) VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?)
");

$member_id = isset($data["member_id"]) ? $data["member_id"] : null;

$stmt->bind_param(
    "isssdddd",
    $member_id,
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
