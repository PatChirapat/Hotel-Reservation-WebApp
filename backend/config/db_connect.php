<?php
// backend/config/db_connect.php
// Minimal DB connector for MAMP. Do NOT echo anything here.

$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = 'root';
$DB_NAME = 'hotel_db';
$DB_PORT = 8889; // MAMP MySQL default port. Change if yours differs.

$conn = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
if ($conn->connect_error) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(["success" => false, "error" => "DB connection failed: ".$conn->connect_error]);
  exit;
}
$conn->set_charset('utf8mb4');