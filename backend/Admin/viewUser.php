<?php
require_once __DIR__ . '/../config/cors.php';
header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);

require_once __DIR__ . '/../config/db_connect.php';

$sql = "SELECT * FROM member";
$result = $conn->query($sql);

$members = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $members[] = $row;
    }
}

echo json_encode($members, JSON_UNESCAPED_UNICODE);
$conn->close();
