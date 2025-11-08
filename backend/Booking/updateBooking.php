<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");


// Connect to database
$servername = "localhost";
$username = "root";
$password = "root"; // MAMP default
$dbname = "hotel_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// Get JSON body
$data = json_decode(file_get_contents("php://input"), true);

// Validate
if (!isset($data["booking_id"])) {
    echo json_encode(["success" => false, "message" => "Missing booking_id"]);
    exit;
}

$booking_id = $data["booking_id"];
$fields = [];

// Build dynamic update query based on what was sent
if (isset($data["checkin_date"])) $fields[] = "checkin_date = '" . $conn->real_escape_string($data["checkin_date"]) . "'";
if (isset($data["checkout_date"])) $fields[] = "checkout_date = '" . $conn->real_escape_string($data["checkout_date"]) . "'";
if (isset($data["guest_count"])) $fields[] = "guest_count = " . intval($data["guest_count"]);
if (isset($data["booking_status"])) $fields[] = "booking_status = '" . $conn->real_escape_string($data["booking_status"]) . "'";
if (isset($data["subtotal_amount"])) $fields[] = "subtotal_amount = " . floatval($data["subtotal_amount"]);
if (isset($data["discount_amount"])) $fields[] = "discount_amount = " . floatval($data["discount_amount"]);
if (isset($data["total_amount"])) $fields[] = "total_amount = " . floatval($data["total_amount"]);

if (empty($fields)) {
    echo json_encode(["success" => false, "message" => "No fields to update"]);
    exit;
}

$sql = "UPDATE booking SET " . implode(", ", $fields) . " WHERE booking_id = " . intval($booking_id);

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Booking updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error updating booking: " . $conn->error]);
}

$conn->close();
?>
