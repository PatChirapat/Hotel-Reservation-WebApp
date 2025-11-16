<?php
require_once __DIR__ . '/../utils/authorize.php';

$data = json_decode(file_get_contents("php://input"), true);
$request_user_id = intval($data['request_user_id'] ?? 0);

requireDeveloper($conn, $request_user_id);

$sql = "SELECT * FROM activity_log ORDER BY log_id DESC LIMIT 200";
$res = $conn->query($sql);

$rows = [];
while ($r = $res->fetch_assoc()) { $rows[] = $r; }

echo json_encode(["success" => true, "logs" => $rows]);
