<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include_once __DIR__ . '/../config/db_connect.php';

// รับ json ที่ axios ส่งมา
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data["first_name"]) && isset($data["last_name"]) && isset($data["phone"]) && 
isset($data["email"]) && isset($data["tier"])) {
    $first_name = $conn->real_escape_string($data["first_name"]);
    $last_name = $conn->real_escape_string($data["last_name"]);
    $phone = $conn->real_escape_string($data["phone"]);
    $email = $conn->real_escape_string($data["email"]);
    $tier = $conn->real_escape_string($data["tier"]);

    $sql = "INSERT INTO member (first_name, last_name, phone, email, tier) 
            VALUES ('$first_name', '$last_name', '$phone', '$email', '$tier')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "User added successfully"]);} 
    else {
        echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    }
} 
else {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
}

$conn->close();
?>
