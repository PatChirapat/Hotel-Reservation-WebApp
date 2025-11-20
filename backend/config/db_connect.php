<?php
$DB_HOST = 'localhost';
$DB_USER = 'hotel_user';
$DB_PASS = 'UserPass123!';
$DB_NAME = 'hotel_db';
$DB_PORT = 8889;

$conn = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
if ($conn->connect_error) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(["success" => false, "error" => "DB connection failed: ".$conn->connect_error]);
  exit;
}
$conn->set_charset('utf8mb4');