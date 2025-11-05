<?php
$servername = "localhost";
$username = "root";
$password = "root";
$database = "hotel_db";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");
?>