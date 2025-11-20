<?php
require_once __DIR__ . '/../../config/cors.php';
header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/db_connect_dev.php';

// อ่าน logs (ล่าสุด 200)
$sql = "SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 200";
$res = $conn->query($sql);

$logs = [];
while ($row = $res->fetch_assoc()) {
    $logs[] = $row;
}

echo json_encode([
    "success" => true,
    "logs" => $logs
], JSON_UNESCAPED_UNICODE);

$conn->close();
